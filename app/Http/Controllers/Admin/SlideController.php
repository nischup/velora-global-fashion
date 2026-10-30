<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreHeroSlideRequest;
use App\Http\Requests\Admin\UpdateHeroSlideRequest;
use App\Models\HeroSlide;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SlideController extends Controller
{
    public function index(): Response
    {
        $slides = HeroSlide::query()
            ->with('product')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (HeroSlide $slide) => $slide->toAdminArray())
            ->values();

        return Inertia::render('admin/slides/index', [
            'slides' => $slides,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/slides/create', [
            'products' => $this->productOptions(),
            'next_sort_order' => (int) HeroSlide::query()->max('sort_order') + 1,
        ]);
    }

    public function store(StoreHeroSlideRequest $request): RedirectResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')?->store('hero-slides', 'public');
        }

        HeroSlide::query()->create($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Slide created.']);

        return to_route('admin.slides.index');
    }

    public function edit(HeroSlide $slide): Response
    {
        $slide->load('product');

        return Inertia::render('admin/slides/edit', [
            'slide' => $slide->toAdminArray(),
            'products' => $this->productOptions(),
        ]);
    }

    public function update(UpdateHeroSlideRequest $request, HeroSlide $slide): RedirectResponse
    {
        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            if ($slide->image) {
                Storage::disk('public')->delete($slide->image);
            }

            $data['image'] = $request->file('image')?->store('hero-slides', 'public');
        }

        $slide->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Slide updated.']);

        return to_route('admin.slides.index');
    }

    public function destroy(HeroSlide $slide): RedirectResponse
    {
        if ($slide->image) {
            Storage::disk('public')->delete($slide->image);
        }

        $slide->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Slide deleted.']);

        return to_route('admin.slides.index');
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function productOptions(): array
    {
        return Product::query()
            ->live()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'name' => $product->name,
            ])
            ->all();
    }
}
