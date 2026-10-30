<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GenerateBarcodesRequest;
use App\Models\ProductVariant;
use App\Services\BarcodeService;
use App\Services\CatalogSaleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BarcodeController extends Controller
{
    public const MAX_COPIES = 500;

    public function __construct(private readonly BarcodeService $barcodes) {}

    public function index(Request $request): Response
    {
        Gate::authorize('manage-catalog');

        $variants = ProductVariant::query()
            ->with(['product.brand', 'attributeValues.attribute'])
            ->when($request->string('q')->trim()->isNotEmpty(), function ($query) use ($request): void {
                $search = $request->string('q')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($products) => $products->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($request->string('status')->toString() === 'missing', fn ($query) => $query->whereNull('barcode'))
            ->when($request->string('status')->toString() === 'ready', fn ($query) => $query->whereNotNull('barcode'))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (ProductVariant $variant) => $this->toListArray($variant));

        return Inertia::render('admin/barcodes/index', [
            'variants' => $variants,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
            ],
            'missing_count' => ProductVariant::query()->whereNull('barcode')->count(),
        ]);
    }

    public function generate(GenerateBarcodesRequest $request): RedirectResponse
    {
        $ids = $request->collect('variant_ids')->filter()->map(fn (mixed $id): int => (int) $id)->all();

        $query = ProductVariant::query()->whereNull('barcode');

        if ($ids !== []) {
            $query->whereIn('id', $ids);
        }

        $assigned = $this->barcodes->assignMissing($query->get());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $assigned === 1
                ? '1 barcode generated.'
                : "{$assigned} barcodes generated.",
        ]);

        return back();
    }

    public function print(Request $request): Response|RedirectResponse
    {
        Gate::authorize('manage-catalog');

        $ids = collect(explode(',', $request->string('ids')->toString()))
            ->map(fn (string $id): int => (int) trim($id))
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return to_route('admin.barcodes.index');
        }

        $copies = max(1, min(self::MAX_COPIES, $request->integer('copies', 1)));

        $byId = ProductVariant::query()
            ->with(['product.brand', 'attributeValues.attribute'])
            ->whereIn('id', $ids)
            ->whereNotNull('barcode')
            ->get()
            ->keyBy('id');

        $labels = [];

        foreach ($ids as $id) {
            $variant = $byId->get($id);

            if (! $variant instanceof ProductVariant) {
                continue;
            }
            $label = [
                ...$this->toListArray($variant),
                'barcode_svg' => $this->barcodes->svg((string) $variant->barcode),
            ];

            for ($copy = 0; $copy < $copies; $copy++) {
                $labels[] = $label;
            }
        }

        return Inertia::render('admin/barcodes/print', [
            'labels' => $labels,
            'copies' => $copies,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function toListArray(ProductVariant $variant): array
    {
        return [
            'id' => $variant->id,
            'sku' => $variant->sku,
            'barcode' => $variant->barcode,
            'price' => app(CatalogSaleService::class)->sellingPrice($variant),
            'label' => $variant->optionLabel(),
            'product_id' => $variant->product_id,
            'product_name' => $variant->product->name,
            'brand' => $variant->product->brand?->name,
        ];
    }
}
