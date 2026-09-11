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
            return [
                'success' => false,
                'message' => 'OneSignal App ID or REST API Key is missing. Please configure them in settings.',
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
            return [
                'success' => false,
                'message' => 'OneSignal credentials missing.',
            ];
        }

        $userIdStr = (string) $user->id;

        $payload = [
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
            'filters' => [
                ['field' => 'tag', 'key' => 'user_id', 'relation' => '=', 'value' => $userIdStr]
            ],
        ];

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payload);

            $responseData = $response->json();

            Log::info("OneSignal Push Notification Sent to User #{$user->id} ({$user->name}):", [
                'status' => $response->status(),
                'response' => $responseData,
            ]);

            if ($response->successful() && !isset($responseData['errors'])) {
                return [
                    'success' => true,
                    'message' => 'Push notification sent to user successfully!',
                    'recipients' => $responseData['recipients'] ?? 0,
                    'id' => $responseData['id'] ?? null,
                ];
            }

            // Fallback: If alias format fails, retry using tag filter only
            $payloadFallback = $payload;
            unset($payloadFallback['include_aliases']);
            unset($payloadFallback['target_channel']);

            $response2 = Http::withHeaders([
                'Content-Type' => 'application/json; charset=utf-8',
                'Authorization' => 'Basic ' . trim($apiKey),
            ])->post('https://onesignal.com/api/v1/notifications', $payloadFallback);

            $responseData2 = $response2->json();

            if ($response2->successful() && !isset($responseData2['errors'])) {
                return [
                    'success' => true,
                    'message' => 'Push notification sent to user successfully!',
                    'recipients' => $responseData2['recipients'] ?? 0,
                    'id' => $responseData2['id'] ?? null,
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to send notification via OneSignal API.',
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
