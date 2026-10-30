<?php

namespace App\Services;

use App\Enums\PosShiftStatus;
use App\Models\PosRegister;
use App\Models\PosShift;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class PosShiftService
{
    /**
     * @param  array<string, mixed>  $payload
     *
     * @throws Throwable
     */
    public function open(User $cashier, array $payload): PosShift
    {
        return DB::transaction(function () use ($cashier, $payload): PosShift {
            $register = PosRegister::query()
                ->with('store')
                ->lockForUpdate()
                ->find($payload['register_id']);

            if (! $register instanceof PosRegister || ! $register->is_active || ! $register->store->is_active) {
                throw ValidationException::withMessages([
                    'register_id' => 'That register is not available.',
                ]);
            }

            if (PosShift::query()->open()->where('cashier_id', $cashier->id)->exists()) {
                throw ValidationException::withMessages([
                    'register_id' => 'Close your current shift before opening another.',
                ]);
            }

            if (PosShift::query()->open()->where('pos_register_id', $register->id)->exists()) {
                throw ValidationException::withMessages([
                    'register_id' => 'This register already has an open shift.',
                ]);
            }

            return PosShift::query()->create([
                'pos_register_id' => $register->id,
                'cashier_id' => $cashier->id,
                'status' => PosShiftStatus::Open,
                'opening_cash' => round((float) $payload['opening_cash'], 2),
                'opened_at' => now(),
            ])->load(['register.store', 'cashier']);
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     *
     * @throws Throwable
     */
    public function close(PosShift $shift, User $cashier, array $payload): PosShift
    {
        return DB::transaction(function () use ($shift, $cashier, $payload): PosShift {
            $shift = PosShift::query()->lockForUpdate()->findOrFail($shift->id);

            if ($shift->cashier_id !== $cashier->id || $shift->status !== PosShiftStatus::Open) {
                throw ValidationException::withMessages([
                    'shift' => 'Only the cashier who opened this shift can close it.',
                ]);
            }

            $expected = $shift->expectedCashInDrawer();
            $counted = round((float) $payload['counted_cash'], 2);

            $shift->update([
                'status' => PosShiftStatus::Closed,
                'expected_cash' => $expected,
                'counted_cash' => $counted,
                'difference' => round($counted - $expected, 2),
                'closed_at' => now(),
                'notes' => isset($payload['notes']) ? (string) $payload['notes'] : null,
            ]);

            return $shift->fresh(['register.store', 'cashier']) ?? $shift;
        });
    }

    public function current(User $cashier): ?PosShift
    {
        return PosShift::query()
            ->with(['register.store', 'cashier'])
            ->open()
            ->where('cashier_id', $cashier->id)
            ->first();
    }
}
