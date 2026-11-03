<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required',
        ]);

        $loginInput = trim($request->input('login'));
        $fieldType = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $fieldType => $loginInput,
            'password' => $request->password,
        ];

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            if ($user->isAdmin()) {
                return redirect()->intended('/admin/dashboard');
            }

            if ($user->role === 'member') {
                if ($user->status === 'approved') {
                    return redirect()->intended('/member/dashboard');
                } elseif ($user->status === 'pending') {
                    Auth::logout();
                    return back()->withErrors([
                        'login' => 'Your account is pending admin approval.',
                    ]);
                } else {
                    Auth::logout();
                    return back()->withErrors([
                        'login' => 'Your registration was rejected. Please contact support.',
                    ]);
                }
            }
        }

        return back()->withErrors([
            'login' => 'The provided credentials do not match our records.',
        ])->onlyInput('login');
    }

    public function showRegister()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }
        return Inertia::render('Auth/Register');
    }
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:users,phone',
            'whatsapp_number' => 'nullable|string|max:20',
            'doctor_type' => 'nullable|string|in:BDS,MBBS',
            'email' => 'required|string|email|max:255|unique:users,email',
            'bds_registration_number' => 'required|string|max:50',
            'clinic_name' => 'required|string|max:255',
            'address' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $avatarPath = null;
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
                        $avatarPath = 'avatars/' . $filename;
                    }
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('Avatar storage failed during registration: ' . $e->getMessage());
            }
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email ?: null,
            'phone' => $request->phone,
            'whatsapp_number' => $request->whatsapp_number ?: null,
            'doctor_type' => $request->doctor_type ?: 'BDS',
            'bds_registration_number' => $request->bds_registration_number,
            'clinic_name' => $request->clinic_name,
            'address' => $request->address,
            'password' => Hash::make($request->password),
            'raw_password' => $request->password,
            'role' => 'member',
            'status' => 'pending',
        ];

        if ($avatarPath && \Illuminate\Support\Facades\Schema::hasColumn('users', 'avatar')) {
            $userData['avatar'] = $avatarPath;
        }

        $user = User::create($userData);

        // 1. Send formal Registration Under Review notification via Email and WhatsApp to user
        try {
            \App\Services\NotificationService::sendRegistrationPendingNotification($user);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Registration pending notification to user failed: ' . $e->getMessage());
        }

        // 2. Send notification to Admin via App Push, In-App Database, and Email when new doctor registers
        try {
            $doctorType = $user->doctor_type ?: 'Doctor';
            $regNo = $user->bds_registration_number ? " (Reg: {$user->bds_registration_number})" : "";
            $clinic = $user->clinic_name ? " [{$user->clinic_name}]" : "";

            $adminTitle = "🔔 New Registration: Dr. {$user->name}";
            $adminMessage = "Dr. {$user->name}{$regNo}{$clinic} has registered as {$doctorType} and is pending your approval.";
            $actionUrl = route('admin.members');

            \App\Services\NotificationService::notifyAdmins($adminTitle, $adminMessage, $actionUrl);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Admin registration push notification failed: ' . $e->getMessage());
        }

        return redirect()->route('login')->with('success', "Please wait for account approval from the authority. You'll get approval update via email.");
    }
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }

    private function redirectBasedOnRole($user)
    {
        if ($user->isAdmin()) {
            return redirect('/admin/dashboard');
        }
        if ($user->role === 'member' && $user->status === 'approved') {
            return redirect('/member/dashboard');
        }
        Auth::logout();
        return redirect()->route('login');
    }

    public function showForgotPassword()
    {
        if (Auth::check()) {
            return $this->redirectBasedOnRole(Auth::user());
        }
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $email = trim(strtolower($request->email));
        $user = User::where('email', $email)->first();

        if (!$user) {
            return back()->withErrors([
                'email' => 'We could not find an account associated with this email address.',
            ]);
        }

        // Generate secure 64-character token
        $token = Str::random(64);

        // Store token in password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $token,
                'created_at' => Carbon::now(),
            ]
        );

        // Build password reset URL
        $resetUrl = route('password.reset', ['token' => $token, 'email' => $email]);

        // Send Email
        try {
            $siteName = 'OMS COMPANION';
            $title = "Password Reset Request - {$siteName}";
            $recipientName = $user->name ? "Dr. {$user->name}" : 'Valued Doctor';

            $htmlContent = '
            <div style="font-family: \'Segoe UI\', Arial, sans-serif; background-color: #f1f5f9; padding: 30px 15px; color: #334155;">
                <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 28px 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">OMS COMPANION</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Maxillofacial & Clinical Knowledge Network</p>
                    </div>
                    <div style="padding: 30px 24px;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 19px; font-weight: 700;">Password Reset Request</h2>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 12px 0;">
                            Dear ' . e($recipientName) . ',
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 12px 0;">
                            We received a request to reset your password for your <strong>OMS COMPANION</strong> account. Click the button below to set a new password:
                        </p>
                        <div style="text-align: center; margin: 28px 0;">
                            <a href="' . e($resetUrl) . '" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 15px rgba(13, 148, 136, 0.35);">
                                Reset Password (পাসওয়ার্ড পরিবর্তন করুন) &rarr;
                            </a>
                        </div>
                        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 20px 0 8px;">
                            ⏱️ <em>This password reset link will expire in <strong>60 minutes</strong>.</em>
                        </p>
                        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
                            If you did not request a password reset, no further action is required; your current password remains completely secure.
                        </p>
                        <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; word-break: break-all;">
                            If the button does not work, copy and paste this URL into your browser:<br/>
                            <a href="' . e($resetUrl) . '" style="color: #0891b2; text-decoration: underline;">' . e($resetUrl) . '</a>
                        </div>
                    </div>
                    <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                        &copy; ' . date('Y') . ' OMS COMPANION. All rights reserved.
                    </div>
                </div>
            </div>';

            Mail::html($htmlContent, function ($mail) use ($user, $title) {
                $mail->to($user->email, $user->name)
                    ->subject($title);
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email failed: ' . $e->getMessage());
            return back()->withErrors([
                'email' => 'Unable to send password reset email at this moment. Please try again later or contact support.',
            ]);
        }

        return back()->with('status', 'We have sent a password reset link to your email address! Please check your inbox (and spam folder).');
    }

    public function showResetPassword(Request $request, $token)
    {
        $email = $request->query('email');

        // Verify token in DB
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('token', $token)
            ->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return redirect()->route('password.request')->withErrors([
                'email' => 'This password reset link is invalid or has expired. Please request a new one.',
            ]);
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $email,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $email = trim(strtolower($request->email));

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('token', $request->token)
            ->first();

        if (!$record || Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            return back()->withErrors([
                'email' => 'This password reset link is invalid or has expired. Please request a new one.',
            ]);
        }

        $user = User::where('email', $email)->first();
        if (!$user) {
            return back()->withErrors([
                'email' => 'User account not found.',
            ]);
        }

        // Update password & raw_password
        $user->password = Hash::make($request->password);
        $user->raw_password = $request->password;
        $user->setRememberToken(Str::random(60));
        $user->save();

        // Delete used reset token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Send confirmation email
        try {
            $siteName = 'OMS COMPANION';
            $title = "Security Alert: Password Changed - {$siteName}";
            $recipientName = $user->name ? "Dr. {$user->name}" : 'Valued Doctor';

            $confirmHtml = '
            <div style="font-family: \'Segoe UI\', Arial, sans-serif; background-color: #f1f5f9; padding: 30px 15px; color: #334155;">
                <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
                    <div style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800;">OMS COMPANION</h1>
                    </div>
                    <div style="padding: 28px 24px;">
                        <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 700;">Password Updated Successfully</h2>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                            Dear ' . e($recipientName) . ',
                        </p>
                        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                            Your account password for <strong>OMS COMPANION</strong> has been successfully changed.
                        </p>
                        <p style="font-size: 13px; line-height: 1.6; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 8px;">
                            ⚠️ If you did not make this change, please contact the administration immediately to secure your account.
                        </p>
                        <div style="text-align: center; margin: 24px 0 10px;">
                            <a href="' . route('login') . '" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 11px 26px; border-radius: 8px; font-weight: 600; font-size: 14px;">
                                Log In Now &rarr;
                            </a>
                        </div>
                    </div>
                </div>
            </div>';

            Mail::html($confirmHtml, function ($mail) use ($user, $title) {
                $mail->to($user->email, $user->name)
                    ->subject($title);
            });
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password change confirmation email failed: ' . $e->getMessage());
        }

        return redirect()->route('login')->with('success', 'Your password has been reset successfully! Please login with your new password.');
    }
}
