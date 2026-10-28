<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function index(): Response
    {
        $brands = Brand::query()
            ->withCount('products')
            ->orderBy('name')
            ->get()
            ->map(fn (Brand $brand) => $brand->toAdminArray())
            ->values();

        return Inertia::render('admin/brands/index', [
            'brands' => $brands,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    public function store(StoreBrandRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('logo');

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')?->store('brands', 'public');
        }

        Brand::query()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Brand created.']);

        return to_route('admin.brands.index');
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/edit', [
            'brand' => $brand->toAdminArray(),
        ]);
    }

    public function update(UpdateBrandRequest $request, Brand $brand): RedirectResponse
    {
        $data = $request->safe()->except('logo');

        if ($request->hasFile('logo')) {
            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }

            $data['logo'] = $request->file('logo')?->store('brands', 'public');
        }

        $brand->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Brand updated.']);

        return to_route('admin.brands.index');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'Remove this brand from products first.']);

            return back();
        }

        if ($brand->logo) {
            Storage::disk('public')->delete($brand->logo);
        }

        $brand->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Brand deleted.']);

        return to_route('admin.brands.index');
    }
}
