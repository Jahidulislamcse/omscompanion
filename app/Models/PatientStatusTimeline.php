<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientStatusTimeline extends Model
{
    protected $table = 'patient_status_timelines';

    protected $fillable = [
        'referral_id',
        'status',
        'notes',
        'changed_by',
    ];

    public function referral()
    {
        return $this->belongsTo(PatientReferral::class, 'referral_id');
    }

    public function changer()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
