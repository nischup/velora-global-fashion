<?php

namespace App\Models;

use App\Enums\ProductStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $description
 * @property string|null $eyebrow
 * @property string|null $image
 * @property int|null $product_id
 * @property int $sort_order
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Product|null $product
 */
#[Fillable(['title', 'description', 'eyebrow', 'image', 'product_id', 'sort_order', 'is_active'])]
class HeroSlide extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @param  Builder<HeroSlide>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    public function imageUrl(): ?string
    {
        return $this->image ? '/storage/'.$this->image : null;
    }

    /**
     * @return array<string, mixed>
     */
    public function toStorefrontArray(): array
    {
        $product = $this->product;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'image_url' => $this->imageUrl(),
            'slug' => $product instanceof Product && $product->status === ProductStatus::Live
                ? $product->slug
                : '',
            'brand' => $this->eyebrow,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'eyebrow' => $this->eyebrow,
            'image_url' => $this->imageUrl(),
            'product_id' => $this->product_id,
            'product_name' => $this->product?->name,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
        ];
    }
}
