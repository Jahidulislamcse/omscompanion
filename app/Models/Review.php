<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
        'location',
        'quote',
        'rating',
        'tag',
        'is_published',
        'order_index',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_published' => 'boolean',
        'order_index' => 'integer',
    ];
}
