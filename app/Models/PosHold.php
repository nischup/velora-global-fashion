<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $cashier_id
 * @property int|null $pos_register_id
 * @property int|null $store_customer_id
 * @property string|null $customer_name
 * @property string|null $customer_phone
 * @property string $discount_type
 * @property numeric-string $discount_value
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $cashier
 * @property-read PosRegister|null $register
 * @property-read StoreCustomer|null $storeCustomer
 * @property-read Collection<int, PosHoldItem> $items
 */
#[Fillable([
    'cashier_id',
    'pos_register_id',
    'store_customer_id',
    'customer_name',
    'customer_phone',
    'discount_type',
    'discount_value',
    'notes',
])]
class PosHold extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * @return BelongsTo<PosRegister, $this>
     */
    public function register(): BelongsTo
    {
        return $this->belongsTo(PosRegister::class, 'pos_register_id');
    }

    /**
     * @return BelongsTo<StoreCustomer, $this>
     */
    public function storeCustomer(): BelongsTo
    {
        return $this->belongsTo(StoreCustomer::class);
    }

    /**
     * @return HasMany<PosHoldItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(PosHoldItem::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function toPosArray(bool $withItems = false): array
    {
        $payload = [
            'id' => $this->id,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'store_customer_id' => $this->store_customer_id,
            'discount_type' => $this->discount_type,
            'discount_value' => (float) $this->discount_value,
            'notes' => $this->notes,
            'item_count' => (int) $this->items->sum('quantity'),
            'held_at' => $this->created_at?->timezone(config('app.timezone'))->format('h:i A'),
        ];

        if ($withItems) {
            $payload['items'] = $this->items
                ->map(fn (PosHoldItem $item) => $item->toPosArray())
                ->values()
                ->all();
        }

        return $payload;
    }
}
