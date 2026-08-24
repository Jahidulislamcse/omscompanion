<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\GuestReferralController;
use App\Http\Controllers\VideoStreamingController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\AboutController;
use App\Models\LandingSetting;
use App\Models\Video;
use App\Models\VideoCategory;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Landing Page
Route::get('/', function () {
    $settings = LandingSetting::all()->pluck('value', 'key')->toArray();

    // Ensure the 2 default categories exist
    $surgicalCat = VideoCategory::firstOrCreate(
        ['name' => 'Surgical approaches'],
        ['description' => 'Surgical techniques and surgical approaches.']
    );
    $clinicalCat = VideoCategory::firstOrCreate(
        ['name' => 'Clinical lecture/ tips tricks'],
        ['description' => 'Clinical lectures, guides, and practical tips & tricks.']
    );

    // Ensure videos exist for Surgical approaches category
    if (Video::where('category_id', $surgicalCat->id)->count() === 0) {
        Video::create([
            'category_id' => $surgicalCat->id,
            'title' => "EUROPE'S BIGGEST AIRPLANE GRAVEYARD",
            'description' => 'Detailed clinical video covering surgical approaches and procedure techniques.',
            'duration' => 640,
            'storage_type' => 'youtube',
            'video_path' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'is_free' => true,
        ]);
    }

    // Ensure videos exist for Clinical lecture/ tips tricks category
    if (Video::where('category_id', $clinicalCat->id)->count() === 0) {
        Video::create([
            'category_id' => $clinicalCat->id,
            'title' => 'IMPERIAL AIRWAYS LONDON - Clinical Tips',
            'description' => 'Comprehensive clinical lecture covering practical tips & tricks for BDS practitioners.',
            'duration' => 480,
            'storage_type' => 'youtube',
            'video_path' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'is_free' => true,
        ]);
    }

    $dbFreeVideos = Video::with('category')->orderBy('created_at', 'desc')->get()->map(function ($video) {
        return [
            'id' => $video->id,
            'title' => $video->title,
            'description' => $video->description,
            'duration' => $video->duration,
            'storage_type' => $video->storage_type,
            'video_path' => $video->video_path,
            'category_id' => $video->category_id,
            'category_name' => $video->category ? $video->category->name : 'General',
        ];
    })->toArray();

    $categories = VideoCategory::all()->map(function ($cat) {
        return [
            'id' => $cat->id,
            'name' => $cat->name,
            'description' => $cat->description,
        ];
    })->toArray();

    return Inertia::render('Welcome', [
        'settings' => $settings,
        'freeVideos' => $dbFreeVideos,
        'categories' => $categories,
    ]);
})->name('home');

// Public Videos Page
Route::get('/videos', [\App\Http\Controllers\PublicVideoController::class, 'index'])->name('videos.public');

// Public Video Stream (No Auth)
Route::get('/videos/stream/public/{video}', [VideoStreamingController::class, 'publicStream'])->name('videos.public_stream');

// Public Storage Files Handler (Serves logos & public uploads)
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    if (!file_exists($filePath)) {
        abort(404);
    }
    $mimeType = function_exists('mime_content_type') ? @mime_content_type($filePath) : null;
    $mimeType = $mimeType ?: 'image/png';
    return response()->file($filePath, ['Content-Type' => $mimeType]);
})->where('path', '.*')->name('storage.public_file');

// Site Logo Stream Route (Bypasses cPanel symlink issues)
Route::get('/site-logo-image', function () {
    $logoPath = \App\Models\LandingSetting::where('key', 'site_logo')->value('value');
    if (!$logoPath) {
        abort(404);
    }
    $filename = basename($logoPath);
    $filePath = storage_path('app/public/logos/' . $filename);
    if (!file_exists($filePath)) {
        abort(404);
    }
    $mimeType = function_exists('mime_content_type') ? @mime_content_type($filePath) : 'image/png';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
})->name('site.logo.stream');

// Site Dynamic Banner Stream Route (Bypasses cPanel symlink issues)
Route::get('/site-banner-image', function () {
    $bannerPath = \App\Models\LandingSetting::where('key', 'hero_banner')->value('value');
    if (!$bannerPath) {
        abort(404);
    }
    $filename = basename($bannerPath);
    $filePath = storage_path('app/public/banners/' . $filename);
    if (!file_exists($filePath)) {
        abort(404);
    }
    $mimeType = function_exists('mime_content_type') ? @mime_content_type($filePath) : 'image/png';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
})->name('site.banner.stream');

// Login Page Side Image Stream Route (Bypasses cPanel symlink issues)
Route::get('/site-login-image', function () {
    $imgPath = \App\Models\LandingSetting::where('key', 'login_side_image')->value('value');
    if (!$imgPath) {
        abort(404);
    }
    $filename = basename($imgPath);
    $filePath = storage_path('app/public/login_images/' . $filename);
    if (!file_exists($filePath)) {
        abort(404);
    }
    $mimeType = function_exists('mime_content_type') ? @mime_content_type($filePath) : 'image/png';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
})->name('site.login_image.stream');

// Guest Medicine Shop Referral Submission Route
Route::post('/referrals/guest', [GuestReferralController::class, 'store'])->name('guest.referral.store');

// Guest Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

// Admin Routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/members', [AdminController::class, 'members'])->name('admin.members');
    Route::post('/members/{user}/approve', [AdminController::class, 'approveMember'])->name('admin.members.approve');
    Route::post('/members/{user}/reject', [AdminController::class, 'rejectMember'])->name('admin.members.reject');
    Route::get('/referrals', [AdminController::class, 'referrals'])->name('admin.referrals');
    Route::post('/referrals/{referral}/status', [AdminController::class, 'updateReferralStatus'])->name('admin.referrals.status');
    Route::post('/referrals/{referral}/commission', [AdminController::class, 'updateCommission'])->name('admin.referrals.commission');
    Route::get('/videos', [AdminController::class, 'videos'])->name('admin.videos');
    Route::post('/videos/categories', [AdminController::class, 'storeCategory'])->name('admin.videos.category.store');
    Route::post('/videos', [AdminController::class, 'storeVideo'])->name('admin.videos.store');
    Route::put('/videos/{video}', [AdminController::class, 'updateVideo'])->name('admin.videos.update');
    Route::delete('/videos/{video}', [AdminController::class, 'destroyVideo'])->name('admin.videos.destroy');
    Route::post('/videos/access-requests/{user}', [AdminController::class, 'updatePremiumAccess'])->name('admin.videos.access_requests.update');
    Route::get('/page-content', [AdminController::class, 'pageContent'])->name('admin.page_content');
    Route::post('/page-content', [AdminController::class, 'updatePageContent'])->name('admin.page_content.update');
    Route::post('/team-members', [AdminController::class, 'storeTeamMember'])->name('admin.team.store');
    Route::post('/team-members/{teamMember}', [AdminController::class, 'updateTeamMember'])->name('admin.team.update');
    Route::delete('/team-members/{teamMember}', [AdminController::class, 'destroyTeamMember'])->name('admin.team.destroy');
    Route::get('/profile', [AdminController::class, 'profile'])->name('admin.profile');
    Route::post('/profile', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
});

// Public About Us Route
Route::get('/about', [AboutController::class, 'index'])->name('about');

// Member Routes
Route::middleware(['auth', 'member'])->prefix('member')->group(function () {
    Route::get('/dashboard', [MemberController::class, 'dashboard'])->name('member.dashboard');
    Route::get('/profile', [MemberController::class, 'profile'])->name('member.profile');
    Route::post('/profile', [MemberController::class, 'updateProfile'])->name('member.profile.update');
    Route::get('/referrals', [MemberController::class, 'referrals'])->name('member.referrals');
    Route::post('/referrals', [MemberController::class, 'storeReferral'])->name('member.referrals.store');
    Route::get('/referrals/{referral}/tracker', [MemberController::class, 'tracker'])->name('member.referrals.tracker');
    Route::get('/videos', [MemberController::class, 'videos'])->name('member.videos');
    Route::post('/videos/request-premium-access', [MemberController::class, 'requestPremiumAccess'])->name('member.videos.request_premium_access');
    Route::get('/videos/{video}/stream', [VideoStreamingController::class, 'stream'])->name('member.videos.stream');
    Route::get('/certificate', [CertificateController::class, 'download'])->name('member.certificate.download');
    Route::get('/notifications', [MemberController::class, 'notifications'])->name('member.notifications');
});
