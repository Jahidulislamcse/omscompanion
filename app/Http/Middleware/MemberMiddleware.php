<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class MemberMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'member') {
                if ($user->status === 'approved') {
                    return $next($request);
                } elseif ($user->status === 'pending') {
                    Auth::logout();
                    return redirect()->route('login')->withErrors([
                        'email' => 'Your account is pending admin approval. You will receive an email once approved.'
                    ]);
                } else {
                    Auth::logout();
                    return redirect()->route('login')->withErrors([
                        'email' => 'Your registration was rejected. Please contact support.'
                    ]);
                }
            }
        }

        abort(403, 'Unauthorized access.');
    }
}
