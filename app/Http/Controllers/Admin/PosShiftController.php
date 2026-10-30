<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ClosePosShiftRequest;
use App\Http\Requests\Admin\OpenPosShiftRequest;
use App\Models\PosShift;
use App\Models\User;
use App\Services\PosShiftService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PosShiftController extends Controller
{
    public function __construct(private readonly PosShiftService $shifts) {}

    public function store(OpenPosShiftRequest $request): RedirectResponse
    {
        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $this->shifts->open($cashier, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Shift opened. You can start selling.',
        ]);

        return to_route('admin.pos.index');
    }

    public function update(ClosePosShiftRequest $request, PosShift $shift): RedirectResponse
    {
        $cashier = $request->user();
        abort_unless($cashier instanceof User, 403);

        $closed = $this->shifts->close($shift, $cashier, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Shift closed. Difference ৳'.number_format((float) $closed->difference, 2).'.',
        ]);

        return to_route('admin.pos.reports.index', ['shift' => $closed->id]);
    }
}
