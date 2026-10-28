<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $orders = $user
            ->orders()
            ->with('items.product')
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Order $order) => $order->toCustomerArray());

        return Inertia::render('account/orders/index', [
            'orders' => $orders,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()?->id, 403);

        $order->load(['items.product.primaryImage', 'items.product.images']);

        return Inertia::render('account/orders/show', [
            'order' => $order->toCustomerArray(withItems: true),
        ]);
    }
}
