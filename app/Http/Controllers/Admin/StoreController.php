<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStoreRequest;
use App\Http\Requests\Admin\UpdateStoreRequest;
use App\Models\Store;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public function index(): Response
    {
        $stores = Store::query()
            ->with(['registers'])
            ->withCount('registers')
            ->orderBy('name')
            ->get()
            ->map(fn (Store $store) => $store->toAdminArray(withRegisters: true))
            ->values();

        return Inertia::render('admin/stores/index', [
            'stores' => $stores,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/stores/create');
    }

    public function store(StoreStoreRequest $request): RedirectResponse
    {
        $store = Store::query()->create($request->validated());

        $store->registers()->create([
            'name' => 'Counter 1',
            'code' => $store->code.'-1',
            'is_active' => true,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Store created with Counter 1.']);

        return to_route('admin.stores.edit', $store);
    }

    public function edit(Store $store): Response
    {
        $store->load('registers');

        return Inertia::render('admin/stores/edit', [
            'store' => $store->toAdminArray(withRegisters: true),
        ]);
    }

    public function update(UpdateStoreRequest $request, Store $store): RedirectResponse
    {
        $store->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Store updated.']);

        return to_route('admin.stores.edit', $store);
    }

    public function destroy(Store $store): RedirectResponse
    {
        if ($store->orders()->exists() || $store->registers()->whereHas('shifts')->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => 'This store has sales or shifts. Hide it instead of deleting.',
            ]);

            return back();
        }

        $store->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Store deleted.']);

        return to_route('admin.stores.index');
    }
}
