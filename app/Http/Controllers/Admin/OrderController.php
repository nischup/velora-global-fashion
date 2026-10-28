<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout) {}

    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with(['user', 'items'])
            ->when($request->string('q')->trim()->isNotEmpty(), function ($query) use ($request): void {
                $search = $request->string('q')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('number', 'like', "%{$search}%")
                        ->orWhere('shipping_name', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($users) => $users->where('email', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Order $order) => $order->toAdminArray());

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'statuses' => collect(OrderStatus::cases())
                ->map(fn (OrderStatus $status) => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->values(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['user', 'items.product.primaryImage', 'items.product.images']);

        return Inertia::render('admin/orders/show', [
            'order' => $order->toAdminArray(withItems: true),
            'statuses' => collect(OrderStatus::cases())
                ->map(fn (OrderStatus $status) => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->values(),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $this->checkout->updateStatus($order, OrderStatus::from($request->string('status')->toString()));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order updated.']);

        return back();
    }
}
