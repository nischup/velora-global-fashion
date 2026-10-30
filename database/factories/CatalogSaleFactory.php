<?php

namespace Database\Factories;

use App\Enums\CatalogSaleScope;
use App\Models\CatalogSale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CatalogSale>
 */
class CatalogSaleFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Winter Sale',
            'percent' => 30,
            'applies_to' => CatalogSaleScope::All,
            'starts_at' => null,
            'ends_at' => null,
            'is_active' => true,
        ];
    }

    public function selected(): static
    {
        return $this->state(fn (): array => [
            'applies_to' => CatalogSaleScope::Selected,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => [
            'is_active' => false,
        ]);
    }
}
