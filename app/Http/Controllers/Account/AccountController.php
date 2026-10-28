<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $recentOrders = $user->orders()
            ->with('items.product')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (Order $order) => $order->toCustomerArray())
            ->values();

        return Inertia::render('account/index', [
            'stats' => [
                'orders' => $user->orders()->count(),
                'wishlist' => $user->wishlistItems()->count(),
            ],
            'orders' => $recentOrders,
        ]);
    }
}
