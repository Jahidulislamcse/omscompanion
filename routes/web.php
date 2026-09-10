<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\GuestReferralController;
use App\Http\Controllers\VideoStreamingController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\ContactController;
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

    // Ensure default doctor reviews exist
    if (\App\Models\Review::count() === 0) {
        \App\Models\Review::create([
            'quote' => 'DentistChamber transformed how our chamber handles surgical impaction referrals. Being able to see patient status updates live gives complete peace of mind.',
            'name' => 'Dr. Farhana Yasmin, BDS',
            'role' => 'General Dental Practitioner',
            'location' => 'Dhaka',
            'rating' => 5,
            'tag' => 'Verified Member',
            'order_index' => 1,
            'is_published' => true,
        ]);
        \App\Models\Review::create([
            'quote' => 'The clinical video library is top-notch! The surgical walkthroughs are extremely detailed and high definition. A fantastic hub for BDS doctors.',
            'name' => 'Dr. Tanvir Hossain, BDS',
            'role' => 'Dental Surgeon',
            'location' => 'Chittagong',
            'rating' => 5,
            'tag' => 'Clinical Practitioner',
            'order_index' => 2,
            'is_published' => true,
        ]);
        \App\Models\Review::create([
            'quote' => 'Generating verified digital certificates and tracking case logs seamlessly makes DentistChamber an indispensable tool for modern dental practices.',
            'name' => 'Dr. Noshin Tarannum, BDS',
            'role' => 'Orthodontics Fellow',
            'location' => 'Sylhet',
            'rating' => 5,
            'tag' => 'Network Partner',
            'order_index' => 3,
            'is_published' => true,
        ]);
    }

    // Ensure default news & training items exist
    if (\App\Models\NewsItem::count() === 0) {
        \App\Models\NewsItem::create([
            'badge_text' => 'Workshop',
            'sub_badge_text' => 'Upcoming Training',
            'title' => 'Advanced Maxillofacial Impaction & Surgical Masterclass',
            'description' => 'Hands-on surgical training program focusing on complex 3rd molar impactions and piezosurgery techniques for general practitioners.',
            'button_text' => 'View Related Masterclass Videos →',
            'button_url' => '/videos',
            'button_type' => 'outline',
            'theme_color' => 'indigo',
            'order_index' => 1,
            'is_published' => true,
        ]);
        \App\Models\NewsItem::create([
            'badge_text' => 'Clinical Guide',
            'sub_badge_text' => 'Latest Guidelines',
            'title' => 'Co-Morbid Patient Management Protocols in Minor Oral Surgery',
            'description' => 'Updated clinical guidelines for treating medically compromised and diabetic patients safely in chamber setups.',
            'button_text' => 'Explore Clinical Guides →',
            'button_url' => '/videos',
            'button_type' => 'outline',
            'theme_color' => 'emerald',
            'order_index' => 2,
            'is_published' => true,
        ]);
        \App\Models\NewsItem::create([
            'badge_text' => 'Consultation',
            'sub_badge_text' => 'Live Support',
            'title' => 'Online Consultation & Multidisciplinary Case Discussions',
            'description' => 'BDS doctors can now directly request real-time expert opinions and surgical team collaboration via direct WhatsApp desk.',
            'button_text' => 'Join WhatsApp Consultation 💬',
            'button_url' => 'whatsapp',
            'button_type' => 'whatsapp',
            'theme_color' => 'cyan',
            'order_index' => 3,
            'is_published' => true,
        ]);
    }

    $reviews = \App\Models\Review::where('is_published', true)
        ->orderBy('order_index', 'asc')
        ->orderBy('id', 'desc')
        ->get();

    $newsItems = \App\Models\NewsItem::where('is_published', true)
        ->orderBy('order_index', 'asc')
        ->orderBy('id', 'desc')
        ->get();

    return Inertia::render('Welcome', [
        'settings' => $settings,
        'freeVideos' => $dbFreeVideos,
        'categories' => $categories,
        'reviews' => $reviews,
        'newsItems' => $newsItems,
    ]);
})->name('home');

// Public Videos Page
Route::get('/videos', [\App\Http\Controllers\PublicVideoController::class, 'index'])->name('videos.public');
Route::get('/video', [\App\Http\Controllers\PublicVideoController::class, 'index'])->name('video.public');

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

// Service Image Stream Route (Bypasses cPanel symlink issues)
Route::get('/service-image/{service}', function (\App\Models\Service $service) {
    if (!$service->image_path) {
        abort(404);
    }
    $filename = basename($service->image_path);
    $filePath = storage_path('app/public/services/' . $filename);
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
})->name('service.image.stream');

// User Avatar Stream Route (Bypasses cPanel symlink issues)
Route::get('/user-avatar/{user}', function (\App\Models\User $user) {
    if (!$user->avatar) {
        abort(404);
    }
    $filename = basename($user->avatar);
    $filePath = storage_path('app/public/avatars/' . $filename);
    if (!file_exists($filePath)) {
        $filePath = storage_path('app/public/' . $user->avatar);
        if (!file_exists($filePath)) {
            abort(404);
        }
    }
    $mimeType = function_exists('mime_content_type') ? @mime_content_type($filePath) : 'image/jpeg';
    return response()->file($filePath, [
        'Content-Type' => $mimeType,
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma' => 'no-cache',
        'Expires' => '0',
    ]);
})->name('user.avatar.stream');

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
    Route::post('/members/{user}/commission-setting', [AdminController::class, 'updateMemberCommission'])->name('admin.members.commission_setting');
    Route::get('/referrals', [AdminController::class, 'referrals'])->name('admin.referrals');
    Route::post('/referrals', [AdminController::class, 'storeReferral'])->name('admin.referrals.store');
    Route::post('/referrals/{referral}/status', [AdminController::class, 'updateReferralStatus'])->name('admin.referrals.status');
    Route::post('/referrals/{referral}/commission', [AdminController::class, 'updateCommission'])->name('admin.referrals.commission');
    Route::post('/referrals/{referral}/note', [AdminController::class, 'updateReferralNote'])->name('admin.referrals.note');
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
    Route::post('/services', [AdminController::class, 'storeService'])->name('admin.services.store');
    Route::put('/services/{service}', [AdminController::class, 'updateService'])->name('admin.services.update');
    Route::post('/services/{service}', [AdminController::class, 'updateService'])->name('admin.services.update_post');
    Route::delete('/services/{service}', [AdminController::class, 'destroyService'])->name('admin.services.destroy');
    Route::post('/reviews', [AdminController::class, 'storeReview'])->name('admin.reviews.store');
    Route::put('/reviews/{review}', [AdminController::class, 'updateReview'])->name('admin.reviews.update');
    Route::post('/reviews/{review}', [AdminController::class, 'updateReview'])->name('admin.reviews.update_post');
    Route::delete('/reviews/{review}', [AdminController::class, 'destroyReview'])->name('admin.reviews.destroy');
    Route::post('/reviews/{review}/toggle', [AdminController::class, 'toggleReviewPublish'])->name('admin.reviews.toggle');
    Route::post('/news-items', [AdminController::class, 'storeNewsItem'])->name('admin.news.store');
    Route::put('/news-items/{newsItem}', [AdminController::class, 'updateNewsItem'])->name('admin.news.update');
    Route::post('/news-items/{newsItem}', [AdminController::class, 'updateNewsItem'])->name('admin.news.update_post');
    Route::delete('/news-items/{newsItem}', [AdminController::class, 'destroyNewsItem'])->name('admin.news.destroy');
    Route::post('/news-items/{newsItem}/toggle', [AdminController::class, 'toggleNewsItemPublish'])->name('admin.news.toggle');
    Route::get('/messages', [AdminController::class, 'messages'])->name('admin.messages');
    Route::post('/messages/{message}/read', [AdminController::class, 'markMessageRead'])->name('admin.messages.read');
    Route::delete('/messages/{message}', [AdminController::class, 'destroyMessage'])->name('admin.messages.destroy');
    Route::get('/profile', [AdminController::class, 'profile'])->name('admin.profile');
    Route::post('/profile', [AdminController::class, 'updateProfile'])->name('admin.profile.update');
    Route::get('/push-notifications', [AdminController::class, 'pushNotifications'])->name('admin.push_notifications');
    Route::post('/push-notifications/settings', [AdminController::class, 'updatePushNotificationSettings'])->name('admin.push_notifications.settings');
    Route::post('/push-notifications/send', [AdminController::class, 'sendPushNotification'])->name('admin.push_notifications.send');
});

// Public Pages Routes
Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/services', [ServicesController::class, 'index'])->name('services');
Route::get('/contact', [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

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
