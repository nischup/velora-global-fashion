<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAttributeRequest;
use App\Http\Requests\Admin\UpdateAttributeRequest;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AttributeController extends Controller
{
    public function index(): Response
    {
        $attributes = ProductAttribute::query()
            ->with('values')
            ->orderBy('name')
            ->get()
            ->map(fn (ProductAttribute $attribute) => $attribute->toAdminArray())
            ->values();

        return Inertia::render('admin/attributes/index', [
            'attributes' => $attributes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/attributes/create');
    }

    public function store(StoreAttributeRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request): void {
            $attribute = ProductAttribute::query()->create($request->safe()->only(['name', 'slug']));

            foreach ($request->validated('values') as $index => $value) {
                $attribute->values()->create([
                    'value' => $value['value'],
                    'hex_color' => $value['hex_color'] ?? null,
                    'sort_order' => $value['sort_order'] ?? $index,
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Attribute created.']);

        return to_route('admin.attributes.index');
    }

    public function edit(ProductAttribute $attribute): Response
    {
        $attribute->load('values');

        return Inertia::render('admin/attributes/edit', [
            'attribute' => $attribute->toAdminArray(),
        ]);
    }

    public function update(UpdateAttributeRequest $request, ProductAttribute $attribute): RedirectResponse
    {
        DB::transaction(function () use ($request, $attribute): void {
            $attribute->update($request->safe()->only(['name', 'slug']));

            $incoming = $request->collect('values');
            $keepIds = $incoming->pluck('id')->filter()->all();

            $attribute->values()
                ->whereNotIn('id', $keepIds)
                ->get()
                ->each(function (ProductAttributeValue $value): void {
                    if ($value->variants()->exists()) {
                        return;
                    }

                    $value->delete();
                });

            foreach ($incoming->values() as $index => $valueData) {
                if (! is_array($valueData) || ! isset($valueData['value'])) {
                    continue;
                }

                $payload = [
                    'value' => $valueData['value'],
                    'hex_color' => $valueData['hex_color'] ?? null,
                    'sort_order' => $valueData['sort_order'] ?? $index,
                ];

                if (! empty($valueData['id'])) {
                    $attribute->values()->whereKey($valueData['id'])->update($payload);

                    continue;
                }

                $attribute->values()->create($payload);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Attribute updated.']);

        return to_route('admin.attributes.index');
    }

    public function destroy(ProductAttribute $attribute): RedirectResponse
    {
        $inUse = $attribute->values()->whereHas('variants')->exists();

        if ($inUse) {
            Inertia::flash('toast', ['type' => 'error', 'message' => 'This attribute is used by product variants.']);

            return back();
        }

        $attribute->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Attribute deleted.']);

        return to_route('admin.attributes.index');
    }
}
