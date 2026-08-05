<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('video_categories')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_path');
            $table->string('storage_type')->default('local'); // 'local', 'external'
            $table->integer('duration')->nullable(); // in seconds
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('videos');
    }
};
