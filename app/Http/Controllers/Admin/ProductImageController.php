<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductImageRequest;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\ProductCatalogService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductImageController extends Controller
{
    public function __construct(private readonly ProductCatalogService $catalog) {}

    public function store(StoreProductImageRequest $request, Product $product): RedirectResponse
    {
        $this->catalog->addImages(
            $product,
            ProductCatalogService::normalizeImages($request->file('images')),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Images uploaded.']);

        return back();
    }

    public function destroy(Product $product, ProductImage $image): RedirectResponse
    {
        $this->catalog->deleteImage($product, $image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Image deleted.']);

        return back();
    }

    public function primary(Product $product, ProductImage $image): RedirectResponse
    {
        $this->catalog->makePrimary($product, $image);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Primary image updated.']);

        return back();
    }
}
