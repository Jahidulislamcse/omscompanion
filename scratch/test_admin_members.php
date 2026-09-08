<?php
require 'd:/xampp/htdocs/OMSCOMPANION/vendor/autoload.php';
$app = require_once 'd:/xampp/htdocs/OMSCOMPANION/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Testing ANSI SQL CASE WHEN sorting for members...\n";

try {
    $members = User::where('role', 'member')
        ->with(['referrals' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])
        ->orderByRaw("CASE status WHEN 'pending' THEN 1 WHEN 'approved' THEN 2 WHEN 'rejected' THEN 3 ELSE 4 END")
        ->orderBy('created_at', 'desc')
        ->get();

    echo "SUCCESS! Retrieved " . count($members) . " members seamlessly.\n";
    foreach ($members as $m) {
        echo "ID: {$m->id}, Status: {$m->status}, AvatarURL: " . var_export($m->avatar_url, true) . "\n";
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
