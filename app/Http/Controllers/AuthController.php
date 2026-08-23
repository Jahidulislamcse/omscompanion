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
            'email' => 'required|string|email|max:255|unique:users,email',
            'bds_registration_number' => 'required|string|max:50',
            'clinic_name' => 'required|string|max:255',
            'address' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email ?: null,
            'phone' => $request->phone,
            'bds_registration_number' => $request->bds_registration_number,
            'clinic_name' => $request->clinic_name,
            'address' => $request->address,
            'password' => Hash::make($request->password),
            'raw_password' => $request->password,
            'role' => 'member',
            'status' => 'pending',
        ]);

        return redirect()->route('login')->with('success', 'Registration successful! Your account is pending admin approval.');
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
