<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'badge_text',
        'sub_badge_text',
        'title',
        'description',
        'button_text',
        'button_url',
        'button_type',
        'theme_color',
        'is_published',
        'order_index',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'order_index' => 'integer',
    ];
}
