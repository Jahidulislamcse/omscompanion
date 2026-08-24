<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Models\LandingSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        $settings = LandingSetting::all()->pluck('value', 'key')->toArray();

        if (empty($settings['contact_subtitle'])) {
            $settings['contact_subtitle'] = "Feel free to reach out to us for any inquiries, patient referral guidance, or specialist collaboration. Our team is here to assist you.";
        }

        return Inertia::render('Contact/Index', [
            'settings' => $settings,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        ContactMessage::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'subject' => $request->subject,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return redirect()->back()->with('success', 'Thank you! Your message has been sent successfully. We will get back to you shortly.');
    }
}
