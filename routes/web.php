<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\VideoStreamingController;
use App\Http\Controllers\CertificateController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Landing Page
Route::get('/', function () {
    $freeVideos = [
        [
            'id' => 'free-1',
            'title' => 'Dental Referral System Overview',
            'description' => 'A comprehensive walk-through of the DentistChamber referral pipeline, showing how BDS Doctors refer cases and track live treatment milestones.',
            'duration' => 155,
            'embed_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        ],
        [
            'id' => 'free-2',
            'title' => 'Premium Video Library Preview',
            'description' => 'Take a peak at our high-definition clinical tutorials and educational video streams available exclusively to approved BDS members.',
            'duration' => 205,
            'embed_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        ]
    ];
    return Inertia::render('Welcome', [
        'freeVideos' => $freeVideos
    ]);
})->name('home');

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
});

// Member Routes
Route::middleware(['auth', 'member'])->prefix('member')->group(function () {
    Route::get('/dashboard', [MemberController::class, 'dashboard'])->name('member.dashboard');
    Route::get('/profile', [MemberController::class, 'profile'])->name('member.profile');
    Route::post('/profile', [MemberController::class, 'updateProfile'])->name('member.profile.update');
    Route::get('/referrals', [MemberController::class, 'referrals'])->name('member.referrals');
    Route::post('/referrals', [MemberController::class, 'storeReferral'])->name('member.referrals.store');
    Route::get('/referrals/{referral}/tracker', [MemberController::class, 'tracker'])->name('member.referrals.tracker');
    Route::get('/videos', [MemberController::class, 'videos'])->name('member.videos');
    Route::get('/videos/{video}/stream', [VideoStreamingController::class, 'stream'])->name('member.videos.stream');
    Route::get('/certificate', [CertificateController::class, 'download'])->name('member.certificate.download');
    Route::get('/notifications', [MemberController::class, 'notifications'])->name('member.notifications');
});
