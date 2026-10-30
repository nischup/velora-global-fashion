<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $cashier_id
 * @property PaymentMethod $refund_method
 * @property numeric-string $refund_amount
 * @property string|null $reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read User|null $cashier
 * @property-read Collection<int, OrderReturnItem> $items
 */
#[Fillable([
    'order_id',
    'cashier_id',
    'refund_method',
    'refund_amount',
    'reason',
])]
class OrderReturn extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'refund_method' => PaymentMethod::class,
            'refund_amount' => 'decimal:2',
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
     * @return BelongsTo<User, $this>
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * @return HasMany<OrderReturnItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderReturnItem::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'refund_method' => $this->refund_method->value,
            'refund_method_label' => $this->refund_method->label(),
            'refund_amount' => (float) $this->refund_amount,
            'reason' => $this->reason,
            'cashier_name' => $this->cashier?->name,
            'created_at' => $this->created_at?->timezone(config('app.timezone'))->format('d M Y, h:i A'),
            'items' => $this->relationLoaded('items')
                ? $this->items
                    ->map(fn (OrderReturnItem $item) => $item->toFrontendArray())
                    ->values()
                    ->all()
                : [],
        ];
    }
}
