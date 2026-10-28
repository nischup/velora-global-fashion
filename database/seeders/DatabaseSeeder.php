<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'sabbir@mail.com'],
            [
                'name' => 'Sabbir Ahmed',
                'password' => '12345678',
                'role' => UserRole::Admin,
                'email_verified_at' => now(),
            ],
        );

        $this->call(CatalogSeeder::class);
        $this->call(DemoCustomerOrderSeeder::class);
    }
}
