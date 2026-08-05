<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patient_referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('users')->onDelete('cascade');
            $table->string('patient_name');
            $table->string('phone');
            $table->text('medical_condition');
            $table->string('urgency_level')->default('low'); // 'low', 'medium', 'high', 'critical'
            $table->string('status')->default('new'); // 'new', 'contacted', 'appointment_booked', 'under_treatment', 'completed', 'not_proceeding'
            $table->text('additional_notes')->nullable();
            $table->decimal('commission_amount', 10, 2)->default(0.00);
            $table->string('commission_status')->default('none'); // 'none', 'pending', 'paid'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patient_referrals');
    }
};
