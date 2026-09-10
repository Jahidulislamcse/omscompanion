<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\PatientReferral;
use App\Models\PatientStatusTimeline;
use App\Models\VideoCategory;
use App\Models\Video;
use App\Models\VideoAccessRequest;
use App\Models\LandingSetting;
use App\Models\TeamMember;
use App\Models\Service;
use App\Models\Review;
use App\Models\NewsItem;
use App\Models\ContactMessage;
use App\Services\NotificationService;
use App\Services\PushNotificationService;
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
        $pendingMembers = User::where('role', 'member')->where('status', 'pending')->count();
        
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
                'pending_members' => $pendingMembers,
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
            ->with(['referrals' => function($q) {
                $q->orderBy('created_at', 'desc');
            }])
            ->orderByRaw("CASE status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 ELSE 4 END")
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

        // Generate guaranteed unique member ID: MEM-YYYY-XXXX
        $year = now()->year;
        $count = User::whereYear('approved_at', $year)->count() + 1;
        do {
            $memberId = 'MEM-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            $exists = User::where('member_id', $memberId)->exists();
            if ($exists) {
                $count++;
            }
        } while ($exists);

        try {
            $user->update([
                'status' => 'approved',
                'member_id' => $memberId,
                'approved_at' => now(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("Failed updating member status/ID: " . $e->getMessage());
            $fallbackMemberId = 'MEM-' . $year . '-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $user->update([
                'status' => 'approved',
                'member_id' => $fallbackMemberId,
                'approved_at' => now(),
            ]);
            $memberId = $fallbackMemberId;
        }

        // Send notifications safely
        try {
            $userEmail = $user->email ?? 'N/A';
            $userPassword = $user->raw_password ?? '(Registered password)';

            $subject = "Membership Approved";
            $message = "Your membership has been approved (ID: {$memberId}). Login Email: {$userEmail} | Password: {$userPassword}";
            
            NotificationService::send($user, $subject, $message, 'both');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Approval notification failed: ' . $e->getMessage());
        }

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

        // Send notification safely
        try {
            $subject = "Membership Update";
            $message = "Your membership application could not be approved at this time.";
            
            NotificationService::send($user, $subject, $message, 'email');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Rejection notification failed: ' . $e->getMessage());
        }

        return redirect()->back()->with('success', 'Member registration rejected.');
    }

    public function updateMemberCommission(Request $request, User $user)
    {
        $request->validate([
            'is_commission_applicable' => 'required|boolean',
            'commission_note' => 'nullable|string|max:100',
        ]);

        $user->update([
            'is_commission_applicable' => $request->is_commission_applicable,
            'commission_note' => $request->commission_note,
        ]);

        return redirect()->back()->with('success', 'Member commission settings updated successfully.');
    }

    public function referrals()
    {
        $referrals = PatientReferral::with(['member', 'timeline' => function($q) {
                $q->orderBy('created_at', 'desc');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        $members = User::where('role', 'member')
            ->where('status', 'approved')
            ->select('id', 'name', 'member_id', 'bds_registration_number', 'phone', 'clinic_name', 'is_commission_applicable', 'commission_note', 'avatar')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Admin/Referrals', [
            'referrals' => $referrals,
            'members' => $members,
        ]);
    }

    public function storeReferral(Request $request)
    {
        $request->validate([
            'patient_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'patient_address' => 'nullable|string',
            'medical_condition' => 'required|string',
            'urgency_level' => 'required|in:low,medium,high,critical',
            'member_id' => 'nullable|exists:users,id',
            'additional_notes' => 'nullable|string',
            'commission_amount' => 'nullable|numeric|min:0',
            'commission_status' => 'nullable|in:none,pending,paid',
        ]);

        $memberId = $request->member_id ? $request->member_id : null;
        $referrerType = $memberId ? 'doctor' : 'guest';

        $commissionStatus = $request->commission_status;
        if (empty($commissionStatus)) {
            if ($memberId) {
                $member = User::find($memberId);
                $commissionStatus = ($member && $member->is_commission_applicable) ? 'pending' : 'none';
            } else {
                $commissionStatus = 'none';
            }
        }

        $referral = PatientReferral::create([
            'member_id' => $memberId,
            'referrer_type' => $referrerType,
            'patient_name' => $request->patient_name,
            'phone' => $request->phone,
            'patient_address' => $request->patient_address,
            'medical_condition' => $request->medical_condition,
            'urgency_level' => $request->urgency_level,
            'status' => 'new',
            'additional_notes' => $request->additional_notes,
            'commission_amount' => $request->commission_amount ?? 0,
            'commission_status' => $commissionStatus,
        ]);

        // Create initial timeline entry
        PatientStatusTimeline::create([
            'referral_id' => $referral->id,
            'status' => 'new',
            'notes' => $request->additional_notes ? $request->additional_notes : ('Referral created by Admin' . ($memberId ? ' and assigned to member.' : '.')),
            'changed_by' => Auth::id(),
        ]);

        // If assigned to a member, send notification to that member
        if ($memberId) {
            $member = User::find($memberId);
            if ($member) {
                $prefix = !empty($member->bds_registration_number) ? 'Dr. ' : '';
                $subject = "New Patient Referral Assigned";
                $message = "A new patient referral for {$referral->patient_name} has been submitted and assigned to your account by Admin.";
                NotificationService::send($member, $subject, $message, 'both');
            }
        }

        return redirect()->back()->with('success', 'Patient referral created successfully.');
    }

    public function updateReferralStatus(Request $request, PatientReferral $referral)
    {
        $request->validate([
            'status' => 'required|in:new,contacted,appointment_booked,under_treatment,completed,not_proceeding',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $referral->status;
        $newStatus = $request->status;

        $referral->update([
            'status' => $newStatus
        ]);

        // Log to timeline
        PatientStatusTimeline::create([
            'referral_id' => $referral->id,
            'status' => $newStatus,
            'notes' => $request->notes ? $request->notes : "Status updated to " . str_replace('_', ' ', ucfirst($newStatus)),
            'changed_by' => Auth::id(),
        ]);

        // Notify referring member if exists
        $member = $referral->member;
        if ($member) {
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
            'commission_amount' => 'nullable|numeric|min:0',
            'commission_status' => 'required|in:none,pending,paid',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $referral->commission_status;
        $newStatus = $request->commission_status;
        $amount = $request->input('commission_amount', $referral->commission_amount ?? 0);

        $referral->update([
            'commission_amount' => $amount,
            'commission_status' => $newStatus,
            'commission_notes' => $request->notes,
        ]);

        if ($request->notes || $oldStatus !== $newStatus) {
            $noteMsg = $request->notes 
                ? $request->notes 
                : ("Commission status updated to " . ucfirst($newStatus));

            PatientStatusTimeline::create([
                'referral_id' => $referral->id,
                'status' => $referral->status,
                'notes' => $noteMsg,
                'changed_by' => Auth::id(),
            ]);
        }

        return redirect()->back()->with('success', 'Commission settings updated successfully.');
    }

    public function updateReferralNote(Request $request, PatientReferral $referral)
    {
        $request->validate([
            'notes' => 'required|string',
        ]);

        $referral->update([
            'commission_notes' => $request->notes,
        ]);

        PatientStatusTimeline::create([
            'referral_id' => $referral->id,
            'status' => $referral->status,
            'notes' => $request->notes,
            'changed_by' => Auth::id(),
        ]);

        return redirect()->back()->with('success', 'Note saved successfully.');
    }

    public function videos()
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

    public function updateVideo(Request $request, Video $video)
    {
        $request->validate([
            'category_id' => 'required|exists:video_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'required|string',
            'duration' => 'nullable|integer|min:0',
            'is_free' => 'nullable|boolean',
        ]);

        $video->update([
            'category_id' => $request->category_id,
            'title' => $request->title,
            'description' => $request->description,
            'video_path' => $request->video_url,
            'duration' => $request->duration,
            'is_free' => $request->boolean('is_free'),
        ]);

        return redirect()->back()->with('success', 'Video updated successfully.');
    }

    public function destroyVideo(Video $video)
    {
        $video->delete();

        return redirect()->back()->with('success', 'Video deleted successfully.');
    }

    public function pageContent()
    {
        $settings = LandingSetting::all()->pluck('value', 'key')->toArray();
        $teamMembers = TeamMember::orderBy('level', 'asc')->orderBy('order_index', 'asc')->get();
        $services = Service::orderBy('order_index', 'asc')->orderBy('id', 'asc')->get();
        $reviews = Review::orderBy('order_index', 'asc')->orderBy('id', 'desc')->get();
        $newsItems = NewsItem::orderBy('order_index', 'asc')->orderBy('id', 'desc')->get();

        return Inertia::render('Admin/PageContent', [
            'settings' => $settings,
            'teamMembers' => $teamMembers,
            'services' => $services,
            'reviews' => $reviews,
            'newsItems' => $newsItems,
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
            'site_logo' => 'nullable|file|max:2048',
            'remove_logo' => 'nullable|boolean',
            'hero_banner' => 'nullable|file|max:5120',
            'remove_banner' => 'nullable|boolean',
            'login_side_image' => 'nullable|file|max:5120',
            'remove_login_image' => 'nullable|boolean',
            'login_side_title' => 'nullable|string|max:255',
            'login_side_subtitle' => 'nullable|string',
            'about_title' => 'nullable|string|max:255',
            'about_description' => 'nullable|string',
            'services_subtitle' => 'nullable|string',
            'whatsapp_number' => 'nullable|string|max:50',
        ]);

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];

        if ($request->boolean('remove_logo')) {
            LandingSetting::where('key', 'site_logo')->delete();
            LandingSetting::where('key', 'site_logo_updated_at')->delete();
        } elseif ($request->hasFile('site_logo')) {
            $file = $request->file('site_logo');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            if (!in_array($extension, $allowedExtensions)) {
                return back()->withErrors(['site_logo' => 'The logo file must be a valid image (jpg, png, gif, svg, webp).']);
            }
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
            LandingSetting::updateOrCreate(
                ['key' => 'site_logo_updated_at'],
                ['value' => (string) time()]
            );
        }

        if ($request->boolean('remove_banner')) {
            LandingSetting::where('key', 'hero_banner')->delete();
            LandingSetting::where('key', 'hero_banner_updated_at')->delete();
        } elseif ($request->hasFile('hero_banner')) {
            $file = $request->file('hero_banner');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            if (!in_array($extension, $allowedExtensions)) {
                return back()->withErrors(['hero_banner' => 'The banner file must be a valid image (jpg, png, gif, svg, webp).']);
            }
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
            LandingSetting::updateOrCreate(
                ['key' => 'hero_banner_updated_at'],
                ['value' => (string) time()]
            );
        }

        if ($request->boolean('remove_login_image')) {
            LandingSetting::where('key', 'login_side_image')->delete();
            LandingSetting::where('key', 'login_side_image_updated_at')->delete();
        } elseif ($request->hasFile('login_side_image')) {
            $file = $request->file('login_side_image');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            if (!in_array($extension, $allowedExtensions)) {
                return back()->withErrors(['login_side_image' => 'The login side image must be a valid image (jpg, png, gif, svg, webp).']);
            }
            $filename = 'login_' . time() . '.' . $extension;

            $destinationPath = storage_path('app/public/login_images');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }

            $file->move($destinationPath, $filename);

            LandingSetting::updateOrCreate(
                ['key' => 'login_side_image'],
                ['value' => 'storage/login_images/' . $filename]
            );
            LandingSetting::updateOrCreate(
                ['key' => 'login_side_image_updated_at'],
                ['value' => (string) time()]
            );
        }

        $settingsData = $request->only([
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
            'login_side_title',
            'login_side_subtitle',
            'footer_office_location',
            'footer_contact_phone',
            'footer_contact_email',
            'footer_facebook_url',
            'whatsapp_number',
            'about_title',
            'about_description',
            'services_subtitle',
        ]);

        foreach ($settingsData as $key => $value) {
            LandingSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Landing page settings updated successfully.');
    }

    public function storeService(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'prefix' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order_index' => 'nullable|integer',
            'image' => 'nullable|file|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            $filename = 'service_' . time() . '_' . uniqid() . '.' . $extension;
            $destinationPath = storage_path('app/public/services');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }
            $file->move($destinationPath, $filename);
            $imagePath = 'storage/services/' . $filename;
        }

        Service::create([
            'title' => strtoupper($request->title),
            'prefix' => $request->prefix ? strtoupper($request->prefix) : null,
            'description' => $request->description,
            'image_path' => $imagePath,
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()->with('success', 'Service item added successfully.');
    }

    public function updateService(Request $request, Service $service)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'prefix' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order_index' => 'nullable|integer',
            'image' => 'nullable|file|max:5120',
            'remove_image' => 'nullable|boolean',
        ]);

        $imagePath = $service->image_path;

        if ($request->boolean('remove_image')) {
            $imagePath = null;
        } elseif ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            $filename = 'service_' . time() . '_' . uniqid() . '.' . $extension;
            $destinationPath = storage_path('app/public/services');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }
            $file->move($destinationPath, $filename);
            $imagePath = 'storage/services/' . $filename;
        }

        $service->update([
            'title' => strtoupper($request->title),
            'prefix' => $request->prefix ? strtoupper($request->prefix) : null,
            'description' => $request->description,
            'image_path' => $imagePath,
            'order_index' => $request->order_index ?? 0,
        ]);

        return redirect()->back()->with('success', 'Service item updated successfully.');
    }

    public function destroyService(Service $service)
    {
        $service->delete();

        return redirect()->back()->with('success', 'Service item deleted successfully.');
    }

    public function storeTeamMember(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'level' => 'required|integer|min:1|max:5',
            'order_index' => 'nullable|integer',
            'image' => 'nullable|file|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            $filename = 'team_' . time() . '_' . uniqid() . '.' . $extension;
            $destinationPath = storage_path('app/public/team');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }
            $file->move($destinationPath, $filename);
            $imagePath = 'storage/team/' . $filename;
        }

        TeamMember::create([
            'name' => $request->name,
            'title' => $request->title,
            'specialization' => $request->specialization,
            'designation' => $request->designation,
            'level' => $request->level,
            'order_index' => $request->order_index ?? 0,
            'image_path' => $imagePath,
        ]);

        return redirect()->back()->with('success', 'Team member added successfully.');
    }

    public function updateTeamMember(Request $request, TeamMember $teamMember)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'title' => 'nullable|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'level' => 'required|integer|min:1|max:5',
            'order_index' => 'nullable|integer',
            'image' => 'nullable|file|max:5120',
        ]);

        $data = [
            'name' => $request->name,
            'title' => $request->title,
            'specialization' => $request->specialization,
            'designation' => $request->designation,
            'level' => $request->level,
            'order_index' => $request->order_index ?? 0,
        ];

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
            $filename = 'team_' . time() . '_' . uniqid() . '.' . $extension;
            $destinationPath = storage_path('app/public/team');
            if (!file_exists($destinationPath)) {
                @mkdir($destinationPath, 0755, true);
            }
            $file->move($destinationPath, $filename);
            $data['image_path'] = 'storage/team/' . $filename;
        }

        $teamMember->update($data);

        return redirect()->back()->with('success', 'Team member updated successfully.');
    }

    public function destroyTeamMember(TeamMember $teamMember)
    {
        $teamMember->delete();

        return redirect()->back()->with('success', 'Team member deleted successfully.');
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

    public function messages()
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Messages', [
            'messages' => $messages
        ]);
    }

    public function markMessageRead(ContactMessage $message)
    {
        $message->update(['is_read' => !$message->is_read]);

        return redirect()->back()->with('success', 'Message status updated.');
    }

    public function destroyMessage(ContactMessage $message)
    {
        $message->delete();

        return redirect()->back()->with('success', 'Message deleted successfully.');
    }

    public function storeReview(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'quote' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'tag' => 'nullable|string|max:255',
            'order_index' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        Review::create([
            'name' => $request->name,
            'role' => $request->role,
            'location' => $request->location,
            'quote' => $request->quote,
            'rating' => $request->rating ?? 5,
            'tag' => $request->tag,
            'order_index' => $request->order_index ?? 0,
            'is_published' => $request->boolean('is_published', true),
        ]);

        return redirect()->back()->with('success', 'Doctor review added successfully.');
    }

    public function updateReview(Request $request, Review $review)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'quote' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'tag' => 'nullable|string|max:255',
            'order_index' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $review->update([
            'name' => $request->name,
            'role' => $request->role,
            'location' => $request->location,
            'quote' => $request->quote,
            'rating' => $request->rating ?? 5,
            'tag' => $request->tag,
            'order_index' => $request->order_index ?? 0,
            'is_published' => $request->has('is_published') ? $request->boolean('is_published') : $review->is_published,
        ]);

        return redirect()->back()->with('success', 'Doctor review updated successfully.');
    }

    public function destroyReview(Review $review)
    {
        $review->delete();

        return redirect()->back()->with('success', 'Doctor review deleted successfully.');
    }

    public function toggleReviewPublish(Review $review)
    {
        $review->update([
            'is_published' => !$review->is_published,
        ]);

        return redirect()->back()->with('success', 'Review publish status updated.');
    }

    public function storeNewsItem(Request $request)
    {
        $request->validate([
            'badge_text' => 'required|string|max:255',
            'sub_badge_text' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'button_text' => 'required|string|max:255',
            'button_url' => 'nullable|string|max:255',
            'button_type' => 'required|string|max:50',
            'theme_color' => 'required|string|max:50',
            'order_index' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        NewsItem::create([
            'badge_text' => $request->badge_text,
            'sub_badge_text' => $request->sub_badge_text,
            'title' => $request->title,
            'description' => $request->description,
            'button_text' => $request->button_text,
            'button_url' => $request->button_url,
            'button_type' => $request->button_type ?? 'outline',
            'theme_color' => $request->theme_color ?? 'indigo',
            'order_index' => $request->order_index ?? 0,
            'is_published' => $request->boolean('is_published', true),
        ]);

        return redirect()->back()->with('success', 'Clinical news & training item added successfully.');
    }

    public function updateNewsItem(Request $request, NewsItem $newsItem)
    {
        $request->validate([
            'badge_text' => 'required|string|max:255',
            'sub_badge_text' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'button_text' => 'required|string|max:255',
            'button_url' => 'nullable|string|max:255',
            'button_type' => 'required|string|max:50',
            'theme_color' => 'required|string|max:50',
            'order_index' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $newsItem->update([
            'badge_text' => $request->badge_text,
            'sub_badge_text' => $request->sub_badge_text,
            'title' => $request->title,
            'description' => $request->description,
            'button_text' => $request->button_text,
            'button_url' => $request->button_url,
            'button_type' => $request->button_type ?? 'outline',
            'theme_color' => $request->theme_color ?? 'indigo',
            'order_index' => $request->order_index ?? 0,
            'is_published' => $request->has('is_published') ? $request->boolean('is_published') : $newsItem->is_published,
        ]);

        return redirect()->back()->with('success', 'Clinical news item updated successfully.');
    }

    public function destroyNewsItem(NewsItem $newsItem)
    {
        $newsItem->delete();

        return redirect()->back()->with('success', 'Clinical news item deleted successfully.');
    }

    public function toggleNewsItemPublish(NewsItem $newsItem)
    {
        $newsItem->update([
            'is_published' => !$newsItem->is_published,
        ]);

        return redirect()->back()->with('success', 'News item publish status updated.');
    }

    public function pushNotifications()
    {
        $appId = LandingSetting::where('key', 'onesignal_app_id')->value('value') ?? '';
        $restApiKey = LandingSetting::where('key', 'onesignal_rest_api_key')->value('value') ?? '';

        $notifications = \App\Models\Notification::where('type', 'push')
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        return Inertia::render('Admin/PushNotifications', [
            'onesignal_app_id' => $appId,
            'onesignal_rest_api_key' => $restApiKey,
            'notifications' => $notifications,
        ]);
    }

    public function updatePushNotificationSettings(Request $request)
    {
        $request->validate([
            'onesignal_app_id' => 'required|string',
            'onesignal_rest_api_key' => 'required|string',
        ]);

        LandingSetting::updateOrCreate(
            ['key' => 'onesignal_app_id'],
            ['value' => trim($request->onesignal_app_id)]
        );

        LandingSetting::updateOrCreate(
            ['key' => 'onesignal_rest_api_key'],
            ['value' => trim($request->onesignal_rest_api_key)]
        );

        return redirect()->back()->with('success', 'OneSignal credentials saved successfully!');
    }

    public function sendPushNotification(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'url' => 'nullable|url',
        ]);

        $result = PushNotificationService::sendToAll(
            $request->title,
            $request->message,
            $request->url
        );

        if ($result['success']) {
            \App\Models\Notification::create([
                'user_id' => Auth::id(),
                'type' => 'push',
                'title' => $request->title,
                'message' => $request->message,
            ]);

            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }
}
