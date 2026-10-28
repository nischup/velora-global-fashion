<?php

namespace App\Http\Controllers;

use App\Enums\ProductStatus;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response|RedirectResponse
    {
        if (! $request->user()?->isStaff()) {
            return to_route('account.index');
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'products' => Product::query()->count(),
                'live_products' => Product::query()->where('status', ProductStatus::Live)->count(),
                'low_stock' => ProductVariant::query()->lowStock()->count(),
                'categories' => Category::query()->count(),
                'orders' => Order::query()->count(),
            ],
        ]);
    }
}
