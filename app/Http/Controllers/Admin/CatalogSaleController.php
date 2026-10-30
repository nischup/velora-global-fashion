<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CatalogSaleScope;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCatalogSaleRequest;
use App\Http\Requests\Admin\UpdateCatalogSaleRequest;
use App\Models\CatalogSale;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CatalogSaleController extends Controller
{
    public function index(): Response
    {
        $sales = CatalogSale::query()
            ->withCount('products')
            ->with('products:id,name')
            ->latest()
            ->get()
            ->map(fn (CatalogSale $sale) => $sale->toAdminArray())
            ->values();

        return Inertia::render('admin/sales/index', [
            'sales' => $sales,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/sales/create', $this->formOptions());
    }

    public function store(StoreCatalogSaleRequest $request): RedirectResponse
    {
        $this->persist($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sale created.']);

        return to_route('admin.sales.index');
    }

    public function edit(CatalogSale $sale): Response
    {
        $sale->load('products:id,name');

        return Inertia::render('admin/sales/edit', [
            ...$this->formOptions(),
            'sale' => $sale->toAdminArray(),
        ]);
    }

    public function update(UpdateCatalogSaleRequest $request, CatalogSale $sale): RedirectResponse
    {
        $this->persist($request->validated(), $sale);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sale updated.']);

        return to_route('admin.sales.index');
    }

    public function destroy(CatalogSale $sale): RedirectResponse
    {
        $sale->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Sale deleted.']);

        return to_route('admin.sales.index');
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function persist(array $data, ?CatalogSale $sale = null): CatalogSale
    {
        return DB::transaction(function () use ($data, $sale): CatalogSale {
            $scope = $data['applies_to'] instanceof CatalogSaleScope
                ? $data['applies_to']
                : CatalogSaleScope::from((string) $data['applies_to']);
            $productIds = $scope === CatalogSaleScope::Selected
                ? ($data['product_ids'] ?? [])
                : [];
            $data['applies_to'] = $scope;

            unset($data['product_ids']);

            if (($data['is_active'] ?? false) === true) {
                CatalogSale::query()
                    ->when($sale, fn ($query) => $query->whereKeyNot($sale->id))
                    ->update(['is_active' => false]);
            }

            if ($sale instanceof CatalogSale) {
                $sale->update($data);
            } else {
                $sale = CatalogSale::query()->create($data);
            }

            $sale->products()->sync($productIds);

            return $sale;
        });
    }

    /**
     * @return array<string, mixed>
     */
    private function formOptions(): array
    {
        return [
            'products' => Product::query()
                ->orderBy('name')
                ->get(['id', 'name', 'status'])
                ->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'status' => $product->status->value,
                ])
                ->values(),
        ];
    }
}
