<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\StoreCartItemRequest;
use App\Http\Requests\Shop\UpdateCartItemRequest;
use App\Models\ProductVariant;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart) {}

    public function index(Request $request): Response
    {
        return Inertia::render('shop/cart', $this->cart->summary($request));
    }

    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $variant = ProductVariant::query()->with('product')->findOrFail($request->integer('variant_id'));

        $this->cart->add($request, $variant, $request->integer('quantity', 1));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Added to bag.']);

        return back();
    }

    public function update(UpdateCartItemRequest $request, ProductVariant $variant): RedirectResponse
    {
        $this->cart->update($request, $variant, $request->integer('quantity'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Bag updated.']);

        return back();
    }

    public function destroy(Request $request, ProductVariant $variant): RedirectResponse
    {
        $this->cart->remove($request, $variant->id);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Removed from bag.']);

        return back();
    }
}
