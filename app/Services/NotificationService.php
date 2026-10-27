<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send email/SMS notification and record it in database.
     */
    public static function send(User $user, string $title, string $message, string $type = 'both', ?string $actionUrl = null)
    {
        // Block financial/commission notifications from being created or sent
        if (stripos($title, 'commission') !== false || stripos($title, 'payment') !== false || stripos($message, 'commission payment') !== false) {
            return null;
        }

        // 1. Record in Database
        $notificationData = [
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ];

        static $hasActionUrl = null;
        if ($hasActionUrl === null) {
            try {
                $hasActionUrl = \Illuminate\Support\Facades\Schema::hasColumn('notifications', 'action_url');
            } catch (\Throwable $e) {
                $hasActionUrl = false;
            }
        }

        if ($hasActionUrl && !empty($actionUrl)) {
            $notificationData['action_url'] = $actionUrl;
        }

        $notification = null;
        try {
            $notification = Notification::create($notificationData);
        } catch (\Throwable $e) {
            Log::error("Failed to create notification record in database: " . $e->getMessage());
            // Retry without action_url in case the column was missing
            try {
                unset($notificationData['action_url']);
                $notification = Notification::create($notificationData);
            } catch (\Throwable $ex) {
                Log::error("Fallback notification creation also failed: " . $ex->getMessage());
            }
        }

        // 2. Dispatch Email
        if ($type === 'email' || $type === 'both') {
            Log::info("=================================================");
            Log::info("[EMAIL NOTIFICATION DISPATCHED]");
            Log::info("To: {$user->email} ({$user->name})");
            Log::info("Subject: {$title}");
            Log::info("Message: {$message}");
            Log::info("Action URL: " . ($actionUrl ?: 'N/A'));
            Log::info("=================================================");

            if (!empty($user->email)) {
                try {
                    $htmlMessage = nl2br(e($message));
                    $actionButtonHtml = '';
                    if (!empty($actionUrl)) {
                        $actionButtonHtml = '
                        <div style="margin-top: 20px; text-align: center;">
                            <a href="' . e($actionUrl) . '" style="display: inline-block; padding: 12px 24px; background: #0d9488; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
                                View Now &rarr;
                            </a>
                        </div>';
                    }

                    $htmlContent = '
                    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 25px; color: #333;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e2e8f0;">
                            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">' . e($title) . '</h2>
                            <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 15px;">
                                ' . $htmlMessage . '
                            </div>
                            ' . $actionButtonHtml . '
                            <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                                &copy; ' . date('Y') . ' OMSCOMPANION. All rights reserved.
                            </div>
                        </div>
                    </div>';

                    \Illuminate\Support\Facades\Mail::html($htmlContent, function ($mail) use ($user, $title) {
                        $mail->to($user->email, $user->name)
                            ->subject($title);
                    });
                } catch (\Throwable $e) {
                    Log::error("Failed to send real email: " . $e->getMessage());
                }
            }
        }

        // 3. Simulate SMS Dispatch
        if ($type === 'sms' || $type === 'both') {
            $phone = $user->phone ?? 'N/A';
            Log::info("=================================================");
            Log::info("[SMS NOTIFICATION DISPATCHED]");
            Log::info("To: {$phone}");
            Log::info("Message: {$message}");
            Log::info("=================================================");
        }

        // 4. Dispatch Targeted Push Notification to User's Mobile App
        try {
            PushNotificationService::sendToUser($user, $title, $message, $actionUrl);
        } catch (\Throwable $e) {
            Log::error("Failed to send push notification to user #{$user->id}: " . $e->getMessage());
        }

        return $notification;
    }

    /**
     * Send notification to all approved members.
     */
    public static function broadcastToMembers(string $title, string $message, ?string $actionUrl = null)
    {
        try {
            $members = User::where('role', 'member')->where('status', 'approved')->get();
            foreach ($members as $member) {
                try {
                    self::send($member, $title, $message, 'email', $actionUrl);
                } catch (\Throwable $e) {
                    Log::error("Failed to notify member #{$member->id}: " . $e->getMessage());
                }
            }
        } catch (\Throwable $e) {
            Log::error("Failed to broadcast notification to members: " . $e->getMessage());
        }

        // Broadcast Push Notification to all app users
        try {
            PushNotificationService::sendToAll($title, $message, $actionUrl);
        } catch (\Throwable $e) {
            Log::error("Failed to broadcast push notification: " . $e->getMessage());
        }
    }
}
