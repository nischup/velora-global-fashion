<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featuredProducts = Product::query()
            ->live()
            ->featured()
            ->withCardRelations()
            ->latest()
            ->limit(8)
            ->get();

        $latestProducts = Product::query()
            ->live()
            ->withCardRelations()
            ->latest()
            ->limit(8)
            ->get();

        $slideSource = $featuredProducts->isNotEmpty()
            ? $featuredProducts
            : $latestProducts;

        $slides = $slideSource
            ->take(5)
            ->map(fn (Product $product) => [
                'id' => $product->id,
                'title' => $product->name,
                'description' => $product->short_description,
                'image_url' => $product->coverImageUrl(),
                'slug' => $product->slug,
                'brand' => $product->brand?->name,
            ])
            ->values();

        $featured = $featuredProducts
            ->map(fn (Product $product) => $product->toStorefrontCard())
            ->values();

        $latest = $latestProducts
            ->map(fn (Product $product) => $product->toStorefrontCard())
            ->values();

        $categories = Category::query()
            ->active()
            ->roots()
            ->with(['children' => fn ($query) => $query->active()->orderBy('sort_order')->orderBy('name')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'children' => $category->children->map->only(['id', 'name', 'slug'])->values()->all(),
            ])
            ->values();

        return Inertia::render('shop/home', [
            'featured' => $featured,
            'latest' => $latest,
            'categories' => $categories,
            'slides' => $slides,
        ]);
    }
}
