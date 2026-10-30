<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderSource;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkUpdateOrdersRequest;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\Services\CheckoutService;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class OrderController extends Controller
{
    public function __construct(private readonly CheckoutService $checkout) {}

    public function index(Request $request): Response
    {
        $from = $this->filterDate($request->input('from'), endOfDay: false);
        $to = $this->filterDate($request->input('to'), endOfDay: true);

        if ($from->gt($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $orders = Order::query()
            ->with(['user', 'cashier', 'items'])
            ->whereBetween('created_at', [$from, $to])
            ->when($request->string('q')->trim()->isNotEmpty(), function ($query) use ($request): void {
                $search = $request->string('q')->toString();
                $query->where(function ($query) use ($search): void {
                    $query->where('number', 'like', "%{$search}%")
                        ->orWhere('shipping_name', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($users) => $users->where('email', 'like', "%{$search}%"));
                });
            })
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('source'), fn ($query) => $query->where('source', $request->string('source')))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Order $order) => $order->toAdminArray());

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'filters' => [
                'q' => $request->string('q')->toString(),
                'status' => $request->string('status')->toString(),
                'source' => $request->string('source')->toString(),
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'statuses' => collect(OrderStatus::cases())
                ->map(fn (OrderStatus $status) => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->values(),
            'sources' => collect(OrderSource::cases())
                ->map(fn (OrderSource $source) => [
                    'value' => $source->value,
                    'label' => $source->label(),
                ])
                ->values(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user',
            'cashier',
            'items.product.primaryImage',
            'items.product.images',
            'returns.items.orderItem',
            'returns.cashier',
        ]);

        return Inertia::render('admin/orders/show', [
            'order' => $order->toAdminArray(withItems: true),
            'statuses' => collect(OrderStatus::cases())
                ->map(fn (OrderStatus $status) => [
                    'value' => $status->value,
                    'label' => $status->label(),
                ])
                ->values(),
            'payment_methods' => collect(PaymentMethod::cases())
                ->map(fn (PaymentMethod $method) => [
                    'value' => $method->value,
                    'label' => $method->label(),
                ])
                ->values(),
        ]);
    }

    public function invoice(Order $order): Response
    {
        $order->load([
            'user',
            'cashier',
            'items.product.primaryImage',
            'items.product.images',
            'payments',
            'store',
            'register',
        ]);

        return Inertia::render('admin/orders/invoice', [
            'order' => $order->toAdminArray(withItems: true),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $this->checkout->updateStatus($order, OrderStatus::from($request->string('status')->toString()));

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Order updated.']);

        return back();
    }

    public function bulk(BulkUpdateOrdersRequest $request): RedirectResponse
    {
        $status = OrderStatus::from($request->string('status')->toString());
        $updated = 0;
        $skipped = 0;

        $orders = Order::query()
            ->whereIn('id', $request->validated('order_ids'))
            ->get();

        foreach ($orders as $order) {
            try {
                $this->checkout->updateStatus($order, $status);
                $updated++;
            } catch (ValidationException) {
                $skipped++;
            }
        }

        if ($updated === 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'None of the selected orders can be updated.',
            ]);

            return back();
        }

        $message = $updated.' order'.($updated === 1 ? '' : 's').' updated.';

        if ($skipped > 0) {
            $message .= ' '.$skipped.' already closed.';
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return back();
    }

    private function filterDate(mixed $value, bool $endOfDay): CarbonInterface
    {
        $raw = is_string($value) ? trim($value) : '';
        $date = $this->parseDate($raw) ?? now();

        return $endOfDay ? $date->copy()->endOfDay() : $date->copy()->startOfDay();
    }

    private function parseDate(string $value): ?CarbonInterface
    {
        if ($value === '') {
            return null;
        }

        foreach (['d/m/Y', 'Y-m-d'] as $format) {
            try {
                $date = Carbon::createFromFormat('!'.$format, $value, config('app.timezone'));
            } catch (Throwable) {
                continue;
            }

            if ($date instanceof CarbonInterface && $date->format($format) === $value) {
                return $date;
            }
        }

        return null;
    }
}
