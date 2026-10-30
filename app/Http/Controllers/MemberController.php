<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PatientReferral;
use App\Models\PatientStatusTimeline;
use App\Models\VideoCategory;
use App\Models\Video;
use App\Models\VideoAccessRequest;
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
            ->where('title', 'NOT LIKE', '%Commission%')
            ->where('title', 'NOT LIKE', '%Payment%')
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

        $updateData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'clinic_name' => $request->clinic_name,
            'address' => $request->address,
        ];

        if ($request->hasFile('avatar')) {
            try {
                $file = $request->file('avatar');
                if ($file && $file->isValid()) {
                    $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
                    if (in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']) && $file->getSize() <= 31457280) { // Supports high-res photos up to 30 MB
                        $filename = 'avatar_' . time() . '_' . uniqid() . '.' . $ext;
                        $destinationPath = storage_path('app/public/avatars');
                        if (!file_exists($destinationPath)) {
                            @mkdir($destinationPath, 0755, true);
                        }
                        $file->move($destinationPath, $filename);

                        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'avatar')) {
                            $updateData['avatar'] = 'avatars/' . $filename;
                        }
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Avatar storage failed during profile update: ' . $e->getMessage());
            }
        }

        $user->update($updateData);

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
        $subject = "Referral Submitted";
        $message = "Patient referral for {$referral->patient_name} successfully submitted.";
        
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

    public function videos(Request $request)
    {
        // Ensure default categories exist
        VideoCategory::firstOrCreate(
            ['name' => 'Surgical approaches'],
            ['description' => 'Surgical techniques and surgical approaches.']
        );
        VideoCategory::firstOrCreate(
            ['name' => 'Clinical lecture/ tips tricks'],
            ['description' => 'Clinical lectures, guides, and practical tips & tricks.']
        );

        $categories = VideoCategory::with('videos')->get();
        $targetVideoId = $request->query('video_id');
        $searchQuery = $request->query('search');

        if (!$targetVideoId && !empty($searchQuery)) {
            $matchedVideo = Video::where('title', 'LIKE', "%{$searchQuery}%")->first();
            if ($matchedVideo) {
                $targetVideoId = $matchedVideo->id;
            }
        }

        return Inertia::render('Member/VideoLibrary', [
            'categories' => $categories,
            'targetVideoId' => $targetVideoId,
            'initialSearch' => $searchQuery,
        ]);
    }

    public function requestPremiumAccess(Request $request)
    {
        $user = Auth::user();
        $user->update([
            'premium_access' => 'pending'
        ]);

        return redirect()->back()->with('success', 'Premium videos access request submitted successfully.');
    }

    public function notifications()
    {
        $userId = Auth::id();
        $notifications = Notification::where('user_id', $userId)
            ->where('title', 'NOT LIKE', '%Commission%')
            ->where('title', 'NOT LIKE', '%Payment%')
            ->orderBy('created_at', 'desc')
            ->get();

        $unreadCount = Notification::where('user_id', $userId)
            ->where('title', 'NOT LIKE', '%Commission%')
            ->where('title', 'NOT LIKE', '%Payment%')
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Member/Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function goToNotification(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this notification.');
        }

        // Mark as read when clicked
        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        $destination = $this->resolveNotificationDestination($notification);

        return redirect($destination);
    }

    public function markNotificationRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            abort(403, 'Unauthorized access to this notification.');
        }

        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return redirect()->back();
    }

    public function markAllNotificationsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('title', 'NOT LIKE', '%Commission%')
            ->where('title', 'NOT LIKE', '%Payment%')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return redirect()->back()->with('success', 'All notifications marked as read.');
    }

    protected function resolveNotificationDestination(Notification $notification): string
    {
        if (!empty($notification->action_url)) {
            return $notification->action_url;
        }

        $title = $notification->title ?? '';
        $message = $notification->message ?? '';
        $titleLower = strtolower($title);
        $messageLower = strtolower($message);

        // 1. Video Notifications (New Video added, video approved, etc.)
        if (str_contains($titleLower, 'video') || str_contains($messageLower, 'video')) {
            $vidTitle = '';
            if (preg_match('/New Video:\s*(.*)/i', $title, $matches)) {
                $vidTitle = trim($matches[1]);
            } elseif (preg_match('/video added:\s*["\']?(.*?)["\']?\./i', $message, $matches)) {
                $vidTitle = trim($matches[1]);
            }

            if (!empty($vidTitle)) {
                $video = Video::where('title', 'LIKE', "%{$vidTitle}%")->first();
                if ($video) {
                    return route('member.videos', ['video_id' => $video->id]);
                }
                return route('member.videos', ['search' => $vidTitle]);
            }

            // Fallback: check if any recent video title is in notification text
            $recentVideos = Video::latest()->take(30)->get(['id', 'title']);
            foreach ($recentVideos as $v) {
                if (stripos($title, $v->title) !== false || stripos($message, $v->title) !== false) {
                    return route('member.videos', ['video_id' => $v->id]);
                }
            }

            return route('member.videos');
        }

        // 2. Referral Notifications (Status update, assignment, submission)
        if (str_contains($titleLower, 'referral') || str_contains($messageLower, 'patient referral')) {
            // Check if title has "Referral Status Update: [Patient Name]"
            if (preg_match('/Referral Status Update:\s*(.*)/i', $title, $matches)) {
                $patientName = trim($matches[1]);
                $referral = PatientReferral::where('member_id', Auth::id())
                    ->where('patient_name', 'LIKE', "%{$patientName}%")
                    ->orderBy('created_at', 'desc')
                    ->first();
                if ($referral) {
                    return route('member.referrals.tracker', $referral->id);
                }
                return route('member.referrals') . '?search=' . urlencode($patientName);
            }
            return route('member.referrals');
        }

        // 3. Profile / Account Settings
        if (
            str_contains($titleLower, 'account') || 
            str_contains($titleLower, 'profile') || 
            str_contains($titleLower, 'member') || 
            str_contains($titleLower, 'register') || 
            str_contains($titleLower, 'approved')
        ) {
            return route('member.profile');
        }

        // 4. Mobile App Download
        if (
            str_contains($titleLower, 'mobile app') || 
            str_contains($messageLower, 'mobile app') || 
            str_contains($titleLower, 'install app')
        ) {
            return route('app.download');
        }

        return route('member.dashboard');
    }
}
