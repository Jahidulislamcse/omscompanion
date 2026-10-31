<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('patient_referrals') && !Schema::hasColumn('patient_referrals', 'admin_read_at')) {
            Schema::table('patient_referrals', function (Blueprint $table) {
                $table->timestamp('admin_read_at')->nullable()->after('status');
            });
        }

        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'admin_read_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('admin_read_at')->nullable()->after('status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('patient_referrals') && Schema::hasColumn('patient_referrals', 'admin_read_at')) {
            Schema::table('patient_referrals', function (Blueprint $table) {
                $table->dropColumn('admin_read_at');
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'admin_read_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('admin_read_at');
            });
        }
    }
};
