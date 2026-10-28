<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Services\ProductCatalogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(private readonly ProductCatalogService $catalog) {}

    public function index(Request $request): Response
    {
        $products = Product::query()
            ->with(['category', 'brand', 'primaryImage', 'images', 'variants'])
            ->when($request->string('q')->trim()->isNotEmpty(), function ($query) use ($request): void {
                $search = $request->string('q')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhereHas('variants', fn ($variants) => $variants->where('sku', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Product $product) => $product->toAdminListArray());

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', $this->formOptions());
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $product = $this->catalog->create(
            $request->validated(),
            ProductCatalogService::normalizeImages($request->file('images')),
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product created.']);

        return to_route('admin.products.edit', $product);
    }

    public function edit(Product $product): Response
    {
        $product->load(['images', 'variants.attributeValues.attribute']);

        return Inertia::render('admin/products/edit', [
            ...$this->formOptions(),
            'product' => $product->toAdminFormArray(),
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->catalog->update($product, $request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product updated.']);

        return to_route('admin.products.edit', $product);
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->catalog->delete($product);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Product deleted.']);

        return to_route('admin.products.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        $attributes = ProductAttribute::query()
            ->whereIn('slug', ['size', 'color'])
            ->with('values')
            ->get()
            ->keyBy('slug');

        return [
            'categories' => Category::optionsForSelect(),
            'brands' => Brand::query()->active()->orderBy('name')->get(['id', 'name']),
            'sizes' => $attributes->get('size')?->values->map(fn ($value) => $value->toAdminArray())->values() ?? [],
            'colors' => $attributes->get('color')?->values->map(fn ($value) => $value->toAdminArray())->values() ?? [],
        ];
    }
}
