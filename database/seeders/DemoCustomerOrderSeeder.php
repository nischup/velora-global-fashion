<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoCustomerOrderSeeder extends Seeder
{
    public function run(): void
    {
        $customer = User::query()->updateOrCreate(
            ['email' => 'customer@mail.com'],
            [
                'name' => 'Amina Rahman',
                'password' => '12345678',
                'role' => UserRole::Customer,
                'email_verified_at' => now(),
            ],
        );

        if ($customer->orders()->exists()) {
            return;
        }

        $variant = ProductVariant::query()
            ->with(['product', 'attributeValues.attribute'])
            ->first();

        if (! $variant) {
            return;
        }

        $order = Order::query()->create([
            'user_id' => $customer->id,
            'number' => Order::generateNumber(),
            'status' => OrderStatus::Pending,
            'subtotal' => $variant->price,
            'shipping_amount' => 0,
            'total' => $variant->price,
            'shipping_name' => $customer->name,
            'shipping_phone' => '01700000000',
            'shipping_address' => '12 Gulshan Avenue',
            'shipping_city' => 'Dhaka',
        ]);

        $order->items()->create([
            'product_id' => $variant->product_id,
            'product_variant_id' => $variant->id,
            'product_name' => $variant->product->name,
            'variant_sku' => $variant->sku,
            'variant_label' => $variant->optionLabel(),
            'unit_price' => $variant->price,
            'quantity' => 1,
            'line_total' => $variant->price,
        ]);
    }
}
