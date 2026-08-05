<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_status_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_id')->constrained('patient_referrals')->onDelete('cascade');
            $table->string('status');
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_status_timelines');
    }
};
