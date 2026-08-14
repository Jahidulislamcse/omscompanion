<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // Seed initial default landing values
        DB::table('landing_settings')->insert([
            [
                'key' => 'hero_title',
                'value' => 'Bridging Dental Practices for Premium Patient Care',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'hero_subtitle',
                'value' => 'DentistChamber is a professional referral and membership hub connecting BDS Doctors with state-of-the-art treatment pipelines, live tracking logs, and expert clinical videos.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_1_title',
                'value' => 'Seamless Patient Referrals',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_1_desc',
                'value' => 'BDS members can refer patients with detailed clinical notes and urgency levels in a few simple taps.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_2_title',
                'value' => 'Live Treatment Tracking',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_2_desc',
                'value' => 'Check status changes (Contacted, Under Treatment, Completed) live via our interactive chronological status timeline tracker.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_3_title',
                'value' => 'Premium Clinical Library',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_3_desc',
                'value' => 'Gain exclusive access to secure, masterclass surgical streams, tutorial tutorials, and premium learning guides.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_4_title',
                'value' => 'Verified Digital Certificates',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'goal_4_desc',
                'value' => 'Download verified, high-quality digital membership certificates automatically generated with your clinic credentials.',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_settings');
    }
};
