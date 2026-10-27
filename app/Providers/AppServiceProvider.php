<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->usePublicPath($this->app->basePath());
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('notifications') && !\Illuminate\Support\Facades\Schema::hasColumn('notifications', 'action_url')) {
                \Illuminate\Support\Facades\Schema::table('notifications', function ($table) {
                    $table->string('action_url', 500)->nullable()->after('message');
                });
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Auto-migration for notifications.action_url failed: ' . $e->getMessage());
        }
    }
}
