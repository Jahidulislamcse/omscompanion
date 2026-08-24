<?php

namespace App\Http\Controllers;

use App\Models\LandingSetting;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AboutController extends Controller
{
    public function index()
    {
        // Seed default team members if empty
        if (TeamMember::count() === 0) {
            $this->seedDefaultTeam();
        }

        // Default About settings
        $settings = LandingSetting::all()->pluck('value', 'key')->toArray();

        if (empty($settings['about_title'])) {
            $settings['about_title'] = 'About Us';
        }
        if (empty($settings['about_description'])) {
            $settings['about_description'] = "OMS Companion is a professional platform connecting Oral & Maxillofacial Surgeons, Oral Medicine specialists, and Oncologists to provide coordinated, expert care for patients with complex oral and maxillofacial conditions.\n\nWe promote specialist collaboration, timely referral, accurate diagnosis, and comprehensive treatment planning—helping dental surgeons manage more patients with greater confidence and better outcomes.\n\nOMS Companion — Connecting Expertise, Enhancing Practice.";
        }

        $teamMembers = TeamMember::orderBy('level', 'asc')->orderBy('order_index', 'asc')->get();

        return Inertia::render('About/Index', [
            'settings' => $settings,
            'teamMembers' => $teamMembers,
        ]);
    }

    private function seedDefaultTeam()
    {
        $defaultTeam = [
            // Level 1: Founder
            [
                'name' => 'DR SAJID HASAN',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'ORAL & MAXILLOFACIAL SURGERY',
                'designation' => 'FOUNDER',
                'level' => 1,
                'order_index' => 1,
            ],
            // Level 2: Row 2 (5 Members)
            [
                'name' => 'NUBAD ADNAN',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'ORAL & MAXILLOFACIAL SURGERY',
                'designation' => null,
                'level' => 2,
                'order_index' => 1,
            ],
            [
                'name' => 'DR SAHRAB HOSSAIN',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'ORAL & MAXILLOFACIAL SURGERY',
                'designation' => null,
                'level' => 2,
                'order_index' => 2,
            ],
            [
                'name' => 'DR AL JABER',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'ORAL & MAXILLOFACIAL SURGERY',
                'designation' => null,
                'level' => 2,
                'order_index' => 3,
            ],
            [
                'name' => 'DR ANISUZZAMAN',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'ORAL & MAXILLOFACIAL SURGERY',
                'designation' => null,
                'level' => 2,
                'order_index' => 4,
            ],
            [
                'name' => 'DR SHITOL',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'ORAL & MAXILLOFACIAL SURGERY',
                'designation' => null,
                'level' => 2,
                'order_index' => 5,
            ],
            // Level 3: Row 3 (4 Members)
            [
                'name' => 'DR RASHEDUL ISLAM',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'PLASTIC SURGERY',
                'designation' => null,
                'level' => 3,
                'order_index' => 1,
            ],
            [
                'name' => 'DR AFZALUR RAHAMAN',
                'title' => 'ASSOCIATE PROFESSOR',
                'specialization' => 'HEAD & NECK ONCOLOGY',
                'designation' => null,
                'level' => 3,
                'order_index' => 2,
            ],
            [
                'name' => 'DR SHARIF AHMED',
                'title' => 'CONSULTANT',
                'specialization' => 'SURGICAL ONCOLOGY',
                'designation' => null,
                'level' => 3,
                'order_index' => 3,
            ],
            [
                'name' => 'DR TOWHID TOFAIL',
                'title' => 'BDS, FCPS',
                'specialization' => 'PROSTHODONTICS',
                'designation' => null,
                'level' => 3,
                'order_index' => 4,
            ],
            // Level 4: Bottom Specialist
            [
                'name' => 'DR RIFAT RAHMAN',
                'title' => 'BDS, MS, DMD',
                'specialization' => 'ORAL MEDICINE SPECIALIST',
                'designation' => null,
                'level' => 4,
                'order_index' => 1,
            ],
        ];

        foreach ($defaultTeam as $member) {
            TeamMember::create($member);
        }
    }
}
