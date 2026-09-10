<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\LandingSetting::updateOrCreate(
    ['key' => 'onesignal_app_id'],
    ['value' => 'cd9df2b6-fda0-463e-bebb-7d8b49edf74c']
);

echo "OneSignal App ID saved successfully!";
