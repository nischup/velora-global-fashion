<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderSource;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreOrderReturnRequest;
use App\Models\Order;
use App\Models\User;
use App\Services\PosSaleService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class OrderReturnController extends Controller
{
    public function __construct(private readonly PosSaleService $sales) {}

    public function store(StoreOrderReturnRequest $request, Order $order): RedirectResponse
    {
        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $return = $this->sales->processReturn($order, $cashier, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Return recorded. Refund ৳'.number_format((float) $return->refund_amount, 2).'.',
        ]);

        if ($request->boolean('from_returns')) {
            return to_route('admin.returns.show', $order);
        }

        if ($order->source === OrderSource::Pos && $request->boolean('from_pos')) {
            return to_route('admin.pos.receipt', $order);
        }

        return to_route('admin.orders.show', $order);
    }
}
