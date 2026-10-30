<?php

namespace App\Models;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
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
 * @property int|null $user_id
 * @property int|null $cashier_id
 * @property int|null $store_customer_id
 * @property int|null $store_id
 * @property int|null $pos_register_id
 * @property int|null $pos_shift_id
 * @property int|null $exchanged_from_order_id
 * @property numeric-string $exchange_credit
 * @property string $number
 * @property OrderStatus $status
 * @property OrderSource $source
 * @property numeric-string $subtotal
 * @property numeric-string $shipping_amount
 * @property numeric-string $discount_amount
 * @property numeric-string $tax_rate
 * @property numeric-string $tax_amount
 * @property numeric-string $total
 * @property PaymentMethod|null $payment_method
 * @property numeric-string|null $amount_tendered
 * @property numeric-string|null $change_due
 * @property numeric-string $refunded_amount
 * @property string $shipping_name
 * @property string $shipping_phone
 * @property string $shipping_address
 * @property string $shipping_city
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 * @property-read User|null $cashier
 * @property-read StoreCustomer|null $storeCustomer
 * @property-read Store|null $store
 * @property-read PosRegister|null $register
 * @property-read PosShift|null $shift
 * @property-read Order|null $exchangedFrom
 * @property-read Collection<int, OrderItem> $items
 * @property-read Collection<int, OrderReturn> $returns
 * @property-read Collection<int, OrderPayment> $payments
 */
#[Fillable([
    'user_id',
    'cashier_id',
    'store_customer_id',
    'store_id',
    'pos_register_id',
    'pos_shift_id',
    'exchanged_from_order_id',
    'exchange_credit',
    'number',
    'status',
    'source',
    'subtotal',
    'shipping_amount',
    'discount_amount',
    'tax_rate',
    'tax_amount',
    'total',
    'payment_method',
    'amount_tendered',
    'change_due',
    'refunded_amount',
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
            'source' => OrderSource::class,
            'payment_method' => PaymentMethod::class,
            'subtotal' => 'decimal:2',
            'shipping_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_rate' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_tendered' => 'decimal:2',
            'change_due' => 'decimal:2',
            'refunded_amount' => 'decimal:2',
            'exchange_credit' => 'decimal:2',
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
     * @return BelongsTo<User, $this>
     */
    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * @return BelongsTo<StoreCustomer, $this>
     */
    public function storeCustomer(): BelongsTo
    {
        return $this->belongsTo(StoreCustomer::class);
    }

    /**
     * @return BelongsTo<Store, $this>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * @return BelongsTo<PosRegister, $this>
     */
    public function register(): BelongsTo
    {
        return $this->belongsTo(PosRegister::class, 'pos_register_id');
    }

    /**
     * @return BelongsTo<PosShift, $this>
     */
    public function shift(): BelongsTo
    {
        return $this->belongsTo(PosShift::class, 'pos_shift_id');
    }

    /**
     * @return HasMany<OrderPayment, $this>
     */
    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function exchangedFrom(): BelongsTo
    {
        return $this->belongsTo(self::class, 'exchanged_from_order_id');
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return HasMany<OrderReturn, $this>
     */
    public function returns(): HasMany
    {
        return $this->hasMany(OrderReturn::class);
    }

    public function getRouteKeyName(): string
    {
        return 'number';
    }

    public function isReturnable(): bool
    {
        if (! in_array($this->status, [OrderStatus::Delivered, OrderStatus::Shipped], true)) {
            return false;
        }

        return $this->items->contains(fn (OrderItem $item): bool => $item->returnableQuantity() > 0);
    }

    public static function generateNumber(): string
    {
        do {
            $number = 'VGF-'.now()->format('ymd').'-'.Str::upper(Str::random(4));
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
            'source' => $this->source->value,
            'source_label' => $this->source->label(),
            'subtotal' => (float) $this->subtotal,
            'shipping_amount' => (float) $this->shipping_amount,
            'discount_amount' => (float) $this->discount_amount,
            'tax_rate' => (float) $this->tax_rate,
            'tax_amount' => (float) $this->tax_amount,
            'exchange_credit' => (float) $this->exchange_credit,
            'exchanged_from_number' => $this->exchangedFrom?->number,
            'total' => (float) $this->total,
            'refunded_amount' => (float) $this->refunded_amount,
            'payment_method' => $this->payment_method?->value,
            'payment_method_label' => $this->payment_method?->label(),
            'amount_tendered' => $this->amount_tendered !== null ? (float) $this->amount_tendered : null,
            'change_due' => $this->change_due !== null ? (float) $this->change_due : null,
            'shipping_name' => $this->shipping_name,
            'shipping_phone' => $this->shipping_phone,
            'shipping_address' => $this->shipping_address,
            'shipping_city' => $this->shipping_city,
            'notes' => $this->notes,
            'item_count' => (int) $this->items->sum('quantity'),
            'placed_at' => $this->created_at?->timezone(config('app.timezone'))->format('d M Y, h:i A'),
            'is_returnable' => $this->isReturnable(),
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
        $customer = $this->user;

        return [
            ...$this->toCustomerArray($withItems),
            'can_update_status' => $this->status->isOpen(),
            'cashier' => $this->cashier instanceof User
                ? [
                    'id' => $this->cashier->id,
                    'name' => $this->cashier->name,
                ]
                : null,
            'customer' => [
                'id' => $customer?->id,
                'name' => $customer instanceof User ? $customer->name : $this->shipping_name,
                'email' => $customer instanceof User ? $customer->email : 'Walk-in',
            ],
            'returns' => $this->relationLoaded('returns')
                ? $this->returns
                    ->map(fn (OrderReturn $return) => $return->toFrontendArray())
                    ->values()
                    ->all()
                : [],
            'payments' => $this->relationLoaded('payments')
                ? $this->payments
                    ->map(fn (OrderPayment $payment) => $payment->toFrontendArray())
                    ->values()
                    ->all()
                : [],
            'store_name' => $this->store?->name,
            'register_name' => $this->register?->name,
        ];
    }
}
