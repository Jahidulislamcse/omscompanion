<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('news_items', function (Blueprint $table) {
            $table->id();
            $table->string('badge_text');
            $table->string('sub_badge_text')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('button_text')->default('View Details →');
            $table->string('button_url')->nullable();
            $table->string('button_type')->default('outline'); // 'outline', 'whatsapp', 'primary'
            $table->string('theme_color')->default('indigo'); // 'indigo', 'emerald', 'cyan', 'gold'
            $table->boolean('is_published')->default(true);
            $table->integer('order_index')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_items');
    }
};
