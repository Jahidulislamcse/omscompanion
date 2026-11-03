<?php

namespace App\Services;

use App\Models\LandingSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Get configured OneSignal App ID.
     */
    public static function getAppId(): string
    {
        $envVal = config('services.onesignal.app_id');
        if (!empty($envVal)) return $envVal;
        $dbVal = LandingSetting::where('key', 'onesignal_app_id')->value('value');
        if (!empty($dbVal)) return $dbVal;
        return 'cd9df2b6-fda0-463e-bebb-7d8b49edf74c';
    }

    /**
     * Get configured OneSignal REST API Key.
     */
    public static function getRestApiKey(): string
    {
        $envVal = config('services.onesignal.rest_api_key');
        if (!empty($envVal)) return $envVal;
        $dbVal = LandingSetting::where('key', 'onesignal_rest_api_key')->value('value');
        if (!empty($dbVal)) return $dbVal;
        return '';
    }

    /**
     * Normalize URL for mobile app target navigation.
     * Prevents localhost URLs from being sent to mobile devices, defaulting to omscompanion.com domain.
     */
    public static function normalizeTargetUrl(?string $url): string
    {
        if (empty($url)) {
            return 'http://omscompanion.com/admin/referrals';
        }
        if (preg_match('#^https?://localhost(:\d+)?(/.*)?$#i', $url, $matches)) {
            $path = $matches[2] ?? '';
            return 'http://omscompanion.com' . $path;
        }
        if (str_starts_with($url, '/')) {
            return 'http://omscompanion.com' . $url;
        }
        return $url;
    }

    /**
     * Send push notification to all subscribed Android & iOS devices via OneSignal.
     */
    public static function sendToAll(string $title, string $message, ?string $url = null): array
    {
        $appId = self::getAppId();
        $apiKey = self::getRestApiKey();

        if (empty($appId) || empty($apiKey)) {
            Log::warning("OneSignal broadcast push notification skipped: App ID or REST API Key is missing.");
            return [
                'success' => false,
                'message' => 'OneSignal App ID or REST API Key is missing. Please set ONESIGNAL_REST_API_KEY in .env file.',
            ];
        }

        $targetUrl = self::normalizeTargetUrl($url ?: 'http://omscompanion.com');

        $payload = [
            'app_id' => $appId,
            'included_segments' => ['All'],
            'headings' => ['en' => $title],
            'contents' => ['en' => $message],
            'url' => $targetUrl,
            'data' => [
                'url' => $targetUrl,
                'target_url' => $targetUrl,
            ],
            // Android sound & priority settings
            'android_sound' => 'notification',
            'priority' => 10,
            // iOS sound & badge settings
            'ios_sound' => 'default',
            'ios_badgeType' => 'Increase',
            'ios_badgeCount' => 1,
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payload);

            $responseData = $response->json();

            Log::info('OneSignal Push Notification Sent:', [
                'status' => $response->status(),
                'response' => $responseData,
            ]);

            if ($response->successful() && !isset($responseData['errors'])) {
                return [
                    'success' => true,
                    'message' => 'Push notification sent successfully to all devices!',
                    'recipients' => $responseData['recipients'] ?? 0,
                    'id' => $responseData['id'] ?? null,
                ];
            }

            $errorMessage = isset($responseData['errors']) 
                ? (is_array($responseData['errors']) ? implode(', ', $responseData['errors']) : $responseData['errors'])
                : 'Failed to send notification via OneSignal API.';

            if (stripos($errorMessage, 'All included players are not subscribed') !== false) {
                $errorMessage = 'No active subscribed app users found yet. Please download & open the updated OMS Companion app on your phone to subscribe your device.';
            }

            return [
                'success' => false,
                'message' => $errorMessage,
            ];
        } catch (\Throwable $e) {
            Log::error('OneSignal Push Notification Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Exception occurred while contacting OneSignal: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send targeted push notification to a specific user via OneSignal.
     */
    public static function sendToUser(\App\Models\User $user, string $title, string $message, ?string $url = null): array
    {
        $appId = self::getAppId();
        $apiKey = self::getRestApiKey();

        if (empty($appId) || empty($apiKey)) {
            Log::warning("OneSignal Push Notification skipped for User #{$user->id}: REST API Key is missing.");
            return [
                'success' => false,
                'message' => 'OneSignal REST API Key is missing. Please set ONESIGNAL_REST_API_KEY in .env file.',
            ];
        }

        $userIdStr = (string) $user->id;
        $targetUrl = self::normalizeTargetUrl($url ?: 'http://omscompanion.com');

        // 1. Try using include_aliases (OneSignal v5 external_id format)
        $payloadAliases = [
            'app_id' => $appId,
            'include_aliases' => [
                'external_id' => [$userIdStr],
            ],
            'target_channel' => 'push',
            'headings' => ['en' => $title],
            'contents' => ['en' => $message],
            'url' => $targetUrl,
            'data' => [
                'url' => $targetUrl,
                'target_url' => $targetUrl,
            ],
            'android_sound' => 'notification',
            'priority' => 10,
            'ios_sound' => 'default',
            'ios_badgeType' => 'Increase',
            'ios_badgeCount' => 1,
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payloadAliases);

            $responseData = $response->json();

            Log::info("OneSignal Push Notification Sent to User #{$user->id} ({$user->name}):", [
                'status' => $response->status(),
                'response' => $responseData,
            ]);

            if ($response->successful() && !empty($responseData['id']) && empty($responseData['errors'])) {
                return [
                    'success' => true,
                    'message' => 'Push notification sent to user successfully!',
                    'recipients' => $responseData['recipients'] ?? 0,
                    'id' => $responseData['id'] ?? null,
                ];
            }

            // 2. Fallback: Try tag filter targeting (user_id = X)
            $payloadFilter = [
                'app_id' => $appId,
                'filters' => [
                    ['field' => 'tag', 'key' => 'user_id', 'relation' => '=', 'value' => $userIdStr]
                ],
                'headings' => ['en' => $title],
                'contents' => ['en' => $message],
                'url' => $targetUrl,
                'data' => [
                    'url' => $targetUrl,
                    'target_url' => $targetUrl,
                ],
                'android_sound' => 'notification',
                'priority' => 10,
                'ios_sound' => 'default',
                'ios_badgeType' => 'Increase',
                'ios_badgeCount' => 1,
            ];

            $responseFilter = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payloadFilter);

            $responseDataFilter = $responseFilter->json();

            if ($responseFilter->successful() && !empty($responseDataFilter['id']) && empty($responseDataFilter['errors'])) {
                return [
                    'success' => true,
                    'message' => 'Push notification sent to user successfully!',
                    'recipients' => $responseDataFilter['recipients'] ?? 0,
                    'id' => $responseDataFilter['id'] ?? null,
                ];
            }

            // 3. Fallback: Try include_external_user_ids
            $payloadExternal = [
                'app_id' => $appId,
                'include_external_user_ids' => [$userIdStr],
                'headings' => ['en' => $title],
                'contents' => ['en' => $message],
                'url' => $targetUrl,
                'data' => [
                    'url' => $targetUrl,
                    'target_url' => $targetUrl,
                ],
                'android_sound' => 'notification',
                'priority' => 10,
                'ios_sound' => 'default',
                'ios_badgeType' => 'Increase',
                'ios_badgeCount' => 1,
            ];

            $responseExternal = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payloadExternal);

            $responseDataExternal = $responseExternal->json();

            if ($responseExternal->successful() && !empty($responseDataExternal['id']) && empty($responseDataExternal['errors'])) {
                return [
                    'success' => true,
                    'message' => 'Push notification sent to user successfully!',
                    'recipients' => $responseDataExternal['recipients'] ?? 0,
                    'id' => $responseDataExternal['id'] ?? null,
                ];
            }

            $errorMessage = isset($responseDataFilter['errors']) 
                ? (is_array($responseDataFilter['errors']) ? implode(', ', $responseDataFilter['errors']) : $responseDataFilter['errors'])
                : 'Failed to send notification via OneSignal API.';

            return [
                'success' => false,
                'message' => $errorMessage,
            ];
        } catch (\Throwable $e) {
            Log::error("OneSignal User Push Error (User #{$user->id}): " . $e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Synchronize and tag native device subscription in OneSignal & local database.
     */
    public static function syncDeviceSubscription(?int $userId, ?string $role, bool $isAdmin, string $subscriptionId, ?string $deviceModel = null): array
    {
        if (empty($subscriptionId)) {
            return ['success' => false, 'message' => 'Subscription ID is required'];
        }

        $appId = self::getAppId();
        $apiKey = self::getRestApiKey();

        $roleStr = strtolower($role ?: 'member');
        $isAdmin = $isAdmin || ($roleStr === 'admin');

        // 1. Tag device directly on OneSignal REST API
        if (!empty($appId) && !empty($apiKey)) {
            try {
                $tags = [
                    'user_id' => $userId ? (string) $userId : '',
                    'role' => $isAdmin ? 'admin' : $roleStr,
                ];
                if ($isAdmin) {
                    $tags['is_admin'] = 'true';
                }

                $updateData = [
                    'app_id' => $appId,
                    'tags' => $tags,
                ];
                if ($userId) {
                    $updateData['external_user_id'] = (string) $userId;
                }

                $res = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Basic ' . trim($apiKey),
                ])->put("https://onesignal.com/api/v1/players/{$subscriptionId}", $updateData);

                Log::info("OneSignal REST API player tag update for {$subscriptionId}: status {$res->status()}");
            } catch (\Throwable $e) {
                Log::error("Failed to tag player {$subscriptionId} via OneSignal REST API: " . $e->getMessage());
            }
        }

        // 2. Save in database for user
        if ($userId) {
            try {
                $user = \App\Models\User::find($userId);
                if ($user) {
                    if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'onesignal_player_id')) {
                        $user->onesignal_player_id = $subscriptionId;
                        $user->save();
                    }
                    if ($user->isAdmin()) {
                        $isAdmin = true;
                    }
                }
            } catch (\Throwable $e) {
                Log::error("Failed to update user #{$userId} onesignal_player_id: " . $e->getMessage());
            }
        }

        // 3. If admin, record subscription ID in LandingSetting for persistent admin targeting
        if ($isAdmin) {
            try {
                $setting = LandingSetting::firstOrNew(['key' => 'admin_device_tokens']);
                $tokens = !empty($setting->value) ? json_decode($setting->value, true) : [];
                if (!is_array($tokens)) $tokens = [];
                if (!in_array($subscriptionId, $tokens)) {
                    $tokens[] = $subscriptionId;
                    $setting->value = json_encode(array_values(array_unique($tokens)));
                    $setting->save();
                }
            } catch (\Throwable $e) {
                Log::error("Failed to store admin device token {$subscriptionId}: " . $e->getMessage());
            }
        }

        Log::info("[NATIVE DEVICE SYNC] Device {$subscriptionId} synced: User #{$userId}, Role: {$roleStr}, IsAdmin: " . ($isAdmin ? 'yes' : 'no') . ", Model: {$deviceModel}");

        return [
            'success' => true,
            'is_admin' => $isAdmin,
            'subscription_id' => $subscriptionId,
        ];
    }

    /**
     * Send push notification specifically to all administrators via OneSignal.
     */
    public static function sendToAdmins(string $title, string $message, ?string $url = null): array
    {
        $admins = \App\Models\User::where('role', 'admin')->get();
        $appId = self::getAppId();
        $apiKey = self::getRestApiKey();
        $targetUrl = self::normalizeTargetUrl($url ?: route('admin.referrals'));
        $adminIdStrings = $admins->pluck('id')->map(fn($id) => (string) $id)->values()->all();

        if (empty($appId) || empty($apiKey)) {
            Log::warning("OneSignal sendToAdmins skipped: App ID or REST API Key is missing.");
            return [
                'success' => false,
                'message' => 'OneSignal App ID or REST API Key is missing.',
            ];
        }

        // 1. Gather all Admin subscription/player IDs
        $adminSubscriptionIds = [];
        try {
            $settingTokens = LandingSetting::where('key', 'admin_device_tokens')->value('value');
            if (!empty($settingTokens)) {
                $decoded = json_decode($settingTokens, true);
                if (is_array($decoded)) {
                    $adminSubscriptionIds = array_merge($adminSubscriptionIds, $decoded);
                }
            }
            if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'onesignal_player_id')) {
                $userTokens = \App\Models\User::where('role', 'admin')
                    ->whereNotNull('onesignal_player_id')
                    ->pluck('onesignal_player_id')
                    ->all();
                $adminSubscriptionIds = array_merge($adminSubscriptionIds, $userTokens);
            }
        } catch (\Throwable $e) {
            Log::error("Error fetching admin device subscription IDs: " . $e->getMessage());
        }

        // Always include known admin device subscription
        $adminSubscriptionIds[] = '9688ce2f-8cbd-4664-82af-59489bbee823';
        $adminSubscriptionIds = array_values(array_unique(array_filter($adminSubscriptionIds)));

        $results = [];

        // 2. PRIMARY: Direct Player ID Delivery (Guaranteed delivery to physical admin devices)
        if (!empty($adminSubscriptionIds)) {
            try {
                $payloadDirect = [
                    'app_id' => $appId,
                    'include_player_ids' => $adminSubscriptionIds,
                    'headings' => ['en' => $title],
                    'contents' => ['en' => $message],
                    'url' => $targetUrl,
                    'data' => [
                        'url' => $targetUrl,
                        'target_url' => $targetUrl,
                    ],
                    'android_sound' => 'notification',
                    'priority' => 10,
                    'ios_sound' => 'default',
                    'ios_badgeType' => 'Increase',
                    'ios_badgeCount' => 1,
                ];

                $responseDirect = Http::withHeaders([
                    'Content-Type' => 'application/json; charset=utf-8',
                    'Authorization' => 'Basic ' . trim($apiKey),
                ])->post('https://onesignal.com/api/v1/notifications', $payloadDirect);

                $results['direct_player_ids'] = [
                    'status' => $responseDirect->status(),
                    'response' => $responseDirect->json(),
                ];

                Log::info('OneSignal sendToAdmins direct player IDs response:', [
                    'status' => $responseDirect->status(),
                    'response' => $responseDirect->json(),
                ]);
            } catch (\Throwable $e) {
                Log::error('OneSignal sendToAdmins direct player error: ' . $e->getMessage());
            }
        }

        // 3. SECONDARY: Tag Filters (is_admin = 'true' OR role = 'admin')
        try {
            $tagFilters = [
                ['field' => 'tag', 'key' => 'is_admin', 'relation' => '=', 'value' => 'true'],
                ['operator' => 'OR'],
                ['field' => 'tag', 'key' => 'role', 'relation' => '=', 'value' => 'admin'],
            ];
            foreach ($adminIdStrings as $adminId) {
                $tagFilters[] = ['operator' => 'OR'];
                $tagFilters[] = ['field' => 'tag', 'key' => 'user_id', 'relation' => '=', 'value' => (string) $adminId];
            }

            $payloadTag = [
                'app_id' => $appId,
                'filters' => $tagFilters,
                'headings' => ['en' => $title],
                'contents' => ['en' => $message],
                'url' => $targetUrl,
                'data' => [
                    'url' => $targetUrl,
                    'target_url' => $targetUrl,
                ],
                'android_sound' => 'notification',
                'priority' => 10,
                'ios_sound' => 'default',
                'ios_badgeType' => 'Increase',
                'ios_badgeCount' => 1,
            ];

            $responseTag = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payloadTag);

            $results['tag_filter'] = [
                'status' => $responseTag->status(),
                'response' => $responseTag->json(),
            ];

            Log::info('OneSignal sendToAdmins tag-based response:', [
                'status' => $responseTag->status(),
                'response' => $responseTag->json(),
            ]);
        } catch (\Throwable $e) {
            Log::error('OneSignal sendToAdmins tag-based error: ' . $e->getMessage());
        }

        // 4. TERTIARY: include_aliases (OneSignal v5 external_id targeting)
        if (!empty($adminIdStrings)) {
            try {
                $payloadAliases = [
                    'app_id' => $appId,
                    'include_aliases' => [
                        'external_id' => $adminIdStrings,
                    ],
                    'target_channel' => 'push',
                    'headings' => ['en' => $title],
                    'contents' => ['en' => $message],
                    'url' => $targetUrl,
                    'data' => [
                        'url' => $targetUrl,
                        'target_url' => $targetUrl,
                    ],
                    'android_sound' => 'notification',
                    'priority' => 10,
                    'ios_sound' => 'default',
                    'ios_badgeType' => 'Increase',
                    'ios_badgeCount' => 1,
                ];

                $responseAliases = Http::withHeaders([
                    'Content-Type' => 'application/json; charset=utf-8',
                    'Authorization' => 'Basic ' . trim($apiKey),
                ])->post('https://onesignal.com/api/v1/notifications', $payloadAliases);

                $results['aliases'] = [
                    'status' => $responseAliases->status(),
                    'response' => $responseAliases->json(),
                ];

                Log::info('OneSignal sendToAdmins include_aliases response:', [
                    'status' => $responseAliases->status(),
                    'response' => $responseAliases->json(),
                ]);
            } catch (\Throwable $e) {
                Log::error('OneSignal sendToAdmins include_aliases error: ' . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'message' => 'Admin push notifications dispatched successfully.',
            'details' => $results,
        ];
    }
}
