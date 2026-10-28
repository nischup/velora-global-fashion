<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\ToggleWishlistRequest;
use App\Models\Product;
use App\Services\WishlistService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function __construct(private readonly WishlistService $wishlist) {}

    public function index(Request $request): Response
    {
        return Inertia::render('shop/wishlist', [
            'products' => $this->wishlist
                ->products($request)
                ->map(fn (Product $product) => $product->toStorefrontCard())
                ->values(),
        ]);
    }

    public function store(ToggleWishlistRequest $request): RedirectResponse
    {
        $product = Product::query()->findOrFail($request->integer('product_id'));
        $added = $this->wishlist->toggle($request, $product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $added ? 'Saved to wishlist.' : 'Removed from wishlist.',
        ]);

        return back();
    }

    public function destroy(Request $request, Product $product): RedirectResponse
    {
        $this->wishlist->remove($request, $product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Removed from wishlist.']);

        return back();
    }
}
