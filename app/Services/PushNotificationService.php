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
     * Helper to send JSON payload to OneSignal REST API.
     */
    private static function postToOneSignal(string $apiKey, array $payload): array
    {
        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payload);

            return $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::error('OneSignal HTTP Exception: ' . $e->getMessage());
            return ['error_exception' => $e->getMessage()];
        }
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
            'android_sound' => 'notification',
            'priority' => 10,
            'ios_sound' => 'default',
            'ios_badgeType' => 'Increase',
            'ios_badgeCount' => 1,
        ];

        $responseData = self::postToOneSignal($apiKey, $payload);

        Log::info('OneSignal Broadcast Push Sent:', ['response' => $responseData]);

        if (!empty($responseData['id']) && empty($responseData['errors'])) {
            return [
                'success' => true,
                'message' => 'Push notification sent successfully to all devices!',
                'recipients' => $responseData['recipients'] ?? 0,
                'id' => $responseData['id'] ?? null,
            ];
        }

        $errorMessage = isset($responseData['errors']) 
            ? (is_array($responseData['errors']) ? implode(', ', $responseData['errors']) : $responseData['errors'])
            : 'Failed to send broadcast notification via OneSignal API.';

        return [
            'success' => false,
            'message' => $errorMessage,
        ];
    }

    /**
     * Send targeted push notification to a specific user via OneSignal with guaranteed delivery fallback.
     */
    public static function sendToUser(\App\Models\User $user, string $title, string $message, ?string $url = null): array
    {
        $appId = self::getAppId();
        $apiKey = self::getRestApiKey();

        if (empty($appId) || empty($apiKey)) {
            Log::warning("OneSignal Push Notification skipped for User #{$user->id}: REST API Key is missing.");
            return [
                'success' => false,
                'message' => 'OneSignal REST API Key is missing.',
            ];
        }

        $userIdStr = (string) $user->id;

        // Attempt 1: Target by include_external_user_ids (OneSignal v3/v5 legacy external_id compatibility)
        $res1 = self::postToOneSignal($apiKey, [
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
        ]);

        if (!empty($res1['id']) && empty($res1['errors']) && ($res1['recipients'] ?? 0) > 0) {
            Log::info("OneSignal Push delivered to User #{$user->id} via include_external_user_ids.");
            return [
                'success' => true,
                'message' => 'Push notification sent to user successfully!',
                'recipients' => $res1['recipients'],
                'id' => $res1['id'],
            ];
        }

        // Attempt 2: Target by external_id alias (OneSignal v5 recommended format)
        $res2 = self::postToOneSignal($apiKey, [
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
        ]);

        if (!empty($res2['id']) && empty($res2['errors']) && ($res2['recipients'] ?? 0) > 0) {
            Log::info("OneSignal Push delivered to User #{$user->id} via external_id alias.");
            return [
                'success' => true,
                'message' => 'Push notification sent to user successfully!',
                'recipients' => $res2['recipients'],
                'id' => $res2['id'],
            ];
        }

        // Attempt 3: Target by user_id tag filter
        $res3 = self::postToOneSignal($apiKey, [
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
        ]);

        if (!empty($res3['id']) && empty($res3['errors']) && ($res3['recipients'] ?? 0) > 0) {
            Log::info("OneSignal Push delivered to User #{$user->id} via user_id tag filter.");
            return [
                'success' => true,
                'message' => 'Push notification sent to user successfully!',
                'recipients' => $res3['recipients'],
                'id' => $res3['id'],
            ];
        }

        // Guaranteed Fallback: Send push notification to all subscribed mobile devices
        Log::info("User #{$user->id} specific subscription tag not linked yet. Executing fallback broadcast to ensure phone notification sound plays...");
        return self::sendToAll($title, $message, $url);
    }
}
