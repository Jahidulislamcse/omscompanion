<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PatientReferral;
use App\Models\PatientStatusTimeline;
use App\Models\VideoCategory;
use App\Models\Video;
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

        // Calculate some simple video views placeholder or log stats
        $videoStats = [
            'total_categories' => $totalCategories,
            'total_videos' => $totalVideos,
        ];

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
        $subject = "Membership Approved - dentist chamber";
        $message = "Dear Dr. {$user->name},\n\nYour membership application has been approved! Your unique Member ID is {$memberId}. You can now log into your dashboard using your registered credentials.\n\nBest Regards,\nDentistChamber Team";
        
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
        $subject = "Membership Application Update";
        $message = "Dear Dr. {$user->name},\n\nWe regret to inform you that your membership application could not be approved at this time. If you have questions, please contact support.\n\nBest Regards,\nDentistChamber Team";
        
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

            $subject = "Patient Referral Status Update: {$referral->patient_name}";
            $message = "Dear Dr. {$member->name},\n\nThe status of your referred patient, {$referral->patient_name}, has been updated to: \"{$statusLabels[$newStatus]}\".\nNotes: " . ($request->notes ?: 'None') . "\n\nTrack progress on your live case tracker dashboard.\n\nBest Regards,\nDentistChamber Team";
            
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
            $subject = "Commission Payment Approved: {$referral->patient_name}";
            $message = "Dear Dr. {$member->name},\n\nWe have processed your referral commission payment of {$amount} USD for patient {$referral->patient_name}.\nStatus: Paid.\n\nThank you for your referral.\n\nBest Regards,\nDentistChamber Team";
            
            NotificationService::send($member, $subject, $message, 'both');
        }

        return redirect()->back()->with('success', 'Commission settings updated successfully.');
    }

    public function videos()
    {
        $categories = VideoCategory::with('videos')->get();
        $videos = Video::with('category')->orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Videos', [
            'categories' => $categories,
            'videos' => $videos,
        ]);
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
            'storage_type' => 'required|in:local,external',
            'video_file' => 'required_if:storage_type,local|file|mimes:mp4,mov,avi,mkv|max:51200', // max 50MB
            'video_url' => 'required_if:storage_type,external|nullable|url',
            'duration' => 'nullable|integer|min:0',
        ]);

        $videoPath = '';

        if ($request->storage_type === 'local') {
            if ($request->hasFile('video_file')) {
                $file = $request->file('video_file');
                $filename = time() . '_' . $file->getClientOriginalName();
                $path = $file->storeAs('videos', $filename, 'local'); // stored in storage/app/videos
                $videoPath = $path;
            }
        } else {
            $videoPath = $request->video_url;
        }

        $video = Video::create([
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'video_path' => $videoPath,
            'storage_type' => $request->storage_type,
            'duration' => $request->duration,
        ]);

        // Notify members about new premium video
        $title = "New Premium Video Uploaded: {$video->title}";
        $message = "Dear Member,\n\nA new educational video has been uploaded to our premium library: \"{$video->title}\".\nDescription: {$video->description}\n\nLog in now to stream it.\n\nBest Regards,\nDentistChamber Team";
        
        NotificationService::broadcastToMembers($title, $message);

        return redirect()->back()->with('success', 'Video uploaded successfully.');
    }
}
