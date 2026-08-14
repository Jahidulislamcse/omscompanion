<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PatientReferral;
use App\Models\PatientStatusTimeline;
use App\Models\VideoCategory;
use App\Models\Video;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function dashboard()
    {
        $userId = Auth::id();
        $user = Auth::user();

        $totalReferrals = PatientReferral::where('member_id', $userId)->count();
        $activeCases = PatientReferral::where('member_id', $userId)
            ->whereNotIn('status', ['completed', 'not_proceeding'])
            ->count();
        $completedCases = PatientReferral::where('member_id', $userId)
            ->where('status', 'completed')
            ->count();

        $pendingCommissions = PatientReferral::where('member_id', $userId)
            ->where('commission_status', 'pending')
            ->sum('commission_amount');
        $paidCommissions = PatientReferral::where('member_id', $userId)
            ->where('commission_status', 'paid')
            ->sum('commission_amount');

        $recentReferrals = PatientReferral::where('member_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentNotifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Member/Dashboard', [
            'stats' => [
                'total_referrals' => $totalReferrals,
                'active_cases' => $activeCases,
                'completed_cases' => $completedCases,
                'pending_commissions' => floatval($pendingCommissions),
                'paid_commissions' => floatval($paidCommissions),
            ],
            'recentReferrals' => $recentReferrals,
            'recentNotifications' => $recentNotifications,
        ]);
    }

    public function profile()
    {
        return Inertia::render('Member/Profile', [
            'user' => Auth::user()
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'clinic_name' => 'required|string|max:255',
            'address' => 'required|string',
        ]);

        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'clinic_name' => $request->clinic_name,
            'address' => $request->address,
        ]);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    public function referrals()
    {
        $userId = Auth::id();
        $referrals = PatientReferral::where('member_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Member/Referrals', [
            'referrals' => $referrals
        ]);
    }

    public function storeReferral(Request $request)
    {
        $request->validate([
            'patient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'medical_condition' => 'required|string',
            'urgency_level' => 'required|in:low,medium,high,critical',
            'additional_notes' => 'nullable|string',
        ]);

        $referral = PatientReferral::create([
            'member_id' => Auth::id(),
            'patient_name' => $request->patient_name,
            'phone' => $request->phone,
            'medical_condition' => $request->medical_condition,
            'urgency_level' => $request->urgency_level,
            'status' => 'new',
            'additional_notes' => $request->additional_notes,
        ]);

        // Create initial timeline entry
        PatientStatusTimeline::create([
            'referral_id' => $referral->id,
            'status' => 'new',
            'notes' => 'Referral submitted by doctor.',
            'changed_by' => Auth::id(),
        ]);

        // Send notifications to member
        $member = Auth::user();
        $prefix = !empty($member->bds_registration_number) ? 'Dr. ' : '';
        $subject = "Referral Submitted: {$referral->patient_name}";
        $message = "Dear {$prefix}{$member->name},\n\nYour patient referral for {$referral->patient_name} has been successfully submitted. You can track this case live in your referral history dashboard.\n\nBest Regards,\nDentistChamber Team";
        
        NotificationService::send($member, $subject, $message, 'both');

        // Log notification for Admin (optional backend log)
        \Illuminate\Support\Facades\Log::info("[ADMIN SYSTEM NOTIFICATION] New patient referral submitted by {$prefix}{$member->name} for patient: {$referral->patient_name}.");

        return redirect()->back()->with('success', 'Patient referral submitted successfully.');
    }

    public function tracker(PatientReferral $referral)
    {
        // Security check: only own doctor can view case tracker
        if ($referral->member_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this case timeline.');
        }

        $referral->load(['timeline' => function ($query) {
            $query->orderBy('created_at', 'desc');
        }, 'timeline.changer']);

        return Inertia::render('Member/ReferralTracker', [
            'referral' => $referral
        ]);
    }

    public function videos()
    {
        $categories = VideoCategory::with('videos')->get();

        return Inertia::render('Member/VideoLibrary', [
            'categories' => $categories
        ]);
    }

    public function notifications()
    {
        $userId = Auth::id();
        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Mark all unread as read
        Notification::where('user_id', $userId)->whereNull('read_at')->update([
            'read_at' => now()
        ]);

        return Inertia::render('Member/Notifications', [
            'notifications' => $notifications
        ]);
    }
}
