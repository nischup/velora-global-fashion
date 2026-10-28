<?php

namespace App\Http\Controllers\Shop;

use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductAttribute;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function show(Product $product): Response
    {
        abort_unless($product->status === ProductStatus::Live, 404);

        $product->load([
            'images',
            'brand',
            'category',
            'variants' => fn ($query) => $query->active()->with('attributeValues.attribute'),
        ]);

        $usedValueIds = $product->variants
            ->flatMap(fn ($variant) => $variant->attributeValues->pluck('id'))
            ->unique()
            ->all();

        $options = ProductAttribute::query()
            ->whereIn('slug', ['size', 'color'])
            ->with(['values' => fn ($query) => $query->whereIn('id', $usedValueIds)])
            ->get()
            ->map(fn (ProductAttribute $attribute) => [
                'id' => $attribute->id,
                'name' => $attribute->name,
                'slug' => $attribute->slug,
                'values' => $attribute->values->map(fn ($value) => $value->toAdminArray())->values()->all(),
            ])
            ->values();

        $related = Product::query()
            ->live()
            ->withCardRelations()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->id)
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Product $relatedProduct) => $relatedProduct->toStorefrontCard())
            ->values();

        return Inertia::render('shop/show', [
            'product' => $product->toStorefrontDetail(),
            'options' => $options,
            'related' => $related,
        ]);
    }
}
