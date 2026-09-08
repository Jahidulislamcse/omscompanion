<?php
require 'd:/xampp/htdocs/OMSCOMPANION/vendor/autoload.php';
$app = require_once 'd:/xampp/htdocs/OMSCOMPANION/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Checking existing member_ids in database:\n";
$existingIds = User::whereNotNull('member_id')->pluck('member_id')->toArray();
print_r($existingIds);

$year = now()->year;
$count = User::whereYear('approved_at', $year)->count() + 1;
do {
    $memberId = 'MEM-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    $exists = User::where('member_id', $memberId)->exists();
    if ($exists) {
        $count++;
    }
} while ($exists);

echo "Generated Safe Unique Member ID: {$memberId}\n";
