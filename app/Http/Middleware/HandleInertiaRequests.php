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
                    'premium_access' => $request->user()->premium_access,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'new_guest_referral' => $request->session()->get('new_guest_referral'),
            ],
            'site_logo' => LandingSetting::where('key', 'site_logo')->value('value') 
                ? route('site.logo.stream') . '?v=' . (LandingSetting::where('key', 'site_logo_updated_at')->value('value') ?: time())
                : null,
            'site_name' => LandingSetting::where('key', 'site_name')->value('value') ?: 'OMSCOMPANION',
            'login_side_image' => LandingSetting::where('key', 'login_side_image')->value('value') 
                ? route('site.login_image.stream') . '?v=' . (LandingSetting::where('key', 'login_side_image_updated_at')->value('value') ?: time())
                : null,
            'login_side_title' => LandingSetting::where('key', 'login_side_title')->value('value') ?: 'Discover your next journey',
            'login_side_subtitle' => LandingSetting::where('key', 'login_side_subtitle')->value('value') ?: 'Explore ideas, stories, and experiences designed to inspire your everyday practice.',
        ];
    }
}
