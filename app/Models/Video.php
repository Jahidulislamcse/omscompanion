<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $fillable = [
        'category_id',
        'title',
        'description',
        'video_path',
        'storage_type',
        'duration',
    ];

    public function category()
    {
        return $this->belongsTo(VideoCategory::class, 'category_id');
    }
}
