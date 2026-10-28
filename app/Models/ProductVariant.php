<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property string $sku
 * @property numeric-string $price
 * @property numeric-string|null $compare_at_price
 * @property int $stock
 * @property int $low_stock_threshold
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product $product
 * @property-read Collection<int, ProductAttributeValue> $attributeValues
 */
#[Fillable(['product_id', 'sku', 'price', 'compare_at_price', 'stock', 'low_stock_threshold', 'is_active'])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_at_price' => 'decimal:2',
            'stock' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsToMany<ProductAttributeValue, $this>
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductAttributeValue::class,
            'product_variant_attribute_values',
            'product_variant_id',
            'attribute_value_id',
        );
    }

    /**
     * @param  Builder<ProductVariant>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @param  Builder<ProductVariant>  $query
     */
    public function scopeLowStock(Builder $query): void
    {
        $query->whereColumn('stock', '<=', 'low_stock_threshold');
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->low_stock_threshold;
    }

    public function inStock(): bool
    {
        return $this->is_active && $this->stock > 0;
    }

    public function optionLabel(): string
    {
        return $this->attributeValues
            ->sortBy(fn (ProductAttributeValue $value) => $value->attribute->slug === 'size' ? 0 : 1)
            ->pluck('value')
            ->filter()
            ->join(' / ');
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        $values = $this->attributeValues;

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'stock' => $this->stock,
            'low_stock_threshold' => $this->low_stock_threshold,
            'is_active' => $this->is_active,
            'is_low_stock' => $this->isLowStock(),
            'attribute_value_ids' => $values->pluck('id')->values()->all(),
            'size' => $values->first(fn (ProductAttributeValue $value) => $value->attribute->slug === 'size')?->value,
            'color' => $values->first(fn (ProductAttributeValue $value) => $value->attribute->slug === 'color')?->value,
            'size_id' => $values->first(fn (ProductAttributeValue $value) => $value->attribute->slug === 'size')?->id,
            'color_id' => $values->first(fn (ProductAttributeValue $value) => $value->attribute->slug === 'color')?->id,
            'label' => $values->pluck('value')->join(' / '),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorefrontArray(): array
    {
        $values = $this->attributeValues;

        return [
            'id' => $this->id,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'compare_at_price' => $this->compare_at_price !== null ? (float) $this->compare_at_price : null,
            'stock' => $this->stock,
            'in_stock' => $this->inStock(),
            'is_low_stock' => $this->isLowStock(),
            'attribute_value_ids' => $values->pluck('id')->values()->all(),
            'attributes' => $values
                ->mapWithKeys(fn (ProductAttributeValue $value) => [$value->attribute->slug => $value->value])
                ->all(),
        ];
    }
}
