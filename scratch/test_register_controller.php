<?php
require 'd:/xampp/htdocs/OMSCOMPANION/vendor/autoload.php';
$app = require_once 'd:/xampp/htdocs/OMSCOMPANION/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use App\Http\Controllers\AuthController;

echo "Creating dummy image file...\n";
$tempFilePath = tempnam(sys_get_temp_dir(), 'test_img');
$im = imagecreatetruecolor(100, 100);
$bg = imagecolorallocate($im, 255, 255, 255);
imagefill($im, 0, 0, $bg);
imagejpeg($im, $tempFilePath);
imagedestroy($im);

$uploadedFile = new UploadedFile(
    $tempFilePath,
    'test_avatar.jpg',
    'image/jpeg',
    null,
    true
);

echo "Instantiating AuthController...\n";
$controller = new AuthController();

$request = Request::create('/register', 'POST', [
    'name' => 'Dr. Test Registration',
    'email' => 'drtest_' . time() . '@example.com',
    'phone' => '017' . rand(10000000, 99999999),
    'whatsapp_number' => '01712345678',
    'doctor_type' => 'BDS',
    'bds_registration_number' => 'BDS9999',
    'clinic_name' => 'Test Clinic',
    'address' => 'Test Address',
    'password' => 'password123',
    'password_confirmation' => 'password123',
], [], [
    'avatar' => $uploadedFile
]);

echo "Invoking register method...\n";
try {
    $response = $controller->register($request);
    echo "SUCCESS! Response class: " . get_class($response) . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}

@unlink($tempFilePath);
