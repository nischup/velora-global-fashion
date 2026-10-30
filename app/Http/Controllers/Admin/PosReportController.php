<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderSource;
use App\Enums\PaymentMethod;
use App\Enums\PaymentType;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderPayment;
use App\Models\PosRegister;
use App\Models\PosShift;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class PosReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $this->date($request->string('from')->toString()) ?? now()->startOfDay();
        $to = $this->date($request->string('to')->toString())?->endOfDay() ?? now()->endOfDay();
        $storeId = $request->integer('store_id') ?: null;
        $registerId = $request->integer('register_id') ?: null;

        $orders = Order::query()
            ->where('source', OrderSource::Pos)
            ->whereBetween('created_at', [$from, $to])
            ->when($storeId, fn ($query) => $query->where('store_id', $storeId))
            ->when($registerId, fn ($query) => $query->where('pos_register_id', $registerId))
            ->get();

        $payments = OrderPayment::query()
            ->whereBetween('created_at', [$from, $to])
            ->whereHas('order', function ($query) use ($storeId, $registerId): void {
                $query->where('source', OrderSource::Pos)
                    ->when($storeId, fn ($query) => $query->where('store_id', $storeId))
                    ->when($registerId, fn ($query) => $query->where('pos_register_id', $registerId));
            })
            ->get();

        $methodBreakdown = [];

        foreach (PaymentMethod::cases() as $method) {
            $sales = (float) $payments
                ->where('method', $method)
                ->where('type', PaymentType::Sale)
                ->sum(fn (OrderPayment $payment) => (float) $payment->amount);
            $refunds = (float) $payments
                ->where('method', $method)
                ->where('type', PaymentType::Refund)
                ->sum(fn (OrderPayment $payment) => (float) $payment->amount);

            $methodBreakdown[] = [
                'method' => $method->value,
                'label' => $method->label(),
                'sales' => round($sales, 2),
                'refunds' => round($refunds, 2),
                'net' => round($sales - $refunds, 2),
            ];
        }

        $shifts = PosShift::query()
            ->with(['register.store', 'cashier'])
            ->whereBetween('opened_at', [$from, $to])
            ->when($registerId, fn ($query) => $query->where('pos_register_id', $registerId))
            ->when($storeId, function ($query) use ($storeId): void {
                $query->whereHas('register', fn ($register) => $register->where('store_id', $storeId));
            })
            ->latest('opened_at')
            ->get()
            ->map(fn (PosShift $shift) => $shift->toPosArray())
            ->values();

        return Inertia::render('admin/pos/reports', [
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'store_id' => $storeId,
                'register_id' => $registerId,
            ],
            'summary' => [
                'tickets' => $orders->count(),
                'gross' => round((float) $orders->sum('subtotal'), 2),
                'discounts' => round((float) $orders->sum('discount_amount'), 2),
                'tax' => round((float) $orders->sum('tax_amount'), 2),
                'sales' => round((float) $orders->sum('total'), 2),
                'refunds' => round((float) $orders->sum('refunded_amount'), 2),
                'net' => round((float) $orders->sum('total') - (float) $orders->sum('refunded_amount'), 2),
            ],
            'methods' => $methodBreakdown,
            'shifts' => $shifts,
            'stores' => Store::query()->orderBy('name')->get()->map(fn (Store $store) => [
                'id' => $store->id,
                'name' => $store->name,
            ])->values(),
            'registers' => PosRegister::query()
                ->with('store')
                ->orderBy('name')
                ->get()
                ->map(fn (PosRegister $register) => $register->toAdminArray())
                ->values(),
        ]);
    }

    private function date(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (Throwable) {
            return null;
        }
    }
}
