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

        $referralData = [
            'id' => $referral->id,
            'patient_name' => $referral->patient_name,
            'patient_phone' => $referral->phone,
            'shop_keeper_name' => $referral->referrer_name,
            'shop_keeper_phone' => $referral->referrer_phone,
            'created_at' => $referral->created_at->format('M d, Y'),
            'status' => $referral->status,
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Patient referral submitted successfully!',
                'referral' => $referralData,
            ]);
        }

        return redirect()->back()->with([
            'success' => 'Patient referral submitted successfully! Our team will process it shortly.',
            'new_guest_referral' => $referralData
        ]);
    }

    public function getStatus(Request $request)
    {
        $request->validate([
            'ids' => 'nullable|array',
            'phone' => 'nullable|string',
        ]);

        $query = PatientReferral::where('referrer_type', 'medicine_shop');

        if ($request->filled('ids') && count($request->ids) > 0) {
            $query->whereIn('id', $request->ids);
        } elseif ($request->filled('phone')) {
            $query->where('referrer_phone', $request->phone);
        } else {
            return response()->json(['referrals' => []]);
        }

        $referrals = $query->with(['timelines' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->orderBy('created_at', 'desc')->get();

        $data = $referrals->map(function($r) {
            return [
                'id' => $r->id,
                'patient_name' => $r->patient_name,
                'patient_phone' => $r->phone,
                'referrer_name' => $r->referrer_name,
                'referrer_phone' => $r->referrer_phone,
                'status' => $r->status,
                'status_label' => ucfirst(str_replace('_', ' ', $r->status)),
                'created_at' => $r->created_at->format('M d, Y'),
                'updated_at' => $r->updated_at->format('M d, Y h:i A'),
                'timelines' => $r->timelines->map(function($t) {
                    return [
                        'status' => $t->status,
                        'status_label' => ucfirst(str_replace('_', ' ', $t->status)),
                        'notes' => $t->notes,
                        'date' => $t->created_at->format('M d, Y h:i A'),
                    ];
                })
            ];
        });

        return response()->json(['referrals' => $data]);
    }
}
