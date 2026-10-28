<?php

namespace App\Models;

use App\Enums\ProductStatus;
use App\Models\Concerns\HasSlug;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $category_id
 * @property int|null $brand_id
 * @property string $name
 * @property string $slug
 * @property string|null $short_description
 * @property string|null $description
 * @property ProductStatus $status
 * @property bool $is_featured
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category $category
 * @property-read Brand|null $brand
 * @property-read Collection<int, ProductImage> $images
 * @property-read Collection<int, ProductVariant> $variants
 * @property-read ProductImage|null $primaryImage
 */
#[Fillable(['category_id', 'brand_id', 'name', 'slug', 'short_description', 'description', 'status', 'is_featured'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory, HasSlug;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProductStatus::class,
            'is_featured' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<Brand, $this>
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * @return HasMany<ProductImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /**
     * @return HasOne<ProductImage, $this>
     */
    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true)->orderBy('sort_order');
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * @param  Builder<Product>  $query
     */
    public function scopeLive(Builder $query): void
    {
        $query->where('status', ProductStatus::Live);
    }

    /**
     * @param  Builder<Product>  $query
     */
    public function scopeFeatured(Builder $query): void
    {
        $query->where('is_featured', true);
    }

    /**
     * @param  Builder<Product>  $query
     */
    public function scopeWithCardRelations(Builder $query): void
    {
        $query->with(['brand', 'category', 'primaryImage', 'images', 'variants']);
    }

    public function coverImageUrl(): ?string
    {
        $image = $this->primaryImage ?? $this->images->first();

        return $image?->url();
    }

    public function totalStock(): int
    {
        return (int) $this->variants->sum('stock');
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminListArray(): array
    {
        $variants = $this->variants;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'image_url' => $this->coverImageUrl(),
            'category' => $this->category->only(['id', 'name']),
            'brand' => $this->brand?->only(['id', 'name']),
            'variants_count' => $variants->count(),
            'total_stock' => (int) $variants->sum('stock'),
            'low_stock_count' => $variants->filter(fn (ProductVariant $variant) => $variant->isLowStock())->count(),
            'min_price' => $variants->min('price') !== null ? (float) $variants->min('price') : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorefrontCard(): array
    {
        $activeVariants = $this->variants->where('is_active', true);
        $prices = $activeVariants->map(fn (ProductVariant $variant) => (float) $variant->price);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'brand' => $this->brand?->only(['id', 'name', 'slug']),
            'category' => $this->category->only(['id', 'name', 'slug']),
            'image_url' => $this->coverImageUrl(),
            'min_price' => $prices->min() ?: 0,
            'max_price' => $prices->max() ?: 0,
            'in_stock' => $activeVariants->sum('stock') > 0,
            'is_featured' => $this->is_featured,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorefrontDetail(): array
    {
        $variants = $this->variants
            ->where('is_active', true)
            ->map(fn (ProductVariant $variant) => $variant->toStorefrontArray())
            ->values()
            ->all();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'brand' => $this->brand?->only(['id', 'name', 'slug']),
            'category' => $this->category->only(['id', 'name', 'slug']),
            'images' => $this->images->map(fn (ProductImage $image) => $image->toFrontendArray())->values()->all(),
            'variants' => $variants,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminFormArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'status' => $this->status->value,
            'is_featured' => $this->is_featured,
            'category_id' => $this->category_id,
            'brand_id' => $this->brand_id,
            'images' => $this->images->map(fn (ProductImage $image) => $image->toFrontendArray())->values()->all(),
            'variants' => $this->variants
                ->map(fn (ProductVariant $variant) => $variant->toAdminArray())
                ->values()
                ->all(),
        ];
    }
}
