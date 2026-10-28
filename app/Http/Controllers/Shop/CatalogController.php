<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function index(Request $request): Response
    {
        return $this->listing($request, null);
    }

    public function category(Request $request, Category $category): Response
    {
        abort_unless($category->is_active, 404);

        return $this->listing($request, $category);
    }

    private function listing(Request $request, ?Category $category): Response
    {
        $category?->load(['children' => fn ($query) => $query->active()->orderBy('sort_order')]);

        $products = Product::query()
            ->live()
            ->withCardRelations()
            ->when($category, function (Builder $query) use ($category): void {
                $query->whereIn('category_id', $category->selfAndChildrenIds());
            })
            ->when($request->string('q')->trim()->isNotEmpty(), function (Builder $query) use ($request): void {
                $search = $request->string('q')->toString();
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('short_description', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('variants', fn (Builder $variants) => $variants->where('sku', 'like', "%{$search}%"))
                        ->orWhereHas('brand', fn (Builder $brand) => $brand->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('brand'), fn (Builder $query) => $query->where('brand_id', $request->integer('brand')))
            ->when($request->boolean('in_stock'), function (Builder $query): void {
                $query->whereHas('variants', fn (Builder $variants) => $variants->active()->where('stock', '>', 0));
            })
            ->when($request->filled('min_price'), function (Builder $query) use ($request): void {
                $query->whereHas('variants', fn (Builder $variants) => $variants->where('price', '>=', $request->integer('min_price')));
            })
            ->when($request->filled('max_price'), function (Builder $query) use ($request): void {
                $query->whereHas('variants', fn (Builder $variants) => $variants->where('price', '<=', $request->integer('max_price')));
            })
            ->when($request->string('sort')->toString() === 'price_asc', fn (Builder $query) => $query->orderByRaw(
                '(select min(price) from product_variants where product_variants.product_id = products.id) asc',
            ))
            ->when($request->string('sort')->toString() === 'price_desc', fn (Builder $query) => $query->orderByRaw(
                '(select min(price) from product_variants where product_variants.product_id = products.id) desc',
            ))
            ->when($request->string('sort')->toString() === 'name', fn (Builder $query) => $query->orderBy('name'))
            ->when(! in_array($request->string('sort')->toString(), ['price_asc', 'price_desc', 'name'], true), fn (Builder $query) => $query->latest())
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => $product->toStorefrontCard());

        return Inertia::render('shop/index', [
            'products' => $products,
            'category' => $category ? [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'children' => $category->children->map->only(['id', 'name', 'slug'])->values()->all(),
            ] : null,
            'brands' => Brand::query()->active()->orderBy('name')->get(['id', 'name', 'slug']),
            'filters' => [
                'q' => $request->string('q')->toString(),
                'brand' => $request->integer('brand') ?: null,
                'min_price' => $request->integer('min_price') ?: null,
                'max_price' => $request->integer('max_price') ?: null,
                'in_stock' => $request->boolean('in_stock'),
                'sort' => $request->string('sort')->toString() ?: 'latest',
            ],
        ]);
    }
}
