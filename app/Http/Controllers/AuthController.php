<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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

        return redirect()->route('login')->with('success', 'Please wait for account approval from the authority');
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
}
