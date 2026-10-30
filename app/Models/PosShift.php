<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentType;
use App\Enums\PosShiftStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $pos_register_id
 * @property int $cashier_id
 * @property PosShiftStatus $status
 * @property numeric-string $opening_cash
 * @property numeric-string|null $expected_cash
 * @property numeric-string|null $counted_cash
 * @property numeric-string|null $difference
 * @property Carbon $opened_at
 * @property Carbon|null $closed_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read PosRegister $register
 * @property-read User $cashier
 * @property-read Collection<int, Order> $orders
 * @property-read Collection<int, OrderPayment> $payments
 */
#[Fillable([
    'pos_register_id',
    'cashier_id',
    'status',
    'opening_cash',
    'expected_cash',
    'counted_cash',
    'difference',
    'opened_at',
    'closed_at',
    'notes',
])]
class PosShift extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => PosShiftStatus::class,
            'opening_cash' => 'decimal:2',
            'expected_cash' => 'decimal:2',
            'counted_cash' => 'decimal:2',
            'difference' => 'decimal:2',
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<PosRegister, $this>
     */
    public function register(): BelongsTo
    {
        return $this->belongsTo(PosRegister::class, 'pos_register_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @return HasMany<OrderPayment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    /**
     * @param  Builder<PosShift>  $query
     */
    public function scopeOpen(Builder $query): void
    {
        $query->where('status', PosShiftStatus::Open);
    }

    public function expectedCashInDrawer(): float
    {
        $cashSales = (float) $this->payments()
            ->where('method', PaymentMethod::Cash)
            ->where('type', PaymentType::Sale)
            ->sum('amount');

        $cashRefunds = (float) $this->payments()
            ->where('method', PaymentMethod::Cash)
            ->where('type', PaymentType::Refund)
            ->sum('amount');

        return round((float) $this->opening_cash + $cashSales - $cashRefunds, 2);
    }

    /**
     * @return array<string, mixed>
     */
    public function toPosArray(): array
    {
        $register = $this->relationLoaded('register') ? $this->register : $this->register()->with('store')->first();
        $store = $register?->store;

        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'opening_cash' => (float) $this->opening_cash,
            'expected_cash' => $this->status === PosShiftStatus::Closed
                ? (float) $this->expected_cash
                : $this->expectedCashInDrawer(),
            'counted_cash' => $this->counted_cash !== null ? (float) $this->counted_cash : null,
            'difference' => $this->difference !== null ? (float) $this->difference : null,
            'opened_at' => $this->opened_at->timezone(config('app.timezone'))->format('h:i A'),
            'closed_at' => $this->closed_at?->timezone(config('app.timezone'))->format('h:i A'),
            'notes' => $this->notes,
            'register' => $register instanceof PosRegister ? $register->toAdminArray() : null,
            'store' => $store instanceof Store ? $store->toAdminArray() : null,
            'cashier_name' => $this->relationLoaded('cashier') ? $this->cashier->name : null,
            'tax_rate' => $store instanceof Store ? (float) $store->tax_rate : 0.0,
        ];
    }
}
