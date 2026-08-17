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

        $subject = "Membership Approved - Your OMSCOMPANION Credentials";
        $message = "Dear {$prefix}{$user->name},\n\n"
            . "Your membership application has been approved! Your unique Member ID is {$memberId}.\n\n"
            . "Account Credentials:\n"
            . "Email: {$userEmail}\n"
            . "Phone: {$userPhone}\n"
            . "Password: {$userPassword}\n\n"
            . "You can now log into your dashboard using your credentials.\n\n"
            . "Best Regards,\n"
            . "OMSCOMPANION Team";
        
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
        $prefix = !empty($user->bds_registration_number) ? 'Dr. ' : '';
        $subject = "Membership Application Update";
        $message = "Dear {$prefix}{$user->name},\n\nWe regret to inform you that your membership application could not be approved at this time. If you have questions, please contact support.\n\nBest Regards,\nOMSCOMPANION Team";
        
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
            $prefix = !empty($member->bds_registration_number) ? 'Dr. ' : '';
            $statusLabels = [
                'new' => 'New Referral',
                'contacted' => 'Contacted',
                'appointment_booked' => 'Appointment Booked',
                'under_treatment' => 'Under Treatment',
                'completed' => 'Completed',
                'not_proceeding' => 'Not Proceeding'
            ];

            $subject = "Patient Referral Status Update: {$referral->patient_name}";
            $message = "Dear {$prefix}{$member->name},\n\nThe status of your referred patient, {$referral->patient_name}, has been updated to: \"{$statusLabels[$newStatus]}\".\nNotes: " . ($request->notes ?: 'None') . "\n\nTrack progress on your live case tracker dashboard.\n\nBest Regards,\nOMSCOMPANION Team";
            
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
            $prefix = !empty($member->bds_registration_number) ? 'Dr. ' : '';
            $subject = "Commission Payment Approved: {$referral->patient_name}";
            $message = "Dear {$prefix}{$member->name},\n\nWe have processed your referral commission payment of {$amount} USD for patient {$referral->patient_name}.\nStatus: Paid.\n\nThank you for your referral.\n\nBest Regards,\nOMSCOMPANION Team";
            
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

        $prefix = !empty($user->bds_registration_number) ? 'Dr. ' : '';

        if ($request->status === 'approved') {
            $subject = "Premium Videos Access Approved!";
            $message = "Dear {$prefix}{$user->name},\n\nWe are pleased to inform you that your request to access our Premium Video Library has been APPROVED by the admin. You can now stream all premium clinical tutorials under the \"Premium Videos\" section.\n\nBest Regards,\nOMSCOMPANION Team";
        } else {
            $subject = "Premium Videos Access Request Update";
            $message = "Dear {$prefix}{$user->name},\n\nYour request for access to our Premium Video Library has been rejected.\n\nBest Regards,\nOMSCOMPANION Team";
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
        $typeLabel = $video->is_free ? 'Free Preview' : 'Premium';
        $title = "New {$typeLabel} YouTube Video: {$video->title}";
        $message = "Dear Member,\n\nA new educational video has been added to our library: \"{$video->title}\" ({$typeLabel}).\nDescription: {$video->description}\n\nLog in now to stream it.\n\nBest Regards,\nOMSCOMPANION Team";
        
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
        ]);

        foreach ($settingsData as $key => $value) {
            LandingSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Landing page settings updated successfully.');
    }
}
