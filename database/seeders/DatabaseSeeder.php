<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@dentistchamber.com'],
            [
                'name' => 'Admin User',
                'phone' => '01700000000',
                'password' => \Illuminate\Support\Facades\Hash::make('adminpassword'),
                'raw_password' => 'adminpassword',
                'role' => 'admin',
                'status' => 'approved',
            ]
        );
    }
}
