<?php

namespace App\Models;

use App\Services\CatalogSaleService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $pos_hold_id
 * @property int $product_variant_id
 * @property int $quantity
 * @property string $discount_type
 * @property numeric-string $discount_value
 * @property-read PosHold $hold
 * @property-read ProductVariant $variant
 */
#[Fillable([
    'pos_hold_id',
    'product_variant_id',
    'quantity',
    'discount_type',
    'discount_value',
])]
class PosHoldItem extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'discount_value' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<PosHold, $this>
     */
    public function hold(): BelongsTo
    {
        return $this->belongsTo(PosHold::class, 'pos_hold_id');
    }

    /**
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toPosArray(): array
    {
        $variant = $this->variant;
        $product = $variant->product;

        return [
            'variant_id' => $this->product_variant_id,
            'product_name' => $product->name,
            'sku' => $variant->sku,
            'barcode' => $variant->barcode,
            'label' => $variant->optionLabel(),
            'price' => app(CatalogSaleService::class)->sellingPrice($variant),
            'stock' => $variant->stock,
            'quantity' => $this->quantity,
            'discount_type' => $this->discount_type,
            'discount_value' => (float) $this->discount_value,
            'image_url' => $product->coverImageUrl(),
            'in_stock' => $variant->inStock(),
        ];
    }
}
