<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductVariantRequest;
use App\Http\Requests\Admin\UpdateProductVariantRequest;
use App\Http\Requests\Admin\UpdateVariantStockRequest;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ProductCatalogService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductVariantController extends Controller
{
    public function __construct(private readonly ProductCatalogService $catalog) {}

    public function store(StoreProductVariantRequest $request, Product $product): RedirectResponse
    {
        $this->catalog->createVariant($product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant added.']);

        return back();
    }

    public function update(UpdateProductVariantRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $this->catalog->updateVariant($product, $variant, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant updated.']);

        return back();
    }

    public function updateStock(UpdateVariantStockRequest $request, Product $product, ProductVariant $variant): RedirectResponse
    {
        $this->catalog->updateStock($product, $variant, (int) $request->validated('stock'));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stock updated.']);

        return back();
    }

    public function destroy(Product $product, ProductVariant $variant): RedirectResponse
    {
        $this->catalog->deleteVariant($product, $variant);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Variant deleted.']);

        return back();
    }
}
