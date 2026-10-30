<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_return_id
 * @property int $order_item_id
 * @property int $quantity
 * @property numeric-string $unit_price
 * @property numeric-string $line_total
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read OrderReturn $orderReturn
 * @property-read OrderItem|null $orderItem
 */
#[Fillable([
    'order_return_id',
    'order_item_id',
    'quantity',
    'unit_price',
    'line_total',
])]
class OrderReturnItem extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'line_total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<OrderReturn, $this>
     */
    public function orderReturn(): BelongsTo
    {
        return $this->belongsTo(OrderReturn::class);
    }

    /**
     * @return BelongsTo<OrderItem, $this>
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'order_item_id' => $this->order_item_id,
            'product_name' => $this->orderItem?->product_name,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'line_total' => (float) $this->line_total,
        ];
    }
}
