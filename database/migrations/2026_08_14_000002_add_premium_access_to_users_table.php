<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the temporary table created in the previous step
        Schema::dropIfExists('video_access_requests');

        // Add premium_access status to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('premium_access')->default('none')->after('status'); // 'none', 'pending', 'approved', 'rejected'
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('premium_access');
        });

        Schema::create('video_access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('video_id')->constrained('videos')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'video_id']);
        });
    }
};
