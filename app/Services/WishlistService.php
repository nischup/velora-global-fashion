<?php

namespace App\Services;

use App\Enums\ProductStatus;
use App\Models\Product;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class WishlistService
{
    public const SESSION_KEY = 'wishlist';

    /**
     * @return list<int>
     */
    public function ids(Request $request): array
    {
        $user = $request->user();

        if ($user instanceof User) {
            $this->mergeSession($request, $user);

            return array_values(WishlistItem::query()
                ->where('user_id', $user->id)
                ->pluck('product_id')
                ->map(fn (mixed $id): int => (int) $id)
                ->all());
        }

        return $this->sessionIds($request);
    }

    public function count(Request $request): int
    {
        return count($this->ids($request));
    }

    public function toggle(Request $request, Product $product): bool
    {
        abort_unless($product->status === ProductStatus::Live, 404);

        $user = $request->user();

        if ($user instanceof User) {
            $item = WishlistItem::query()->firstWhere([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);

            if ($item) {
                $item->delete();

                return false;
            }

            WishlistItem::query()->create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);

            return true;
        }

        $ids = $this->sessionIds($request);

        if (in_array($product->id, $ids, true)) {
            $request->session()->put(self::SESSION_KEY, array_values(array_diff($ids, [$product->id])));

            return false;
        }

        $ids[] = $product->id;
        $request->session()->put(self::SESSION_KEY, array_values(array_unique($ids)));

        return true;
    }

    public function remove(Request $request, Product $product): void
    {
        $user = $request->user();

        if ($user instanceof User) {
            WishlistItem::query()
                ->where('user_id', $user->id)
                ->where('product_id', $product->id)
                ->delete();

            return;
        }

        $request->session()->put(
            self::SESSION_KEY,
            array_values(array_diff($this->sessionIds($request), [$product->id])),
        );
    }

    /**
     * @return Collection<int, Product>
     */
    public function products(Request $request): Collection
    {
        $ids = $this->ids($request);

        if ($ids === []) {
            return collect();
        }

        return Product::query()
            ->live()
            ->withCardRelations()
            ->whereIn('id', $ids)
            ->get()
            ->sortBy(fn (Product $product) => array_search($product->id, $ids, true))
            ->values();
    }

    public function mergeSession(Request $request, User $user): void
    {
        $sessionIds = $this->sessionIds($request);

        if ($sessionIds === []) {
            return;
        }

        $existing = WishlistItem::query()
            ->where('user_id', $user->id)
            ->pluck('product_id')
            ->all();

        $liveIds = Product::query()
            ->live()
            ->whereIn('id', $sessionIds)
            ->pluck('id')
            ->all();

        foreach ($liveIds as $productId) {
            if (! in_array($productId, $existing, true)) {
                WishlistItem::query()->create([
                    'user_id' => $user->id,
                    'product_id' => $productId,
                ]);
            }
        }

        $request->session()->forget(self::SESSION_KEY);
    }

    /**
     * @return list<int>
     */
    private function sessionIds(Request $request): array
    {
        /** @var array<int, mixed> $ids */
        $ids = $request->session()->get(self::SESSION_KEY, []);

        return array_values(array_unique(array_map('intval', $ids)));
    }
}
