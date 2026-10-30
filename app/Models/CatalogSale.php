<?php

namespace App\Models;

use App\Enums\CatalogSaleScope;
use Database\Factories\CatalogSaleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property int $percent
 * @property CatalogSaleScope $applies_to
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Product> $products
 */
#[Fillable(['name', 'percent', 'applies_to', 'starts_at', 'ends_at', 'is_active'])]
class CatalogSale extends Model
{
    /** @use HasFactory<CatalogSaleFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'percent' => 'integer',
            'applies_to' => CatalogSaleScope::class,
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'catalog_sale_product');
    }

    /**
     * @param  Builder<CatalogSale>  $query
     */
    public function scopeRunning(Builder $query): void
    {
        $query->where('is_active', true)
            ->where(function (Builder $query): void {
                $query->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function (Builder $query): void {
                $query->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            });
    }

    public function isRunning(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->starts_at instanceof Carbon && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->ends_at instanceof Carbon && $this->ends_at->isPast()) {
            return false;
        }

        return true;
    }

    public function appliesToProduct(int $productId): bool
    {
        if ($this->applies_to === CatalogSaleScope::All) {
            return true;
        }

        return $this->products->contains(fn (Product $product): bool => $product->id === $productId);
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'percent' => $this->percent,
            'applies_to' => $this->applies_to->value,
            'starts_at' => $this->starts_at?->format('Y-m-d\TH:i'),
            'ends_at' => $this->ends_at?->format('Y-m-d\TH:i'),
            'is_active' => $this->is_active,
            'is_running' => $this->isRunning(),
            'products_count' => $this->products_count ?? $this->products->count(),
            'product_ids' => $this->products->pluck('id')->values()->all(),
            'products' => $this->products
                ->map(fn (Product $product): array => [
                    'id' => $product->id,
                    'name' => $product->name,
                ])
                ->values()
                ->all(),
        ];
    }
}
