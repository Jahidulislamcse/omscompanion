<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PatientReferral;
use App\Models\PatientStatusTimeline;
use App\Models\VideoCategory;
use App\Models\Video;
use App\Models\VideoAccessRequest;
use App\Models\LandingSetting;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        $totalMembers = User::where('role', 'member')->count();
        $activeMembers = User::where('role', 'member')->where('status', 'approved')->count();
        
        $totalReferrals = PatientReferral::count();
        $activeCases = PatientReferral::whereNotIn('status', ['completed', 'not_proceeding'])->count();
        $completedTreatments = PatientReferral::where('status', 'completed')->count();
        
        $pendingCommissions = PatientReferral::where('commission_status', 'pending')->sum('commission_amount');
        $paidCommissions = PatientReferral::where('commission_status', 'paid')->sum('commission_amount');
        
        $totalCategories = VideoCategory::count();
        $totalVideos = Video::count();

        $videoStats = [
            'total_categories' => $totalCategories,
            'total_videos' => $totalVideos,
        ];

        // Real Monthly Referral Volume (Last 6 Months)
        $monthlyVolume = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = PatientReferral::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            
            $monthlyVolume[] = [
                'month' => $date->format('M'),
                'year' => $date->year,
                'count' => $count,
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_members' => $totalMembers,
                'active_members' => $activeMembers,
                'total_referrals' => $totalReferrals,
                'active_cases' => $activeCases,
                'completed_treatments' => $completedTreatments,
                'pending_commissions' => floatval($pendingCommissions),
                'paid_commissions' => floatval($paidCommissions),
                'video_stats' => $videoStats,
                'monthly_referral_volume' => $monthlyVolume,
            ]
        ]);
    }

    public function members()
    {
        $members = User::where('role', 'member')
            ->orderByRaw("FIELD(status, 'pending', 'approved', 'rejected')")
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Members', [
            'members' => $members
        ]);
    }

    public function approveMember(User $user)
    {
        if ($user->role !== 'member' || $user->status === 'approved') {
            return back()->withErrors(['error' => 'Invalid user status.']);
        }

        // Generate unique member ID: MEM-YYYY-XXXX
        $year = now()->year;
        $count = User::whereYear('approved_at', $year)->count() + 1;
        $memberId = 'MEM-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        $user->update([
            'status' => 'approved',
            'member_id' => $memberId,
            'approved_at' => now(),
        ]);

        // Send notifications
        $prefix = !empty($user->bds_registration_number) ? 'Dr. ' : '';
        $userEmail = $user->email ?? 'N/A';
        $userPhone = $user->phone ?? 'N/A';
        $userPassword = $user->raw_password ?? '(Registered password)';

        $subject = "Membership Approved";
        $message = "Your membership has been approved (ID: {$memberId}). Login Email: {$userEmail} | Password: {$userPassword}";
        
        NotificationService::send($user, $subject, $message, 'both');

        return redirect()->back()->with('success', "Member approved successfully with ID: {$memberId}");
    }

    public function rejectMember(User $user)
    {
        if ($user->role !== 'member' || $user->status !== 'pending') {
            return back()->withErrors(['error' => 'Only pending members can be rejected.']);
        }

        $user->update([
            'status' => 'rejected',
        ]);

        // Send notification
        $subject = "Membership Update";
        $message = "Your membership application could not be approved at this time.";
        
        NotificationService::send($user, $subject, $message, 'email');

        return redirect()->back()->with('success', 'Member registration rejected.');
    }

    public function referrals()
    {
        $referrals = PatientReferral::with('member')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Referrals', [
            'referrals' => $referrals
        ]);
    }

    public function updateReferralStatus(Request $request, PatientReferral $referral)
    {
        $request->validate([
            'status' => 'required|in:new,contacted,appointment_booked,under_treatment,completed,not_proceeding',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $referral->status;
        $newStatus = $request->status;

        if ($oldStatus !== $newStatus) {
            $referral->update([
                'status' => $newStatus
            ]);

            // Log to timeline
            PatientStatusTimeline::create([
                'referral_id' => $referral->id,
                'status' => $newStatus,
                'notes' => $request->notes,
                'changed_by' => Auth::id(),
            ]);

            // Notify referring member
            $member = $referral->member;
            $statusLabels = [
                'new' => 'New Referral',
                'contacted' => 'Contacted',
                'appointment_booked' => 'Appointment Booked',
                'under_treatment' => 'Under Treatment',
                'completed' => 'Completed',
                'not_proceeding' => 'Not Proceeding'
            ];

            $subject = "Referral Status Update: {$referral->patient_name}";
            $message = "Patient {$referral->patient_name} status updated to \"{$statusLabels[$newStatus]}\"." . ($request->notes ? " Note: {$request->notes}" : "");
            
            NotificationService::send($member, $subject, $message, 'both');
        }

        return redirect()->back()->with('success', 'Patient referral status updated.');
    }

    public function updateCommission(Request $request, PatientReferral $referral)
    {
        $request->validate([
            'commission_amount' => 'required|numeric|min:0',
            'commission_status' => 'required|in:none,pending,paid',
        ]);

        $oldStatus = $referral->commission_status;
        $newStatus = $request->commission_status;
        $amount = $request->commission_amount;

        $referral->update([
            'commission_amount' => $amount,
            'commission_status' => $newStatus
        ]);

        if ($oldStatus !== $newStatus && $newStatus === 'paid') {
            // Notify member of commission paid
            $member = $referral->member;
            $subject = "Commission Paid: {$referral->patient_name}";
            $message = "Commission payment of \${$amount} for patient {$referral->patient_name} has been processed.";
            
            NotificationService::send($member, $subject, $message, 'both');
        }

        return redirect()->back()->with('success', 'Commission settings updated successfully.');
    }

    public function videos()
    {
        $categories = VideoCategory::with('videos')->get();
        $videos = Video::with('category')->orderBy('created_at', 'desc')->get();
        
        $accessRequests = User::where('role', 'member')
            ->whereIn('premium_access', ['pending', 'approved', 'rejected'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Admin/Videos', [
            'categories' => $categories,
            'videos' => $videos,
            'accessRequests' => $accessRequests,
        ]);
    }

    public function updatePremiumAccess(Request $request, User $user)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $user->update([
            'premium_access' => $request->status,
        ]);

        if ($request->status === 'approved') {
            $subject = "Video Access Approved";
            $message = "Your request to access Videos has been approved. You can now stream all clinical tutorials.";
        } else {
            $subject = "Video Access Update";
            $message = "Your request to access Videos was not approved.";
        }

        NotificationService::send($user, $subject, $message, 'both');

        return redirect()->back()->with('success', 'Member premium access request updated to ' . $request->status . '.');
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:video_categories',
            'description' => 'nullable|string',
        ]);

        VideoCategory::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        return redirect()->back()->with('success', 'Video category created successfully.');
    }

    public function storeVideo(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:video_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'required|string',
            'duration' => 'nullable|integer|min:0',
            'is_free' => 'nullable|boolean',
        ]);

        $video = Video::create([
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'video_path' => $request->video_url,
            'storage_type' => 'youtube',
            'duration' => $request->duration,
            'is_free' => $request->boolean('is_free'),
        ]);

        // Notify members about new video
        $typeLabel = $video->is_free ? 'Free' : 'Premium';
        $title = "New Video: {$video->title}";
        $message = "New {$typeLabel} video added: \"{$video->title}\". Log in now to watch.";
        
        NotificationService::broadcastToMembers($title, $message);

        return redirect()->back()->with('success', 'Video uploaded successfully.');
    }

    public function pageContent()
    {
        $settings = LandingSetting::all()->pluck('value', 'key')->toArray();

        return Inertia::render('Admin/PageContent', [
            'settings' => $settings
        ]);
    }

    public function updatePageContent(Request $request)
    {
        $request->validate([
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string',
            'goal_1_title' => 'required|string|max:255',
            'goal_1_desc' => 'required|string',
            'goal_2_title' => 'required|string|max:255',
            'goal_2_desc' => 'required|string',
            'goal_3_title' => 'required|string|max:255',
            'goal_3_desc' => 'required|string',
            'goal_4_title' => 'required|string|max:255',
            'goal_4_desc' => 'required|string',
            'site_name' => 'nullable|string|max:255',
            'site_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'remove_logo' => 'nullable|boolean',
            'hero_banner' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'remove_banner' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_logo')) {
            LandingSetting::where('key', 'site_logo')->delete();
        } elseif ($request->hasFile('site_logo')) {
            $file = $request->file('site_logo');
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'logo_' . time() . '.' . $extension;

            $destinationPath = storage_path('app/public/logos');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);

            LandingSetting::updateOrCreate(
                ['key' => 'site_logo'],
                ['value' => 'storage/logos/' . $filename]
            );
        }

        if ($request->boolean('remove_banner')) {
            LandingSetting::where('key', 'hero_banner')->delete();
        } elseif ($request->hasFile('hero_banner')) {
            $file = $request->file('hero_banner');
            $extension = $file->getClientOriginalExtension() ?: 'png';
            $filename = 'banner_' . time() . '.' . $extension;

            $destinationPath = storage_path('app/public/banners');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);

            LandingSetting::updateOrCreate(
                ['key' => 'hero_banner'],
                ['value' => 'storage/banners/' . $filename]
            );
        }

        $settingsData = $request->only([
            'site_name',
            'hero_title',
            'hero_subtitle',
            'goal_1_title',
            'goal_1_desc',
            'goal_2_title',
            'goal_2_desc',
            'goal_3_title',
            'goal_3_desc',
            'goal_4_title',
            'goal_4_desc',
            'footer_office_location',
            'footer_contact_phone',
            'footer_contact_email',
            'footer_facebook_url',
        ]);

        foreach ($settingsData as $key => $value) {
            LandingSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Landing page settings updated successfully.');
    }

    public function profile()
    {
        return Inertia::render('Admin/Profile', [
            'user' => Auth::user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
            $updateData['raw_password'] = $request->password;
        }

        $user->update($updateData);

        return redirect()->back()->with('success', 'Admin profile updated successfully.');
    }
}
