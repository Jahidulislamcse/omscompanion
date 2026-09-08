<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patient_referrals', function (Blueprint $table) {
            $table->text('commission_notes')->nullable()->after('commission_status');
        });
    }

    public function down(): void
    {
        Schema::table('patient_referrals', function (Blueprint $table) {
            $table->dropColumn('commission_notes');
        });
    }
};
