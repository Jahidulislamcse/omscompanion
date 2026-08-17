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
                    \Illuminate\Support\Facades\Mail::raw($message, function ($mail) use ($user, $title) {
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
