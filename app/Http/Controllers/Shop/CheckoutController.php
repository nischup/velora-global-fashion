<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\StoreCheckoutRequest;
use App\Models\User;
use App\Services\CartService;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly CheckoutService $checkout,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $summary = $this->cart->summary($request);

        if ($summary['items'] === []) {
            Inertia::flash('toast', ['type' => 'info', 'message' => 'Your bag is empty.']);

            return to_route('cart.index');
        }

        return Inertia::render('shop/checkout', [
            ...$summary,
            'defaults' => [
                'shipping_name' => $user->name,
                'shipping_phone' => '',
                'shipping_address' => '',
                'shipping_city' => '',
                'notes' => '',
            ],
        ]);
    }

    public function store(StoreCheckoutRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $order = $this->checkout->place($request, $user, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order '.$order->number.' placed.']);

        return to_route('account.orders.show', ['order' => $order]);
    }
}
