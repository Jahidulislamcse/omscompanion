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

            if (\Illuminate\Support\Facades\Schema::hasTable('patient_referrals') && !\Illuminate\Support\Facades\Schema::hasColumn('patient_referrals', 'admin_read_at')) {
                \Illuminate\Support\Facades\Schema::table('patient_referrals', function ($table) {
                    $table->timestamp('admin_read_at')->nullable()->after('status');
                });
            }

            if (\Illuminate\Support\Facades\Schema::hasTable('users') && !\Illuminate\Support\Facades\Schema::hasColumn('users', 'admin_read_at')) {
                \Illuminate\Support\Facades\Schema::table('users', function ($table) {
                    $table->timestamp('admin_read_at')->nullable()->after('status');
                });
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Auto-migration in AppServiceProvider failed: ' . $e->getMessage());
        }
    }
}
