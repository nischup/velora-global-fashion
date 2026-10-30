<?php

namespace App\Models;

use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $product_id
 * @property int|null $product_variant_id
 * @property string $product_name
 * @property string $variant_sku
 * @property string|null $variant_label
 * @property numeric-string $unit_price
 * @property int $quantity
 * @property int $returned_quantity
 * @property numeric-string $discount_amount
 * @property numeric-string $line_total
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read Product|null $product
 * @property-read ProductVariant|null $variant
 */
#[Fillable([
    'order_id',
    'product_id',
    'product_variant_id',
    'product_name',
    'variant_sku',
    'variant_label',
    'unit_price',
    'quantity',
    'returned_quantity',
    'discount_amount',
    'line_total',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'line_total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'quantity' => 'integer',
            'returned_quantity' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
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
    public function returnableQuantity(): int
    {
        return max($this->quantity - $this->returned_quantity, 0);
    }

    /**
     * @return array<string, mixed>
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'variant_sku' => $this->variant_sku,
            'variant_label' => $this->variant_label,
            'unit_price' => (float) $this->unit_price,
            'quantity' => $this->quantity,
            'returned_quantity' => $this->returned_quantity,
            'discount_amount' => (float) $this->discount_amount,
            'returnable_quantity' => $this->returnableQuantity(),
            'line_total' => (float) $this->line_total,
            'product_slug' => $this->product?->slug,
            'image_url' => $this->product?->coverImageUrl(),
        ];
    }
}
