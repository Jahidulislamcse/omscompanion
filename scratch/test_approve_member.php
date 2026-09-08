<?php
require 'd:/xampp/htdocs/OMSCOMPANION/vendor/autoload.php';
$app = require_once 'd:/xampp/htdocs/OMSCOMPANION/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

echo "Creating a test pending member with photo...\n";
$user = User::create([
    'name' => 'Dr. Test Photo Doctor',
    'email' => 'testphoto_' . time() . '@example.com',
    'phone' => '017' . rand(10000000, 99999999),
    'doctor_type' => 'BDS',
    'bds_registration_number' => 'BDS7777',
    'clinic_name' => 'Photo Clinic',
    'address' => 'Photo Address',
    'password' => Hash::make('password123'),
    'raw_password' => 'password123',
    'role' => 'member',
    'status' => 'pending',
    'avatar' => 'avatars/avatar_test.jpg',
]);

echo "Created User ID: {$user->id}, Avatar: {$user->avatar}, Avatar URL: {$user->avatar_url}\n";

$controller = new AdminController();
echo "Approving member...\n";
try {
    $response = $controller->approveMember($user);
    echo "SUCCESS! Approved status: " . $user->fresh()->status . ", Member ID: " . $user->fresh()->member_id . "\n";
    $user->delete();
    echo "Cleaned up test user.\n";
} catch (\Throwable $e) {
    echo "ERROR during approveMember: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    $user->delete();
}
