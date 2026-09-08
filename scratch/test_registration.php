<?php
require 'd:/xampp/htdocs/OMSCOMPANION/vendor/autoload.php';
$app = require_once 'd:/xampp/htdocs/OMSCOMPANION/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

echo "Checking avatar column in users table...\n";
if (Schema::hasColumn('users', 'avatar')) {
    echo "Column 'avatar' EXISTS in users table.\n";
} else {
    echo "Column 'avatar' DOES NOT EXIST in users table.\n";
}

echo "Testing user creation...\n";
try {
    $testUser = User::create([
        'name' => 'Test Doctor',
        'email' => 'testdr_' . time() . '@example.com',
        'phone' => '017' . rand(10000000, 99999999),
        'doctor_type' => 'BDS',
        'bds_registration_number' => 'BDS12345',
        'clinic_name' => 'Test Clinic',
        'address' => 'Test Address',
        'password' => Hash::make('password123'),
        'raw_password' => 'password123',
        'role' => 'member',
        'status' => 'pending',
        'avatar' => null,
    ]);

    echo "User created successfully! ID: " . $testUser->id . "\n";
    echo "Avatar URL: " . var_export($testUser->avatar_url, true) . "\n";

    // Clean up test user
    $testUser->delete();
    echo "Test user cleaned up.\n";
} catch (\Throwable $e) {
    echo "ERROR during creation: " . $e->getMessage() . "\n";
}
