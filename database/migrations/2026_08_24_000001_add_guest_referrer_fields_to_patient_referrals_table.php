<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_referrals', function (Blueprint $table) {
            $table->unsignedBigInteger('member_id')->nullable()->change();
            $table->string('referrer_type')->default('bds_doctor')->after('member_id');
            $table->string('referrer_name')->nullable()->after('referrer_type');
            $table->string('referrer_phone')->nullable()->after('referrer_name');
            $table->text('referrer_address')->nullable()->after('referrer_phone');
            $table->text('patient_address')->nullable()->after('phone');
        });

        Schema::table('patient_status_timelines', function (Blueprint $table) {
            $table->unsignedBigInteger('changed_by')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('patient_referrals', function (Blueprint $table) {
            $table->unsignedBigInteger('member_id')->nullable(false)->change();
            $table->dropColumn([
                'referrer_type',
                'referrer_name',
                'referrer_phone',
                'referrer_address',
                'patient_address',
            ]);
        });

        Schema::table('patient_status_timelines', function (Blueprint $table) {
            $table->unsignedBigInteger('changed_by')->nullable(false)->change();
        });
    }
};
