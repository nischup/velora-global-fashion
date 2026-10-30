<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'sku' => strtoupper(fake()->unique()->bothify('VEL-###-??')),
            'barcode' => fake()->unique()->numerify('890##########'),
            'price' => fake()->randomFloat(2, 20, 400),
            'compare_at_price' => null,
            'stock' => fake()->numberBetween(5, 40),
            'low_stock_threshold' => 5,
            'is_active' => true,
        ];
    }
}
