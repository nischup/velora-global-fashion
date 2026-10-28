<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $user_id
 * @property string $number
 * @property OrderStatus $status
 * @property numeric-string $subtotal
 * @property numeric-string $shipping_amount
 * @property numeric-string $total
 * @property string $shipping_name
 * @property string $shipping_phone
 * @property string $shipping_address
 * @property string $shipping_city
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read Collection<int, OrderItem> $items
 */
#[Fillable([
    'user_id',
    'number',
    'status',
    'subtotal',
    'shipping_amount',
    'total',
    'shipping_name',
    'shipping_phone',
    'shipping_address',
    'shipping_city',
    'notes',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'subtotal' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function getRouteKeyName(): string
    {
        return 'number';
    }

    public static function generateNumber(): string
    {
        do {
            $number = 'VEL-'.now()->format('ymd').'-'.Str::upper(Str::random(4));
        } while (self::query()->where('number', $number)->exists());

        return $number;
    }

    /**
     * @return array<string, mixed>
     */
    public function toCustomerArray(bool $withItems = false): array
    {
        $payload = [
            'id' => $this->id,
            'number' => $this->number,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'subtotal' => (float) $this->subtotal,
            'shipping_amount' => (float) $this->shipping_amount,
            'total' => (float) $this->total,
            'shipping_name' => $this->shipping_name,
            'shipping_phone' => $this->shipping_phone,
            'shipping_address' => $this->shipping_address,
            'shipping_city' => $this->shipping_city,
            'notes' => $this->notes,
            'item_count' => (int) $this->items->sum('quantity'),
            'placed_at' => $this->created_at?->timezone(config('app.timezone'))->format('d M Y, h:i A'),
        ];

        if ($withItems) {
            $payload['items'] = $this->items
                ->map(fn (OrderItem $item) => $item->toFrontendArray())
                ->values()
                ->all();
        }

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(bool $withItems = false): array
    {
        return [
            ...$this->toCustomerArray($withItems),
            'customer' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
        ];
    }
}
