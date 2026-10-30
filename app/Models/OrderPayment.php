<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $order_return_id
 * @property int|null $pos_shift_id
 * @property PaymentMethod $method
 * @property PaymentType $type
 * @property numeric-string $amount
 * @property numeric-string|null $amount_tendered
 * @property numeric-string $change_due
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read OrderReturn|null $orderReturn
 * @property-read PosShift|null $shift
 */
#[Fillable([
    'order_id',
    'order_return_id',
    'pos_shift_id',
    'method',
    'type',
    'amount',
    'amount_tendered',
    'change_due',
])]
class OrderPayment extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'method' => PaymentMethod::class,
            'type' => PaymentType::class,
            'amount' => 'decimal:2',
            'amount_tendered' => 'decimal:2',
            'change_due' => 'decimal:2',
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
     * @return BelongsTo<OrderReturn, $this>
     */
    public function orderReturn(): BelongsTo
    {
        return $this->belongsTo(OrderReturn::class);
    }

    /**
     * @return BelongsTo<PosShift, $this>
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(PosShift::class, 'pos_shift_id');
    }

    /**
     * @return array<string, mixed>
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method->value,
            'method_label' => $this->method->label(),
            'type' => $this->type->value,
            'amount' => (float) $this->amount,
            'amount_tendered' => $this->amount_tendered !== null ? (float) $this->amount_tendered : null,
            'change_due' => (float) $this->change_due,
        ];
    }
}
