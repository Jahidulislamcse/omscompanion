<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

$file = Illuminate\Http\UploadedFile::fake()->image('avatar.jpg', 100, 100);

$request = Illuminate\Http\Request::create('/register', 'POST', [
    'name' => 'Dr. Test User',
    'phone' => '0189999' . rand(1000, 9999),
    'whatsapp_number' => '01899999999',
    'doctor_type' => 'BDS',
    'email' => 'test' . rand(1000, 9999) . '@example.com',
    'bds_registration_number' => 'REG-' . rand(1000, 9999),
    'clinic_name' => 'Test Dental Clinic',
    'address' => 'Dhaka',
    'password' => 'password123',
    'password_confirmation' => 'password123',
], [], [
    'avatar' => $file
]);

// Bypass CSRF for testing
$app->instance('middleware.disable', true);

try {
    $controller = new App\Http\Controllers\AuthController();
    $res = $controller->register($request);
    echo "Register method executed successfully!\n";
    echo "Redirect URL: " . $res->getTargetUrl() . "\n";
} catch (\Throwable $e) {
    echo "REGISTER ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo $e->getTraceAsString() . "\n";
}
