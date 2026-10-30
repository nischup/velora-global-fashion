<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\ProductStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePosExchangeRequest;
use App\Http\Requests\Admin\StorePosHoldRequest;
use App\Http\Requests\Admin\StorePosSaleRequest;
use App\Models\Order;
use App\Models\PosHold;
use App\Models\PosRegister;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StoreCustomer;
use App\Models\User;
use App\Services\CatalogSaleService;
use App\Services\PosSaleService;
use App\Services\PosShiftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function __construct(
        private readonly PosSaleService $sales,
        private readonly PosShiftService $shifts,
        private readonly CatalogSaleService $catalogSales,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $products = Product::query()
            ->live()
            ->with(['brand', 'primaryImage', 'images', 'variants.attributeValues.attribute'])
            ->whereHas('variants', fn ($variants) => $variants->active())
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhereHas('variants', function ($variants) use ($search): void {
                            $variants->where('sku', 'like', "%{$search}%")
                                ->orWhere('barcode', 'like', "%{$search}%");
                        });
                });
            })
            ->latest()
            ->limit(24)
            ->get()
            ->map(fn (Product $product) => $product->toPosCard())
            ->values();

        $holds = PosHold::query()
            ->with(['items.variant.product.primaryImage', 'items.variant.product.images', 'items.variant.attributeValues.attribute'])
            ->where('cashier_id', $cashier->id)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (PosHold $hold) => $hold->toPosArray())
            ->values();

        $recent = Order::query()
            ->where('source', OrderSource::Pos)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'total' => (float) $order->total,
                'customer_name' => $order->shipping_name,
                'placed_at' => $order->created_at?->timezone(config('app.timezone'))->format('h:i A'),
            ])
            ->values();

        $resume = null;
        if ($request->filled('hold')) {
            $hold = PosHold::query()
                ->with(['items.variant.product.primaryImage', 'items.variant.product.images', 'items.variant.attributeValues.attribute'])
                ->where('cashier_id', $cashier->id)
                ->find($request->integer('hold'));
            $resume = $hold?->toPosArray(withItems: true);
        }

        $exchangeOrder = null;
        if ($request->filled('exchange')) {
            $order = Order::query()
                ->with(['items.product.primaryImage', 'items.product.images', 'storeCustomer'])
                ->where('source', OrderSource::Pos)
                ->where('number', $request->string('exchange')->toString())
                ->first();

            if ($order instanceof Order && $order->isReturnable()) {
                $exchangeOrder = $order->toAdminArray(withItems: true);
            }
        }

        $shift = $this->shifts->current($cashier);
        $registers = PosRegister::query()
            ->with('store')
            ->active()
            ->whereHas('store', fn ($store) => $store->active())
            ->orderBy('name')
            ->get()
            ->map(fn (PosRegister $register) => $register->toAdminArray())
            ->values();

        return Inertia::render('admin/pos/index', [
            'products' => $products,
            'filters' => [
                'q' => $search,
            ],
            'payment_methods' => $this->paymentMethods(),
            'holds' => $holds,
            'recent' => $recent,
            'resume' => $resume,
            'exchange_order' => $exchangeOrder,
            'shift' => $shift?->toPosArray(),
            'registers' => $registers,
        ]);
    }

    public function lookup(Request $request): JsonResponse
    {
        $code = $request->string('code')->trim()->toString();
        if ($code === '') {
            $code = $request->string('sku')->trim()->toString();
        }

        if ($code === '') {
            return response()->json(['message' => 'Scan a SKU or barcode.'], 422);
        }

        $variant = ProductVariant::query()
            ->with(['product.brand', 'product.primaryImage', 'product.images', 'attributeValues.attribute'])
            ->where(function ($query) use ($code): void {
                $query->whereRaw('LOWER(sku) = ?', [mb_strtolower($code)])
                    ->orWhereRaw('LOWER(barcode) = ?', [mb_strtolower($code)]);
            })
            ->first();

        if (
            ! $variant instanceof ProductVariant
            || $variant->product->status !== ProductStatus::Live
            || ! $variant->is_active
        ) {
            return response()->json(['message' => 'No live product matches that code.'], 404);
        }

        return response()->json([
            'item' => $this->lookupItem($variant),
        ]);
    }

    public function customers(Request $request): JsonResponse
    {
        $search = $request->string('q')->trim()->toString();

        if (mb_strlen($search) < 2) {
            return response()->json(['customers' => []]);
        }

        $customers = StoreCustomer::query()
            ->where(function ($query) use ($search): void {
                $query->where('phone', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            })
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (StoreCustomer $customer) => $customer->toPosArray())
            ->values();

        return response()->json(['customers' => $customers]);
    }

    public function store(StorePosSaleRequest $request): RedirectResponse
    {
        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $order = $this->sales->sell($cashier, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sale '.$order->number.' complete.',
        ]);

        return to_route('admin.pos.receipt', $order);
    }

    public function hold(StorePosHoldRequest $request): RedirectResponse
    {
        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $this->sales->hold($cashier, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Sale parked. Resume it from Holds when the customer comes back.',
        ]);

        return to_route('admin.pos.index');
    }

    public function discardHold(Request $request, PosHold $hold): RedirectResponse
    {
        abort_unless($hold->cashier_id === $request->user()?->id, 403);
        $hold->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Parked sale discarded.']);

        return to_route('admin.pos.index');
    }

    public function exchange(StorePosExchangeRequest $request, Order $order): RedirectResponse
    {
        abort_unless($order->source === OrderSource::Pos, 404);

        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $replacement = $this->sales->exchange($cashier, $order, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Exchange complete. New ticket '.$replacement->number.'.',
        ]);

        return to_route('admin.pos.receipt', $replacement);
    }

    public function receipt(Order $order): Response
    {
        abort_unless($order->source === OrderSource::Pos, 404);

        $order->load([
            'items.product.primaryImage',
            'items.product.images',
            'user',
            'cashier',
            'storeCustomer',
            'exchangedFrom',
            'returns.items.orderItem',
            'payments',
            'store',
            'register',
        ]);

        return Inertia::render('admin/pos/receipt', [
            'order' => $order->toAdminArray(withItems: true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function lookupItem(ProductVariant $variant): array
    {
        return [
            'product_id' => $variant->product_id,
            'product_name' => $variant->product->name,
            'image_url' => $variant->product->coverImageUrl(),
            'brand' => $variant->product->brand?->name,
            'variant_id' => $variant->id,
            'sku' => $variant->sku,
            'barcode' => $variant->barcode,
            'price' => $this->catalogSales->sellingPrice($variant),
            'stock' => $variant->stock,
            'label' => $variant->optionLabel(),
            'in_stock' => $variant->inStock(),
        ];
    }

    /**
     * @return list<array{value: string, label: string}>
     */
    private function paymentMethods(): array
    {
        $methods = [];

        foreach (PaymentMethod::cases() as $method) {
            $methods[] = [
                'value' => $method->value,
                'label' => $method->label(),
            ];
        }

        return $methods;
    }
}
