<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientReferral extends Model
{
    protected $fillable = [
        'member_id',
        'referrer_type',
        'referrer_name',
        'referrer_phone',
        'referrer_address',
        'patient_name',
        'phone',
        'patient_address',
        'medical_condition',
        'urgency_level',
        'status',
        'additional_notes',
        'commission_amount',
        'commission_status',
    ];

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function timeline()
    {
        return $this->hasMany(PatientStatusTimeline::class, 'referral_id')->orderBy('created_at', 'asc');
    }
}
