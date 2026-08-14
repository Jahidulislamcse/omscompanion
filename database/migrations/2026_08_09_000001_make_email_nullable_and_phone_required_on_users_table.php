<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Fill any null/empty phone numbers for existing users first
        $nullUsers = DB::table('users')->whereNull('phone')->orWhere('phone', '')->get();
        foreach ($nullUsers as $index => $user) {
            DB::table('users')->where('id', $user->id)->update([
                'phone' => '0170000000' . ($index + 1)
            ]);
        }

        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('phone')->nullable(false)->unique()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
            $table->dropUnique(['phone']);
            $table->string('phone')->nullable()->change();
        });
    }
};
