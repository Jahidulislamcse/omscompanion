<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoAccessRequest extends Model
{
    protected $fillable = [
        'user_id',
        'video_id',
        'status',
        'admin_notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function video()
    {
        return $this->belongsTo(Video::class, 'video_id');
    }
}
