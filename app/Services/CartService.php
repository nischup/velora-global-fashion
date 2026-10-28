<?php

namespace App\Services;

use App\Enums\ProductStatus;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartService
{
    public const SESSION_KEY = 'cart';

    /**
     * @return array<int, int>
     */
    public function contents(Request $request): array
    {
        /** @var array<int|string, mixed> $cart */
        $cart = $request->session()->get(self::SESSION_KEY, []);
        $normalized = [];

        foreach ($cart as $variantId => $quantity) {
            $quantity = (int) $quantity;

            if ($quantity > 0) {
                $normalized[(int) $variantId] = $quantity;
            }
        }

        return $normalized;
    }

    public function count(Request $request): int
    {
        return array_sum($this->contents($request));
    }

    public function add(Request $request, ProductVariant $variant, int $quantity = 1): void
    {
        $this->assertPurchasable($variant);

        $contents = $this->contents($request);
        $nextQuantity = ($contents[$variant->id] ?? 0) + $quantity;

        if ($nextQuantity > $variant->stock) {
            throw ValidationException::withMessages([
                'quantity' => 'Only '.$variant->stock.' left in stock.',
            ]);
        }

        $contents[$variant->id] = $nextQuantity;
        $request->session()->put(self::SESSION_KEY, $contents);
    }

    public function update(Request $request, ProductVariant $variant, int $quantity): void
    {
        $contents = $this->contents($request);

        if ($quantity <= 0) {
            unset($contents[$variant->id]);
            $request->session()->put(self::SESSION_KEY, $contents);

            return;
        }

        $this->assertPurchasable($variant);

        if ($quantity > $variant->stock) {
            throw ValidationException::withMessages([
                'quantity' => 'Only '.$variant->stock.' left in stock.',
            ]);
        }

        $contents[$variant->id] = $quantity;
        $request->session()->put(self::SESSION_KEY, $contents);
    }

    public function remove(Request $request, int $variantId): void
    {
        $contents = $this->contents($request);
        unset($contents[$variantId]);
        $request->session()->put(self::SESSION_KEY, $contents);
    }

    public function clear(Request $request): void
    {
        $request->session()->forget(self::SESSION_KEY);
    }

    /**
     * @return array{items: list<array<string, mixed>>, count: int, subtotal: float}
     */
    public function summary(Request $request): array
    {
        $contents = $this->contents($request);

        if ($contents === []) {
            return [
                'items' => [],
                'count' => 0,
                'subtotal' => 0.0,
            ];
        }

        $variants = ProductVariant::query()
            ->with(['product.primaryImage', 'product.images', 'product.brand', 'attributeValues.attribute'])
            ->whereIn('id', array_keys($contents))
            ->get()
            ->keyBy('id');

        $items = [];
        $validContents = [];

        foreach ($contents as $variantId => $quantity) {
            $variant = $variants->get($variantId);

            if (! $variant instanceof ProductVariant || $variant->product->status !== ProductStatus::Live) {
                continue;
            }

            $validContents[$variantId] = $quantity;
            $price = (float) $variant->price;

            $items[] = [
                'variant_id' => $variant->id,
                'product_id' => $variant->product_id,
                'name' => $variant->product->name,
                'slug' => $variant->product->slug,
                'brand' => $variant->product->brand?->name,
                'sku' => $variant->sku,
                'options' => $variant->optionLabel(),
                'image_url' => $variant->product->coverImageUrl(),
                'price' => $price,
                'quantity' => $quantity,
                'stock' => $variant->stock,
                'in_stock' => $variant->inStock() && $quantity <= $variant->stock,
                'line_total' => $price * $quantity,
            ];
        }

        if ($validContents !== $contents) {
            $request->session()->put(self::SESSION_KEY, $validContents);
        }

        return [
            'items' => $items,
            'count' => array_sum($validContents),
            'subtotal' => (float) array_sum(array_column($items, 'line_total')),
        ];
    }

    private function assertPurchasable(ProductVariant $variant): void
    {
        $variant->loadMissing('product');

        if ($variant->product->status !== ProductStatus::Live || ! $variant->inStock()) {
            throw ValidationException::withMessages([
                'variant_id' => 'This item is no longer available.',
            ]);
        }
    }
}
