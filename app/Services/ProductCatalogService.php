<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductCatalogService
{
    public function __construct(private readonly BarcodeService $barcodes) {}

    /**
     * @param  UploadedFile|array<int, UploadedFile>|null  $images
     * @return array<int, UploadedFile>
     */
    public static function normalizeImages(UploadedFile|array|null $images): array
    {
        if ($images instanceof UploadedFile) {
            return [$images];
        }

        return $images ?? [];
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  array<int, UploadedFile>  $images
     */
    public function create(array $data, array $images = []): Product
    {
        return DB::transaction(function () use ($data, $images): Product {
            $product = Product::query()->create($this->productAttributes($data));

            $this->storeImages($product, $images);
            $this->syncVariants($product, $data['variants'] ?? []);

            return $product->fresh(['images', 'variants.attributeValues.attribute']) ?? $product;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Product $product, array $data): Product
    {
        $product->update($this->productAttributes($data));

        return $product->refresh();
    }

    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product): void {
            foreach ($product->images as $image) {
                $this->deleteImageFile($image);
            }

            $product->delete();
        });
    }

    /**
     * @param  array<int, UploadedFile>  $images
     */
    public function addImages(Product $product, array $images): void
    {
        $this->storeImages($product, $images, $product->images()->count());
    }

    public function deleteImage(Product $product, ProductImage $image): void
    {
        abort_unless($image->product_id === $product->id, 404);

        $wasPrimary = $image->is_primary;
        $this->deleteImageFile($image);
        $image->delete();

        if ($wasPrimary) {
            $product->images()->first()?->update(['is_primary' => true]);
        }
    }

    public function makePrimary(Product $product, ProductImage $image): void
    {
        abort_unless($image->product_id === $product->id, 404);

        $product->images()->update(['is_primary' => false]);
        $image->update(['is_primary' => true]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createVariant(Product $product, array $data): ProductVariant
    {
        $data = $this->resolveVariantCodes($data);
        $attributeValueIds = $this->normalizedAttributeIds($data);

        $this->assertUniqueSku((string) $data['sku']);
        $this->assertUniqueBarcode($data['barcode'] ?? null);
        $this->assertUniqueAttributeCombination($product, $attributeValueIds);

        return DB::transaction(function () use ($product, $data, $attributeValueIds): ProductVariant {
            $variant = $product->variants()->create($this->variantAttributes($data));
            $variant->attributeValues()->sync($attributeValueIds);

            return $variant;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateVariant(Product $product, ProductVariant $variant, array $data): ProductVariant
    {
        abort_unless($variant->product_id === $product->id, 404);

        $data = $this->resolveVariantCodes($data, $variant);
        $attributeValueIds = $this->normalizedAttributeIds($data);

        $this->assertUniqueSku((string) $data['sku'], $variant->id);
        $this->assertUniqueBarcode($data['barcode'] ?? null, $variant->id);
        $this->assertUniqueAttributeCombination($product, $attributeValueIds, $variant->id);

        $variant->update($this->variantAttributes($data));
        $variant->attributeValues()->sync($attributeValueIds);

        return $variant->refresh();
    }

    public function updateStock(Product $product, ProductVariant $variant, int $stock): ProductVariant
    {
        abort_unless($variant->product_id === $product->id, 404);

        $variant->update(['stock' => $stock]);

        return $variant->refresh();
    }

    public function deleteVariant(Product $product, ProductVariant $variant): void
    {
        abort_unless($variant->product_id === $product->id, 404);

        $variant->delete();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function productAttributes(array $data): array
    {
        return [
            'category_id' => $data['category_id'],
            'brand_id' => $data['brand_id'] ?? null,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? null,
            'short_description' => $data['short_description'] ?? null,
            'description' => $data['description'] ?? null,
            'status' => $data['status'],
            'is_featured' => (bool) ($data['is_featured'] ?? false),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolveVariantCodes(array $data, ?ProductVariant $existing = null): array
    {
        $data['sku'] = filled($data['sku'] ?? null)
            ? (string) $data['sku']
            : ($existing?->sku ?: $this->generateUniqueSku());
        $data['barcode'] = filled($data['barcode'] ?? null)
            ? (string) $data['barcode']
            : ($existing?->barcode ?: $this->barcodes->generateUnique());

        return $data;
    }

    private function generateUniqueSku(): string
    {
        do {
            $sku = 'VEL-'.strtoupper(Str::random(8));
        } while (ProductVariant::query()->where('sku', $sku)->exists());

        return $sku;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function variantAttributes(array $data): array
    {
        $data = $this->resolveVariantCodes($data);

        return [
            'sku' => $data['sku'],
            'barcode' => $data['barcode'],
            'price' => $data['price'],
            'compare_at_price' => $data['compare_at_price'] ?? null,
            'stock' => $data['stock'],
            'low_stock_threshold' => $data['low_stock_threshold'] ?? 5,
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
        ];
    }

    /**
     * @param  array<int, UploadedFile>  $images
     */
    private function storeImages(Product $product, array $images, int $startOrder = 0): void
    {
        $hasPrimary = $product->images()->where('is_primary', true)->exists();

        foreach (array_values($images) as $index => $image) {
            $path = $image->store('products', 'public');

            $product->images()->create([
                'path' => $path,
                'alt' => $product->name,
                'sort_order' => $startOrder + $index,
                'is_primary' => ! $hasPrimary && $index === 0,
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        foreach ($variants as $variantData) {
            if (
                blank($variantData['sku'] ?? null)
                && blank($variantData['price'] ?? null)
                && blank($variantData['size_id'] ?? null)
                && blank($variantData['color_id'] ?? null)
            ) {
                continue;
            }

            $this->createVariant($product, $variantData);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     * @return list<int>
     */
    private function normalizedAttributeIds(array $data): array
    {
        $ids = array_filter([
            isset($data['size_id']) ? (int) $data['size_id'] : null,
            isset($data['color_id']) ? (int) $data['color_id'] : null,
            ...array_map('intval', $data['attribute_value_ids'] ?? []),
        ]);

        $ids = array_values(array_unique($ids));
        sort($ids);

        return $ids;
    }

    /**
     * @param  list<int>  $attributeValueIds
     */
    private function assertUniqueAttributeCombination(Product $product, array $attributeValueIds, ?int $ignoreVariantId = null): void
    {
        if ($attributeValueIds === []) {
            throw ValidationException::withMessages([
                'attribute_value_ids' => 'Choose a size and color for this variant.',
            ]);
        }

        $exists = $product->variants()
            ->when($ignoreVariantId, fn ($query) => $query->whereKeyNot($ignoreVariantId))
            ->with('attributeValues')
            ->get()
            ->contains(function (ProductVariant $variant) use ($attributeValueIds): bool {
                $ids = $variant->attributeValues->pluck('id')->map(fn ($id) => (int) $id)->sort()->values()->all();

                return $ids === $attributeValueIds;
            });

        if ($exists) {
            throw ValidationException::withMessages([
                'attribute_value_ids' => 'A variant with this size and color already exists.',
            ]);
        }
    }

    private function assertUniqueBarcode(mixed $barcode, ?int $ignoreVariantId = null): void
    {
        if (blank($barcode)) {
            return;
        }

        $exists = ProductVariant::query()
            ->where('barcode', (string) $barcode)
            ->when($ignoreVariantId, fn ($query) => $query->whereKeyNot($ignoreVariantId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'barcode' => 'This barcode is already in use.',
            ]);
        }
    }

    private function assertUniqueSku(string $sku, ?int $ignoreVariantId = null): void
    {
        $exists = ProductVariant::query()
            ->where('sku', $sku)
            ->when($ignoreVariantId, fn ($query) => $query->whereKeyNot($ignoreVariantId))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'sku' => 'This SKU is already in use.',
            ]);
        }
    }

    private function deleteImageFile(ProductImage $image): void
    {
        if (filled($image->path) && Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }
    }
}
