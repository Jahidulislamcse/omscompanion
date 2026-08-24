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
            if ($member) {
                $subject = "Commission Paid: {$referral->patient_name}";
                $message = "Commission payment of \${$amount} for patient {$referral->patient_name} has been processed.";
                
                NotificationService::send($member, $subject, $message, 'both');
            }
        }

        return redirect()->back()->with('success', 'Commission settings updated successfully.');
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

        return Inertia::render('Admin/PageContent', [
            'settings' => $settings,
            'teamMembers' => $teamMembers,
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
            'about_title',
            'about_description',
        ]);

        foreach ($settingsData as $key => $value) {
            LandingSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        return redirect()->back()->with('success', 'Landing page settings updated successfully.');
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
}
