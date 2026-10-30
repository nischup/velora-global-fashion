<?php

namespace App\Services;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentType;
use App\Enums\ProductStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderPayment;
use App\Models\OrderReturn;
use App\Models\PosHold;
use App\Models\PosShift;
use App\Models\ProductVariant;
use App\Models\StoreCustomer;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class PosSaleService
{
    public function __construct(
        private readonly PosShiftService $shifts,
        private readonly CatalogSaleService $catalogSales,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     *
     * @throws Throwable
     */
    public function sell(User $cashier, array $payload): Order
    {
        return DB::transaction(function () use ($cashier, $payload): Order {
            return $this->createSale($cashier, $this->requireOpenShift($cashier), $payload);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     *
     * @throws Throwable
     */
    public function processReturn(Order $order, User $cashier, array $payload): OrderReturn
    {
        return DB::transaction(function () use ($order, $cashier, $payload): OrderReturn {
            return $this->applyReturn(
                $order,
                $cashier,
                $payload,
                null,
            );
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     *
     * @throws Throwable
     */
    public function exchange(User $cashier, Order $order, array $payload): Order
    {
        return DB::transaction(function () use ($cashier, $order, $payload): Order {
            $shift = $this->requireOpenShift($cashier);
            $credit = $this->returnCredit($order, $payload['return_items']);
            $salePayload = $payload;
            unset($salePayload['return_items']);

            $prepared = $this->prepareSale(
                $salePayload,
                enforceStock: false,
                taxRate: (float) $shift->register->store->tax_rate,
            );
            $due = max(round($prepared['total'] - $credit, 2), 0.0);
            $leftover = max(round($credit - $prepared['total'], 2), 0.0);

            $this->applyReturn($order, $cashier, [
                'items' => $payload['return_items'],
                'refund_method' => $payload['payment_method'] ?? $this->primaryPaymentMethod($payload)?->value,
                'reason' => $payload['reason'] ?? 'Exchange for new items',
            ], $leftover);

            $salePayload['exchange_credit'] = min($credit, $prepared['total']);
            $salePayload['exchanged_from_order_id'] = $order->id;
            $salePayload['amount_due'] = $due;
            $salePayload['notes'] = trim(
                (string) ($payload['notes'] ?? '').' Exchange for '.$order->number,
            );

            return $this->createSale($cashier, $shift, $salePayload);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function hold(User $cashier, array $payload): PosHold
    {
        $shift = $this->requireOpenShift($cashier);
        $customer = $this->resolveCustomer($payload);

        $hold = PosHold::query()->create([
            'cashier_id' => $cashier->id,
            'pos_register_id' => $shift->pos_register_id,
            'store_customer_id' => $customer['store_customer_id'],
            'customer_name' => $customer['name'] === 'Walk-in Customer' ? null : $customer['name'],
            'customer_phone' => $customer['phone'] === '—' ? null : $customer['phone'],
            'discount_type' => (string) ($payload['discount_type'] ?? 'none'),
            'discount_value' => (float) ($payload['discount_value'] ?? 0),
            'notes' => isset($payload['notes']) ? (string) $payload['notes'] : null,
        ]);

        /** @var list<array{variant_id: int, quantity: int, discount_type?: string, discount_value?: float|int|string}> $items */
        $items = $payload['items'];

        $hold->items()->createMany(array_map(
            fn (array $item): array => [
                'product_variant_id' => $item['variant_id'],
                'quantity' => $item['quantity'],
                'discount_type' => $item['discount_type'] ?? 'none',
                'discount_value' => $item['discount_value'] ?? 0,
            ],
            $items,
        ));

        if (isset($payload['hold_id'])) {
            PosHold::query()->whereKey((int) $payload['hold_id'])->delete();
        }

        return $hold->load(['items.variant.product', 'items.variant.attributeValues.attribute']);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function createSale(User $cashier, PosShift $shift, array $payload): Order
    {
        $taxRate = (float) $shift->register->store->tax_rate;
        $prepared = $this->prepareSale($payload, taxRate: $taxRate);
        $credit = (float) ($payload['exchange_credit'] ?? 0);
        $due = array_key_exists('amount_due', $payload)
            ? (float) $payload['amount_due']
            : max(round($prepared['total'] - $credit, 2), 0.0);
        [$payment, $tendered, $change] = $this->settlePayments($payload, $due);
        $customer = $this->resolveCustomer($payload);

        $order = Order::query()->create([
            'user_id' => $customer['user_id'],
            'store_customer_id' => $customer['store_customer_id'],
            'store_id' => $shift->register->store_id,
            'pos_register_id' => $shift->pos_register_id,
            'pos_shift_id' => $shift->id,
            'cashier_id' => $cashier->id,
            'exchanged_from_order_id' => $payload['exchanged_from_order_id'] ?? null,
            'exchange_credit' => $credit,
            'number' => Order::generateNumber(),
            'status' => OrderStatus::Delivered,
            'source' => OrderSource::Pos,
            'subtotal' => $prepared['subtotal'],
            'shipping_amount' => 0,
            'discount_amount' => $prepared['order_discount'],
            'tax_rate' => $taxRate,
            'tax_amount' => $prepared['tax_amount'],
            'total' => $prepared['total'],
            'payment_method' => $payment,
            'amount_tendered' => $tendered,
            'change_due' => $change,
            'refunded_amount' => 0,
            'shipping_name' => $customer['name'],
            'shipping_phone' => $customer['phone'],
            'shipping_address' => 'In-store',
            'shipping_city' => 'In-store',
            'notes' => isset($payload['notes']) ? trim((string) $payload['notes']) : null,
        ]);

        $order->items()->createMany($prepared['order_items']);
        $this->writeSalePayments($order, $shift, $payload, $due);

        if (isset($payload['hold_id'])) {
            PosHold::query()->whereKey((int) $payload['hold_id'])->delete();
        }

        return $order->load(['items.product', 'user', 'cashier', 'storeCustomer', 'exchangedFrom', 'payments', 'store', 'register']);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{
     *     subtotal: float,
     *     order_discount: float,
     *     tax_amount: float,
     *     total: float,
     *     order_items: list<array<string, mixed>>
     * }
     */
    private function prepareSale(array $payload, bool $enforceStock = true, float $taxRate = 0.0): array
    {
        /** @var list<array{variant_id: int, quantity: int, discount_type?: string, discount_value?: float|int|string}> $items */
        $items = $payload['items'];
        $orderItems = [];
        $subtotal = 0.0;
        $lineNet = 0.0;

        foreach ($items as $item) {
            $variant = ProductVariant::query()
                ->with(['product', 'attributeValues.attribute'])
                ->lockForUpdate()
                ->find($item['variant_id']);

            if (
                ! $variant instanceof ProductVariant
                || $variant->product->status !== ProductStatus::Live
                || ! $variant->is_active
                || (
                    $enforceStock
                    && (! $variant->inStock() || $variant->stock < $item['quantity'])
                )
            ) {
                throw ValidationException::withMessages([
                    'items' => ($variant?->product->name ?? 'An item').' is not available in that quantity.',
                ]);
            }

            $unitPrice = $this->catalogSales->sellingPrice($variant);
            $gross = $unitPrice * $item['quantity'];
            $lineDiscount = $this->discountAmount(
                $gross,
                (string) ($item['discount_type'] ?? 'none'),
                (float) ($item['discount_value'] ?? 0),
                'items',
            );
            $lineTotal = round($gross - $lineDiscount, 2);
            $subtotal += $gross;
            $lineNet += $lineTotal;

            $orderItems[] = [
                'product_id' => $variant->product_id,
                'product_variant_id' => $variant->id,
                'product_name' => $variant->product->name,
                'variant_sku' => $variant->sku,
                'variant_label' => $variant->optionLabel(),
                'unit_price' => $unitPrice,
                'quantity' => $item['quantity'],
                'returned_quantity' => 0,
                'discount_amount' => $lineDiscount,
                'line_total' => $lineTotal,
            ];

            if ($enforceStock) {
                $variant->decrement('stock', $item['quantity']);
            }
        }

        $orderDiscount = $this->discountAmount(
            $lineNet,
            (string) ($payload['discount_type'] ?? 'none'),
            (float) ($payload['discount_value'] ?? 0),
        );
        $taxable = round($lineNet - $orderDiscount, 2);
        $taxAmount = round($taxable * ($taxRate / 100), 2);

        return [
            'subtotal' => round($subtotal, 2),
            'order_discount' => $orderDiscount,
            'tax_amount' => $taxAmount,
            'total' => round($taxable + $taxAmount, 2),
            'order_items' => $orderItems,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function applyReturn(
        Order $order,
        User $cashier,
        array $payload,
        ?float $refundOverride,
    ): OrderReturn {
        if (! in_array($order->status, [OrderStatus::Delivered, OrderStatus::Shipped], true)) {
            throw ValidationException::withMessages([
                'order' => 'Only fulfilled orders can be returned.',
            ]);
        }

        /** @var list<array{order_item_id: int, quantity: int}> $lines */
        $lines = $payload['items'];
        $order->load(['items']);
        $credit = $this->returnCredit($order, $lines);
        $refundAmount = $refundOverride ?? $credit;
        $returnItems = [];

        foreach ($lines as $line) {
            $item = $order->items->firstWhere('id', $line['order_item_id']);

            if (! $item instanceof OrderItem || $line['quantity'] > $item->returnableQuantity()) {
                throw ValidationException::withMessages([
                    'items' => 'A return quantity is higher than what is left on the order.',
                ]);
            }

            $netUnit = (float) $item->line_total / max($item->quantity, 1);
            $returnItems[] = [
                'order_item_id' => $item->id,
                'quantity' => $line['quantity'],
                'unit_price' => $item->unit_price,
                'line_total' => round($netUnit * $line['quantity'], 2),
            ];

            $item->increment('returned_quantity', $line['quantity']);

            if ($item->product_variant_id) {
                ProductVariant::query()
                    ->whereKey($item->product_variant_id)
                    ->increment('stock', $line['quantity']);
            }
        }

        $refund = OrderReturn::query()->create([
            'order_id' => $order->id,
            'cashier_id' => $cashier->id,
            'refund_method' => PaymentMethod::from((string) $payload['refund_method']),
            'refund_amount' => round($refundAmount, 2),
            'reason' => isset($payload['reason']) ? (string) $payload['reason'] : null,
        ]);

        $refund->items()->createMany($returnItems);
        $order->increment('refunded_amount', round($refundAmount, 2));

        if ($refundAmount > 0) {
            OrderPayment::query()->create([
                'order_id' => $order->id,
                'order_return_id' => $refund->id,
                'pos_shift_id' => $this->shifts->current($cashier)?->id,
                'method' => PaymentMethod::from((string) $payload['refund_method']),
                'type' => PaymentType::Refund,
                'amount' => round($refundAmount, 2),
                'amount_tendered' => round($refundAmount, 2),
                'change_due' => 0,
            ]);
        }

        $order->refresh()->load('items');

        $fullyReturned = $order->items->every(
            fn (OrderItem $item): bool => $item->returnableQuantity() === 0,
        );

        if ($fullyReturned) {
            $order->update(['status' => OrderStatus::Refunded]);
        }

        return $refund->load(['items.orderItem', 'cashier']);
    }

    /**
     * @param  list<array{order_item_id: int, quantity: int}>  $lines
     */
    private function returnCredit(Order $order, array $lines): float
    {
        $order->loadMissing('items');
        $lineNetSum = (float) $order->items->sum('line_total');
        $ratio = $lineNetSum > 0 ? (float) $order->total / $lineNetSum : 1.0;
        $credit = 0.0;

        foreach ($lines as $line) {
            $item = $order->items->firstWhere('id', $line['order_item_id']);

            if (! $item instanceof OrderItem || $line['quantity'] > $item->returnableQuantity()) {
                throw ValidationException::withMessages([
                    'items' => 'A return quantity is higher than what is left on the order.',
                ]);
            }

            $netUnit = (float) $item->line_total / max($item->quantity, 1);
            $credit += $netUnit * $line['quantity'] * $ratio;
        }

        return round($credit, 2);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{0: PaymentMethod|null, 1: float, 2: float}
     */
    private function settlePayments(array $payload, float $due): array
    {
        $rows = $this->normalizePayments($payload, $due);

        if ($rows === []) {
            return [$this->primaryPaymentMethod($payload), 0.0, 0.0];
        }

        $tendered = 0.0;
        $change = 0.0;
        $primary = PaymentMethod::from((string) $rows[0]['method']);

        foreach ($rows as $row) {
            $method = PaymentMethod::from((string) $row['method']);
            [$lineTendered, $lineChange] = $this->tender(
                $method,
                (float) $row['amount'],
                $row['amount_tendered'] ?? null,
            );
            $tendered += $lineTendered;
            $change += $lineChange;
        }

        return [$primary, round($tendered, 2), round($change, 2)];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function writeSalePayments(Order $order, PosShift $shift, array $payload, float $due): void
    {
        foreach ($this->normalizePayments($payload, $due) as $row) {
            $method = PaymentMethod::from((string) $row['method']);
            [$tendered, $change] = $this->tender(
                $method,
                (float) $row['amount'],
                $row['amount_tendered'] ?? null,
            );

            $order->payments()->create([
                'pos_shift_id' => $shift->id,
                'method' => $method,
                'type' => PaymentType::Sale,
                'amount' => round((float) $row['amount'], 2),
                'amount_tendered' => $tendered,
                'change_due' => $change,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return list<array{method: string, amount: float|int|string, amount_tendered?: float|int|string|null}>
     */
    private function normalizePayments(array $payload, float $due): array
    {
        if ($due <= 0) {
            return [];
        }

        if (isset($payload['payments']) && is_array($payload['payments']) && $payload['payments'] !== []) {
            /** @var list<array{method: string, amount: float|int|string, amount_tendered?: float|int|string|null}> $rows */
            $rows = array_values($payload['payments']);
            $sum = round(array_sum(array_map(
                fn (array $row): float => (float) $row['amount'],
                $rows,
            )), 2);

            if (abs($sum - $due) > 0.01) {
                throw ValidationException::withMessages([
                    'payments' => 'Split payments must add up to the amount due.',
                ]);
            }

            return $rows;
        }

        if (! isset($payload['payment_method'])) {
            throw ValidationException::withMessages([
                'payment_method' => 'Choose how the customer is paying.',
            ]);
        }

        return [[
            'method' => (string) $payload['payment_method'],
            'amount' => $due,
            'amount_tendered' => $payload['amount_tendered'] ?? null,
        ]];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function primaryPaymentMethod(array $payload): ?PaymentMethod
    {
        if (isset($payload['payment_method'])) {
            return PaymentMethod::from((string) $payload['payment_method']);
        }

        if (isset($payload['payments']) && is_array($payload['payments']) && $payload['payments'] !== []) {
            $first = $payload['payments'][0];

            if (is_array($first) && isset($first['method'])) {
                return PaymentMethod::from((string) $first['method']);
            }
        }

        return null;
    }

    /**
     * @return array{0: float, 1: float}
     */
    private function tender(PaymentMethod $method, float $due, mixed $amountTendered): array
    {
        if ($due <= 0) {
            return [0.0, 0.0];
        }

        if ($method !== PaymentMethod::Cash) {
            return [$due, 0.0];
        }

        $tendered = round((float) $amountTendered, 2);

        if ($tendered < $due) {
            throw ValidationException::withMessages([
                'amount_tendered' => 'Cash received must cover the amount due.',
            ]);
        }

        return [$tendered, round($tendered - $due, 2)];
    }

    private function discountAmount(float $base, string $type, float $value, string $field = 'discount_value'): float
    {
        $discount = match ($type) {
            'amount' => $value,
            'percent' => $base * ($value / 100),
            default => 0.0,
        };

        if ($discount < 0 || $discount > $base + 0.0001) {
            throw ValidationException::withMessages([
                $field => 'Discount cannot exceed the line or ticket total.',
            ]);
        }

        return round(min($discount, $base), 2);
    }

    private function requireOpenShift(User $cashier): PosShift
    {
        $shift = $this->shifts->current($cashier);

        if (! $shift instanceof PosShift) {
            throw ValidationException::withMessages([
                'shift' => 'Open a register shift before selling.',
            ]);
        }

        return $shift;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{user_id: int|null, store_customer_id: int|null, name: string, phone: string}
     */
    private function resolveCustomer(array $payload): array
    {
        $userId = isset($payload['user_id']) ? (int) $payload['user_id'] : null;
        $user = $userId ? User::query()->find($userId) : null;
        $name = trim((string) ($payload['customer_name'] ?? ''));
        $phone = trim((string) ($payload['customer_phone'] ?? ''));
        $storeCustomer = null;

        if (isset($payload['store_customer_id'])) {
            $storeCustomer = StoreCustomer::query()->find((int) $payload['store_customer_id']);
        }

        if (! $storeCustomer instanceof StoreCustomer && $phone !== '' && $phone !== '—') {
            $storeCustomer = StoreCustomer::query()->updateOrCreate(
                ['phone' => $phone],
                ['name' => $name !== '' ? $name : 'Walk-in Customer'],
            );
        } elseif ($storeCustomer instanceof StoreCustomer && $name !== '') {
            $storeCustomer->update(['name' => $name]);
        }

        if ($user instanceof User) {
            return [
                'user_id' => $user->id,
                'store_customer_id' => $storeCustomer?->id,
                'name' => $name !== '' ? $name : $user->name,
                'phone' => $phone !== '' ? $phone : '—',
            ];
        }

        if ($storeCustomer instanceof StoreCustomer) {
            return [
                'user_id' => null,
                'store_customer_id' => $storeCustomer->id,
                'name' => $name !== '' ? $name : $storeCustomer->name,
                'phone' => $storeCustomer->phone,
            ];
        }

        return [
            'user_id' => null,
            'store_customer_id' => null,
            'name' => $name !== '' ? $name : 'Walk-in Customer',
            'phone' => $phone !== '' ? $phone : '—',
        ];
    }
}
