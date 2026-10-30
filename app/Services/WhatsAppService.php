<?php

namespace App\Services;

use App\Models\LandingSetting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Normalize Bangladeshi / International phone numbers into standard digits format without leading plus.
     * E.g. "01712345678" -> "8801712345678", "+8801712345678" -> "8801712345678"
     */
    public static function normalizePhoneNumber(?string $phone): string
    {
        if (empty($phone)) {
            return '';
        }

        // Remove spaces, hyphens, parentheses, and plus sign
        $cleaned = preg_replace('/[^0-9]/', '', $phone);

        // If 11 digits starting with 01 (standard Bangladesh local format)
        if (strlen($cleaned) === 11 && str_starts_with($cleaned, '01')) {
            return '88' . $cleaned;
        }

        // If 10 digits starting with 1
        if (strlen($cleaned) === 10 && str_starts_with($cleaned, '1')) {
            return '880' . $cleaned;
        }

        return $cleaned;
    }

    /**
     * Get support WhatsApp number configured for OMS Companion.
     */
    public static function getSupportWhatsAppNumber(): string
    {
        $val = LandingSetting::where('key', 'whatsapp_number')->value('value');
        return !empty($val) ? $val : '+8801700000000';
    }

    /**
     * Generate direct wa.me click-to-chat web link with prefilled URL-encoded message.
     */
    public static function generateWebLink(?string $phone, string $message): string
    {
        $normalized = self::normalizePhoneNumber($phone);
        if (empty($normalized)) {
            return '';
        }
        return 'https://wa.me/' . $normalized . '?text=' . urlencode($message);
    }

    /**
     * Send WhatsApp message to a specific phone number.
     * Supports external WhatsApp REST API/Gateway if configured via env/settings,
     * logs formal output, and provides click-to-chat URL.
     */
    public static function send(?string $phone, string $message): array
    {
        $normalized = self::normalizePhoneNumber($phone);
        $webLink = self::generateWebLink($phone, $message);

        if (empty($normalized)) {
            Log::warning("[WHATSAPP DISPATCH SKIPPED] Missing phone number.");
            return [
                'success' => false,
                'message' => 'Phone number is missing or invalid.',
                'wa_link' => '',
            ];
        }

        Log::info("=================================================");
        Log::info("[WHATSAPP MESSAGE DISPATCHED]");
        Log::info("To: {$normalized} (Original: {$phone})");
        Log::info("Message: \n" . $message);
        Log::info("WhatsApp Direct Link: {$webLink}");
        Log::info("=================================================");

        // 1. Check if external WhatsApp Gateway API is configured
        $apiUrl = config('services.whatsapp.api_url') ?: env('WHATSAPP_API_URL');
        $apiToken = config('services.whatsapp.api_token') ?: env('WHATSAPP_API_TOKEN', env('WHATSAPP_API_KEY'));
        $instanceId = config('services.whatsapp.instance_id') ?: env('WHATSAPP_INSTANCE_ID', env('ULTRAMSG_INSTANCE_ID'));

        if (!empty($apiUrl) || (!empty($instanceId) && !empty($apiToken))) {
            try {
                // If UltraMsg format
                if (!empty($instanceId) && empty($apiUrl)) {
                    $targetEndpoint = "https://api.ultramsg.com/{$instanceId}/messages/chat";
                    $response = Http::timeout(10)->asForm()->post($targetEndpoint, [
                        'token' => $apiToken,
                        'to' => $normalized,
                        'body' => $message,
                    ]);

                    Log::info("[WHATSAPP ULTRAMSG API RESPONSE]", [
                        'status' => $response->status(),
                        'body' => $response->json(),
                    ]);

                    return [
                        'success' => $response->successful(),
                        'message' => 'Dispatched via UltraMsg WhatsApp API.',
                        'response' => $response->json(),
                        'wa_link' => $webLink,
                    ];
                }

                // If generic REST Webhook / API
                if (!empty($apiUrl)) {
                    $payload = [
                        'to' => $normalized,
                        'phone' => $normalized,
                        'message' => $message,
                        'text' => $message,
                    ];

                    $headers = [
                        'Content-Type' => 'application/json',
                    ];
                    if (!empty($apiToken)) {
                        $headers['Authorization'] = 'Bearer ' . $apiToken;
                    }

                    $response = Http::timeout(10)->withHeaders($headers)->post($apiUrl, $payload);

                    Log::info("[WHATSAPP GENERIC API RESPONSE]", [
                        'status' => $response->status(),
                        'body' => $response->json() ?: $response->body(),
                    ]);

                    return [
                        'success' => $response->successful(),
                        'message' => 'Dispatched via WhatsApp Gateway API.',
                        'wa_link' => $webLink,
                    ];
                }
            } catch (\Throwable $e) {
                Log::error("[WHATSAPP GATEWAY API ERROR]: " . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'message' => 'WhatsApp message logged and direct dispatch URL ready.',
            'wa_link' => $webLink,
        ];
    }

    /**
     * Send WhatsApp message to a registered User.
     */
    public static function sendToUser(User $user, string $message): array
    {
        $phone = $user->whatsapp_number ?: $user->phone;
        return self::send($phone, $message);
    }

    /**
     * Formal WhatsApp Template: New Registration Under Review
     */
    public static function getRegistrationUnderReviewMessage(User $user): string
    {
        $docType = $user->doctor_type ?: 'BDS';
        $regNo = $user->bds_registration_number ?: 'N/A';
        $supportWa = self::getSupportWhatsAppNumber();

        return "Dear Dr. {$user->name},\n\n"
            . "Greetings from OMS COMPANION.\n\n"
            . "Thank you for registering with our professional referral and clinical network. We have successfully received your registration application (BMDC Reg. No: {$regNo}, {$docType} Doctor).\n\n"
            . "Your account is currently under formal administrative review to verify your professional credentials. You will be formally notified shortly via WhatsApp and email once the review is completed.\n\n"
            . "If you require any immediate assistance, please feel free to reply to this message or contact our support desk at {$supportWa}.\n\n"
            . "Respectfully,\n"
            . "Administrative Committee\n"
            . "OMS COMPANION\n"
            . "https://omscompanion.com";
    }

    /**
     * Formal WhatsApp Template: Membership Approved
     */
    public static function getMembershipApprovedMessage(User $user, string $memberId, ?string $rawPassword = null): string
    {
        $loginEmail = $user->email ?? $user->phone;
        $password = $rawPassword ?: ($user->raw_password ?: '(Your registered password)');
        $regNo = $user->bds_registration_number ?: 'N/A';

        return "Dear Dr. {$user->name},\n\n"
            . "Congratulations! We are pleased to inform you that your membership application has been formally approved by OMS COMPANION.\n\n"
            . "Your Official Membership Details:\n"
            . "• Member ID: {$memberId}\n"
            . "• BMDC Reg. No: {$regNo}\n"
            . "• Login Email: {$loginEmail}\n"
            . "• Password: {$password}\n"
            . "• Access Portal: https://omscompanion.com/login\n\n"
            . "You can now log in to your dashboard to submit and track patient referrals, stream surgical & clinical tutorials, and access your verified membership certificate.\n\n"
            . "Welcome aboard,\n"
            . "Administrative Committee\n"
            . "OMS COMPANION\n"
            . "https://omscompanion.com";
    }

    /**
     * Formal WhatsApp Template: Membership Application Rejected
     */
    public static function getMembershipRejectedMessage(User $user): string
    {
        $regNo = $user->bds_registration_number ?: 'N/A';
        $supportWa = self::getSupportWhatsAppNumber();

        return "Dear Dr. {$user->name},\n\n"
            . "Greetings from OMS COMPANION.\n\n"
            . "Thank you for your interest in joining our professional clinical network. Regarding your recent membership registration (BMDC Reg. No: {$regNo}), we regret to inform you that your application could not be approved at this time following administrative review.\n\n"
            . "If you believe this decision was made in error or if you wish to provide updated professional documentation for reconsideration, please contact our administrative desk at {$supportWa}.\n\n"
            . "Thank you for your understanding.\n\n"
            . "Respectfully,\n"
            . "Administrative Committee\n"
            . "OMS COMPANION\n"
            . "https://omscompanion.com";
    }
}
