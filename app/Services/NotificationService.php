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

    /**
     * Send notification to all administrators via App Push, In-App Database notification, and Email.
     */
    public static function notifyAdmins(string $title, string $message, ?string $actionUrl = null)
    {
        try {
            $admins = User::where('role', 'admin')->get();
            $actionUrl = $actionUrl ?: route('admin.referrals');

            // 1. Send to each admin (Database notification + Email + Targeted Push)
            foreach ($admins as $admin) {
                try {
                    self::send($admin, $title, $message, 'both', $actionUrl);
                } catch (\Throwable $e) {
                    Log::error("Failed to notify admin #{$admin->id}: " . $e->getMessage());
                }
            }

            // 2. Dispatch Push Notification via OneSignal admin targeting (aliases + tags)
            try {
                PushNotificationService::sendToAdmins($title, $message, $actionUrl);
            } catch (\Throwable $e) {
                Log::error("Failed to dispatch push notification to admins: " . $e->getMessage());
            }
        } catch (\Throwable $e) {
            Log::error("Failed in NotificationService::notifyAdmins: " . $e->getMessage());
        }
    }

    /**
     * Formal Notification: Registration Under Review (Email + WhatsApp + Database + Push)
     */
    public static function sendRegistrationPendingNotification(User $user)
    {
        try {
            $title = "Registration Under Review - OMS COMPANION";
            $docType = $user->doctor_type ?: 'BDS';
            $regNo = $user->bds_registration_number ?: 'N/A';
            $clinic = $user->clinic_name ? " ({$user->clinic_name})" : "";
            $supportWa = WhatsAppService::getSupportWhatsAppNumber();

            $emailMessage = "Dear Dr. {$user->name},\n\n"
                . "Thank you for registering with OMS COMPANION.\n\n"
                . "We have successfully received your registration application (BMDC Reg. No: {$regNo}, {$docType} Doctor{$clinic}). Your professional credentials and account details are currently under formal administrative review.\n\n"
                . "Please be advised that this review process ensures the authenticity and high clinical standards of our professional doctor network. You will be formally notified shortly via email and WhatsApp once the verification is completed.\n\n"
                . "If you require any immediate assistance or have questions regarding your application, please contact our administrative desk at {$supportWa}.\n\n"
                . "Respectfully,\n"
                . "Administrative Committee\n"
                . "OMS COMPANION\n"
                . "https://omscompanion.com";

            // 1. Dispatch Email + Database Notification + Mobile App Push
            self::send($user, $title, $emailMessage, 'both', 'https://omscompanion.com');

            // 2. Dispatch Formal WhatsApp Message
            try {
                $waMessage = WhatsAppService::getRegistrationUnderReviewMessage($user);
                WhatsAppService::sendToUser($user, $waMessage);
            } catch (\Throwable $e) {
                Log::error("WhatsApp registration dispatch failed for User #{$user->id}: " . $e->getMessage());
            }
        } catch (\Throwable $e) {
            Log::error("sendRegistrationPendingNotification failed for User #{$user->id}: " . $e->getMessage());
        }
    }

    /**
     * Formal Notification: Membership Approved (Email + WhatsApp + Database + Push)
     */
    public static function sendMemberApprovedNotification(User $user, string $memberId, ?string $rawPassword = null)
    {
        try {
            $title = "Membership Approved - Welcome to OMS COMPANION";
            $loginEmail = $user->email ?? $user->phone;
            $password = $rawPassword ?: ($user->raw_password ?: '(Your registered password)');
            $regNo = $user->bds_registration_number ?: 'N/A';
            $loginUrl = route('login');

            $emailMessage = "Dear Dr. {$user->name},\n\n"
                . "We are pleased to inform you that your membership application has been formally reviewed and approved by the OMS COMPANION administrative authority.\n\n"
                . "Welcome to OMS COMPANION! Your official account credentials and membership details are as follows:\n\n"
                . "• Member ID: {$memberId}\n"
                . "• BMDC Reg. No: {$regNo}\n"
                . "• Registered Login: {$loginEmail}\n"
                . "• Login Password: {$password}\n"
                . "• Access Portal: {$loginUrl}\n\n"
                . "You now have full access to our professional platform:\n"
                . "✓ Submit and track patient referrals with live status updates\n"
                . "✓ Access clinical and surgical demonstration video tutorials\n"
                . "✓ Download your official verified membership certificate\n\n"
                . "We look forward to an esteemed and successful professional collaboration with you.\n\n"
                . "Sincerely,\n"
                . "Administrative Committee\n"
                . "OMS COMPANION\n"
                . "https://omscompanion.com";

            // 1. Dispatch Email + Database Notification + Mobile App Push
            self::send($user, $title, $emailMessage, 'both', $loginUrl);

            // 2. Dispatch Formal WhatsApp Message
            try {
                $waMessage = WhatsAppService::getMembershipApprovedMessage($user, $memberId, $rawPassword);
                WhatsAppService::sendToUser($user, $waMessage);
            } catch (\Throwable $e) {
                Log::error("WhatsApp approval dispatch failed for User #{$user->id}: " . $e->getMessage());
            }
        } catch (\Throwable $e) {
            Log::error("sendMemberApprovedNotification failed for User #{$user->id}: " . $e->getMessage());
        }
    }

    /**
     * Formal Notification: Membership Application Rejected (Email + WhatsApp + Database + Push)
     */
    public static function sendMemberRejectedNotification(User $user)
    {
        try {
            $title = "Membership Application Status - OMS COMPANION";
            $regNo = $user->bds_registration_number ?: 'N/A';
            $supportWa = WhatsAppService::getSupportWhatsAppNumber();

            $emailMessage = "Dear Dr. {$user->name},\n\n"
                . "Thank you for your interest in joining OMS COMPANION.\n\n"
                . "Regarding your recent registration application (BMDC Reg. No: {$regNo}), we regret to inform you that following administrative review, we are unable to approve your membership at this time.\n\n"
                . "This may be due to incomplete documentation, unverified credentials, or membership eligibility criteria. If you believe this decision was made in error or if you wish to provide updated professional documentation for reconsideration, please contact our administrative desk at {$supportWa}.\n\n"
                . "Thank you for your time and professional courtesy.\n\n"
                . "Respectfully,\n"
                . "Administrative Committee\n"
                . "OMS COMPANION\n"
                . "https://omscompanion.com";

            // 1. Dispatch Email + Database Notification + Mobile App Push
            self::send($user, $title, $emailMessage, 'both', 'https://omscompanion.com');

            // 2. Dispatch Formal WhatsApp Message
            try {
                $waMessage = WhatsAppService::getMembershipRejectedMessage($user);
                WhatsAppService::sendToUser($user, $waMessage);
            } catch (\Throwable $e) {
                Log::error("WhatsApp rejection dispatch failed for User #{$user->id}: " . $e->getMessage());
            }
        } catch (\Throwable $e) {
            Log::error("sendMemberRejectedNotification failed for User #{$user->id}: " . $e->getMessage());
        }
    }
}
