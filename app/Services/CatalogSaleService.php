<?php

namespace App\Services;

use App\Enums\CatalogSaleScope;
use App\Models\CatalogSale;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;

class CatalogSaleService
{
    /** @var Collection<int, CatalogSale>|null */
    private ?Collection $running = null;

    /**
     * @var array<int, array{price: float, compare_at_price: float|null, sale_percent: int|null, sale_name: string|null}>
     */
    private array $quotes = [];

    /**
     * @return Collection<int, CatalogSale>
     */
    public function running(): Collection
    {
        return $this->running ??= CatalogSale::query()
            ->running()
            ->with('products:id')
            ->orderByDesc('percent')
            ->get();
    }

    /**
     * @return array{name: string, percent: int, applies_to: string}|null
     */
    public function banner(): ?array
    {
        $sale = $this->running()->first(
            fn (CatalogSale $sale): bool => $sale->applies_to === CatalogSaleScope::All,
        ) ?? $this->running()->first();

        if (! $sale instanceof CatalogSale) {
            return null;
        }

        return [
            'name' => $sale->name,
            'percent' => $sale->percent,
            'applies_to' => $sale->applies_to->value,
        ];
    }

    public function saleForProduct(?int $productId): ?CatalogSale
    {
        if ($productId === null) {
            return null;
        }

        return $this->running()->first(
            fn (CatalogSale $sale): bool => $sale->appliesToProduct($productId),
        );
    }

    /**
     * @return array{price: float, compare_at_price: float|null, sale_percent: int|null, sale_name: string|null}
     */
    public function quote(ProductVariant $variant): array
    {
        return $this->quotes[$variant->id] ??= $this->compute($variant);
    }

    public function sellingPrice(ProductVariant $variant): float
    {
        return $this->quote($variant)['price'];
    }

    /**
     * @return array{price: float, compare_at_price: float|null, sale_percent: int|null, sale_name: string|null}
     */
    private function compute(ProductVariant $variant): array
    {
        $original = round((float) $variant->price, 2);
        $compare = $variant->compare_at_price !== null
            ? round((float) $variant->compare_at_price, 2)
            : null;
        $sale = $this->saleForProduct($variant->product_id);

        if (! $sale instanceof CatalogSale) {
            return [
                'price' => $original,
                'compare_at_price' => $compare !== null && $compare > $original ? $compare : null,
                'sale_percent' => null,
                'sale_name' => null,
            ];
        }

        $offer = round($original * (1 - ($sale->percent / 100)), 2);

        return [
            'price' => max(0.0, $offer),
            'compare_at_price' => max($original, $compare ?? 0),
            'sale_percent' => $sale->percent,
            'sale_name' => $sale->name,
        ];
    }
}
