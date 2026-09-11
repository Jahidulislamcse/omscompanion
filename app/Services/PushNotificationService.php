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
        return config('services.onesignal.app_id') 
            ?? LandingSetting::where('key', 'onesignal_app_id')->value('value') 
            ?? 'cd9df2b6-fda0-463e-bebb-7d8b49edf74c';
    }

    /**
     * Get configured OneSignal REST API Key.
     */
    public static function getRestApiKey(): string
    {
        return config('services.onesignal.rest_api_key') 
            ?? LandingSetting::where('key', 'onesignal_rest_api_key')->value('value') 
            ?? '';
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

        $payload = [
            'app_id' => $appId,
            'included_segments' => ['All'],
            'headings' => ['en' => $title],
            'contents' => ['en' => $message],
            'url' => $url ?: 'http://omscompanion.com',
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

        // 1. Try using include_aliases (OneSignal v5 external_id format)
        $payloadAliases = [
            'app_id' => $appId,
            'include_aliases' => [
                'external_id' => [$userIdStr],
            ],
            'target_channel' => 'push',
            'headings' => ['en' => $title],
            'contents' => ['en' => $message],
            'url' => $url ?: 'http://omscompanion.com',
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
                'url' => $url ?: 'http://omscompanion.com',
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
                'url' => $url ?: 'http://omscompanion.com',
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
}
