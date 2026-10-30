<?php

namespace Database\Factories;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 2000, 25000);

        return [
            'user_id' => User::factory(),
            'number' => Order::generateNumber(),
            'status' => OrderStatus::Pending,
            'source' => OrderSource::Online,
            'subtotal' => $subtotal,
            'shipping_amount' => 0,
            'discount_amount' => 0,
            'tax_rate' => 0,
            'tax_amount' => 0,
            'total' => $subtotal,
            'refunded_amount' => 0,
            'shipping_name' => fake()->name(),
            'shipping_phone' => '01'.fake()->numerify('#########'),
            'shipping_address' => fake()->streetAddress(),
            'shipping_city' => fake()->city(),
            'notes' => null,
        ];
    }
}
