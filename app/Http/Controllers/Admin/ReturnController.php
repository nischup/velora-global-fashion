<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();

        $orders = Order::query()
            ->with(['user', 'cashier', 'items'])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('number', 'like', "%{$search}%")
                        ->orWhere('shipping_name', 'like', "%{$search}%")
                        ->orWhere('shipping_phone', 'like', "%{$search}%");
                });
            }, function ($query): void {
                $query->whereIn('status', [OrderStatus::Delivered, OrderStatus::Shipped])
                    ->whereHas('items', fn ($items) => $items->whereColumn('returned_quantity', '<', 'quantity'));
            })
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn (Order $order) => $order->toAdminArray())
            ->values();

        return Inertia::render('admin/returns/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $search,
            ],
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user',
            'cashier',
            'items.product',
            'returns.items.orderItem',
            'returns.cashier',
        ]);

        return Inertia::render('admin/returns/show', [
            'order' => $order->toAdminArray(withItems: true),
            'payment_methods' => collect(PaymentMethod::cases())
                ->map(fn (PaymentMethod $method) => [
                    'value' => $method->value,
                    'label' => $method->label(),
                ])
                ->values(),
        ]);
    }
}
