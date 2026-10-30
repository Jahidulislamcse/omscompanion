<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\LandingSetting;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'status' => $request->user()->status,
                    'member_id' => $request->user()->member_id,
                    'clinic_name' => $request->user()->clinic_name,
                    'bds_registration_number' => $request->user()->bds_registration_number,
                    'address' => $request->user()->address,
                    'approved_at' => $request->user()->approved_at,
                    'avatar' => $request->user()->avatar,
                    'avatar_url' => $request->user()->avatar_url,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'unread_notifications_count' => $request->user() ? \App\Models\Notification::where('user_id', $request->user()->id)
                ->where('title', 'NOT LIKE', '%Commission%')
                ->where('title', 'NOT LIKE', '%Payment%')
                ->whereNull('read_at')
                ->count() : 0,
            'pending_members_count' => $request->user() && $request->user()->isAdmin()
                ? \App\Models\User::where('role', 'member')->where('status', 'pending')->count()
                : 0,
            'admin_notifications' => ($request->user() && $request->user()->isAdmin()) ? [
                'pending_members_count' => \App\Models\User::where('role', 'member')->where('status', 'pending')->count(),
                'new_referrals_count' => \App\Models\PatientReferral::where('status', 'new')->count(),
                'unread_notifications_count' => \App\Models\Notification::where('user_id', $request->user()->id)->whereNull('read_at')->count(),
                'pending_members' => \App\Models\User::where('role', 'member')
                    ->where('status', 'pending')
                    ->latest()
                    ->take(10)
                    ->get(['id', 'name', 'phone', 'doctor_type', 'bds_registration_number', 'clinic_name', 'created_at']),
                'new_referrals' => \App\Models\PatientReferral::where('status', 'new')
                    ->with('member:id,name')
                    ->latest()
                    ->take(10)
                    ->get(['id', 'patient_name', 'phone', 'medical_condition', 'urgency_level', 'status', 'referrer_type', 'referrer_name', 'member_id', 'created_at']),
                'recent_notifications' => \App\Models\Notification::where('user_id', $request->user()->id)
                    ->latest()
                    ->take(10)
                    ->get(['id', 'title', 'message', 'action_url', 'read_at', 'created_at']),
            ] : null,
            'site_logo' => LandingSetting::where('key', 'site_logo')->value('value') 
                ? route('site.logo.stream') . '?v=' . (LandingSetting::where('key', 'site_logo_updated_at')->value('value') ?: time())
                : null,
            'site_name' => LandingSetting::where('key', 'site_name')->value('value') ?: 'OMSCOMPANION',
            'login_side_image' => LandingSetting::where('key', 'login_side_image')->value('value') 
                ? route('site.login_image.stream') . '?v=' . (LandingSetting::where('key', 'login_side_image_updated_at')->value('value') ?: time())
                : null,
            'login_side_title' => LandingSetting::where('key', 'login_side_title')->value('value') ?: 'Discover your next journey',
            'login_side_subtitle' => LandingSetting::where('key', 'login_side_subtitle')->value('value') ?: 'Explore ideas, stories, and experiences designed to inspire your everyday practice.',
            'whatsapp_number' => LandingSetting::where('key', 'whatsapp_number')->value('value') ?: '+8801700000000',
            'is_app_installed' => str_contains($request->header('User-Agent', ''), 'OMSCompanionAndroidApp') || str_contains($request->header('User-Agent', ''), 'OMSCompanionApp'),
        ];
    }
}
