<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePosRegisterRequest;
use App\Http\Requests\Admin\UpdatePosRegisterRequest;
use App\Models\PosRegister;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class PosRegisterController extends Controller
{
    public function store(StorePosRegisterRequest $request, Store $store): RedirectResponse
    {
        $store->registers()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Register added.']);

        return to_route('admin.stores.edit', $store);
    }

    public function update(UpdatePosRegisterRequest $request, PosRegister $register): RedirectResponse
    {
        $register->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Register updated.']);

        return to_route('admin.stores.edit', $register->store_id);
    }

    public function destroy(PosRegister $register): RedirectResponse
    {
        if ($register->shifts()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This register has shifts. Hide it instead of deleting.',
            ]);

            return back();
        }

        $storeId = $register->store_id;
        $register->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Register deleted.']);

        return to_route('admin.stores.edit', $storeId);
    }
}
