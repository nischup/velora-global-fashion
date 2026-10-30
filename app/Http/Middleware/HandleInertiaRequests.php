<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Services\CartService;
use App\Services\CatalogSaleService;
use App\Services\WishlistService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $cart = app(CartService::class);
        $wishlistIds = app(WishlistService::class)->ids($request);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'storefront' => [
                'categories' => Category::query()
                    ->active()
                    ->roots()
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->get(['id', 'name', 'slug']),
                'cart_count' => $cart->count($request),
                'wishlist_count' => count($wishlistIds),
                'wishlist_ids' => $wishlistIds,
                'active_sale' => app(CatalogSaleService::class)->banner(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
