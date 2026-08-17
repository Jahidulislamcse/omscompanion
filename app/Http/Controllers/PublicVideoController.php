<?php

namespace App\Http\Controllers;

use App\Models\Video;
use App\Models\VideoCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicVideoController extends Controller
{
    public function index()
    {
        $categories = VideoCategory::with(['videos' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->get();

        $allVideos = Video::with('category')->orderBy('created_at', 'desc')->get()->map(function ($video) {
            return [
                'id' => $video->id,
                'title' => $video->title,
                'description' => $video->description,
                'duration' => $video->duration,
                'storage_type' => $video->storage_type,
                'video_path' => $video->video_path,
                'is_free' => (bool)$video->is_free,
                'category_id' => $video->category_id,
                'category_name' => $video->category ? $video->category->name : 'General',
            ];
        });

        // Fallback sample videos if database is empty
        if ($allVideos->isEmpty()) {
            $allVideos = collect([
                [
                    'id' => 'sample-1',
                    'title' => 'Dental Referral System & Live Case Tracking Walkthrough',
                    'description' => 'A comprehensive guide showing how BDS Doctors initiate patient referrals and monitor live treatment milestones in real-time.',
                    'duration' => 155,
                    'storage_type' => 'external',
                    'video_path' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    'is_free' => true,
                    'category_id' => 1,
                    'category_name' => 'Platform Guides',
                ],
                [
                    'id' => 'sample-2',
                    'title' => 'Surgical Lower Molar Impaction Masterclass',
                    'description' => 'Detailed clinical tutorial covering flap design, bone guttering, and sectioning techniques for complex mandibular 3rd molar impactions.',
                    'duration' => 640,
                    'storage_type' => 'external',
                    'video_path' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    'is_free' => false,
                    'category_id' => 2,
                    'category_name' => 'Clinical Tutorials',
                ],
                [
                    'id' => 'sample-3',
                    'title' => 'Complex Molar Endodontics & Canal Location Protocol',
                    'description' => 'Clinical video series explaining MB2 location strategies, rotary instrumentation, and warm vertical compaction techniques.',
                    'duration' => 480,
                    'storage_type' => 'external',
                    'video_path' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    'is_free' => false,
                    'category_id' => 2,
                    'category_name' => 'Clinical Tutorials',
                ]
            ]);
        }

        return Inertia::render('Videos/Index', [
            'categories' => $categories,
            'videos' => $allVideos,
        ]);
    }
}
