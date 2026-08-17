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
    public static function send(User $user, string $title, string $message, string $type = 'both')
    {
        // 1. Record in Database
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
        ]);

        // 2. Dispatch Email
        if ($type === 'email' || $type === 'both') {
            Log::info("=================================================");
            Log::info("[EMAIL NOTIFICATION DISPATCHED]");
            Log::info("To: {$user->email} ({$user->name})");
            Log::info("Subject: {$title}");
            Log::info("Message: {$message}");
            Log::info("=================================================");

            if (!empty($user->email)) {
                try {
                    $htmlMessage = nl2br(e($message));
                    $htmlContent = '
                    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 25px; color: #333;">
                        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 25px; border: 1px solid #e2e8f0;">
                            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">' . e($title) . '</h2>
                            <div style="font-size: 15px; line-height: 1.6; color: #334155; margin-top: 15px;">
                                ' . $htmlMessage . '
                            </div>
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

        return $notification;
    }

    /**
     * Send notification to all approved members.
     */
    public static function broadcastToMembers(string $title, string $message)
    {
        $members = User::where('role', 'member')->where('status', 'approved')->get();
        foreach ($members as $member) {
            self::send($member, $title, $message, 'email');
        }
    }
}
