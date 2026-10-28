<?php

namespace Database\Factories;

use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductAttributeValue>
 */
class ProductAttributeValueFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $value = fake()->unique()->word();

        return [
            'product_attribute_id' => ProductAttribute::factory(),
            'value' => Str::title($value),
            'slug' => Str::slug($value).'-'.fake()->unique()->numerify('###'),
            'hex_color' => null,
            'sort_order' => 0,
        ];
    }
}
