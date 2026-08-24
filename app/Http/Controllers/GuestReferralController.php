<?php

namespace App\Http\Controllers;

use App\Models\PatientReferral;
use App\Models\PatientStatusTimeline;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class GuestReferralController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'shop_keeper_name' => 'required|string|max:255',
            'shop_keeper_phone' => 'required|string|max:20',
            'shop_keeper_address' => 'required|string',
            'patient_name' => 'required|string|max:255',
            'patient_phone' => 'required|string|max:20',
            'patient_address' => 'required|string',
            'medical_condition' => 'required|string',
        ]);

        $referral = PatientReferral::create([
            'member_id' => null,
            'referrer_type' => 'medicine_shop',
            'referrer_name' => $request->shop_keeper_name,
            'referrer_phone' => $request->shop_keeper_phone,
            'referrer_address' => $request->shop_keeper_address,
            'patient_name' => $request->patient_name,
            'phone' => $request->patient_phone,
            'patient_address' => $request->patient_address,
            'medical_condition' => $request->medical_condition,
            'urgency_level' => 'medium',
            'status' => 'new',
            'additional_notes' => 'Submitted by Medicine Shop Keeper (' . $request->shop_keeper_name . ')',
        ]);

        PatientStatusTimeline::create([
            'referral_id' => $referral->id,
            'status' => 'new',
            'notes' => 'Referral submitted by Medicine Shop Keeper (' . $request->shop_keeper_name . ', Phone: ' . $request->shop_keeper_phone . ').',
            'changed_by' => null,
        ]);

        Log::info("[MEDICINE SHOP REFERRAL] New patient referral submitted by Medicine Shop Keeper: {$request->shop_keeper_name} for patient: {$request->patient_name}.");

        return redirect()->back()->with('success', 'Patient referral submitted successfully! Our team will process it shortly.');
    }
}
