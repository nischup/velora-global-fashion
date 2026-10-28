<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class CheckoutService
{
    public function __construct(private readonly CartService $cart) {}

    /**
     * @param  array<string, mixed>  $shipping
     *
     * @throws Throwable
     */
    public function place(Request $request, User $user, array $shipping): Order
    {
        $summary = $this->cart->summary($request);

        if ($summary['items'] === []) {
            throw ValidationException::withMessages([
                'cart' => 'Your bag is empty.',
            ]);
        }

        return DB::transaction(function () use ($request, $user, $shipping, $summary): Order {
            $orderItems = [];
            $subtotal = 0.0;

            foreach ($summary['items'] as $item) {
                $variant = ProductVariant::query()
                    ->with(['product', 'attributeValues.attribute'])
                    ->lockForUpdate()
                    ->find($item['variant_id']);

                if (
                    ! $variant instanceof ProductVariant
                    || $variant->product->status !== ProductStatus::Live
                    || ! $variant->inStock()
                    || $variant->stock < $item['quantity']
                ) {
                    throw ValidationException::withMessages([
                        'cart' => $item['name'].' is no longer available in the quantity you selected.',
                    ]);
                }

                $lineTotal = (float) $variant->price * $item['quantity'];
                $subtotal += $lineTotal;

                $orderItems[] = [
                    'product_id' => $variant->product_id,
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_sku' => $variant->sku,
                    'variant_label' => $variant->optionLabel(),
                    'unit_price' => $variant->price,
                    'quantity' => $item['quantity'],
                    'line_total' => $lineTotal,
                ];

                $variant->decrement('stock', $item['quantity']);
            }

            $order = Order::query()->create([
                'user_id' => $user->id,
                'number' => Order::generateNumber(),
                'status' => OrderStatus::Pending,
                'subtotal' => $subtotal,
                'shipping_amount' => 0,
                'total' => $subtotal,
                'shipping_name' => (string) $shipping['shipping_name'],
                'shipping_phone' => (string) $shipping['shipping_phone'],
                'shipping_address' => (string) $shipping['shipping_address'],
                'shipping_city' => (string) $shipping['shipping_city'],
                'notes' => isset($shipping['notes']) ? (string) $shipping['notes'] : null,
            ]);

            $order->items()->createMany($orderItems);
            $this->cart->clear($request);

            return $order->load(['items.product', 'user']);
        });
    }

    public function updateStatus(Order $order, OrderStatus $status): Order
    {
        if ($order->status === $status) {
            return $order;
        }

        if ($order->status === OrderStatus::Cancelled || $order->status === OrderStatus::Delivered) {
            throw ValidationException::withMessages([
                'status' => 'This order can no longer be updated.',
            ]);
        }

        return DB::transaction(function () use ($order, $status): Order {
            if ($status === OrderStatus::Cancelled && $order->status->isOpen()) {
                $order->load('items');

                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::query()
                            ->whereKey($item->product_variant_id)
                            ->increment('stock', $item->quantity);
                    }
                }
            }

            $order->update(['status' => $status]);

            return $order->refresh();
        });
    }
}
