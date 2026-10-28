<?php

namespace App\Models;

use Database\Factories\ProductAttributeValueFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property int $product_attribute_id
 * @property string $value
 * @property string $slug
 * @property string|null $hex_color
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ProductAttribute $attribute
 */
#[Fillable(['product_attribute_id', 'value', 'slug', 'hex_color', 'sort_order'])]
class ProductAttributeValue extends Model
{
    /** @use HasFactory<ProductAttributeValueFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (ProductAttributeValue $value): void {
            if (blank($value->slug) && filled($value->value)) {
                $value->slug = Str::slug($value->value) ?: 'value';
            }
        });
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<ProductAttribute, $this>
     */
    public function attribute(): BelongsTo
    {
        return $this->belongsTo(ProductAttribute::class, 'product_attribute_id');
    }

    /**
     * @return BelongsToMany<ProductVariant, $this>
     */
    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductVariant::class,
            'product_variant_attribute_values',
            'attribute_value_id',
            'product_variant_id',
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'product_attribute_id' => $this->product_attribute_id,
            'value' => $this->value,
            'slug' => $this->slug,
            'hex_color' => $this->hex_color,
            'sort_order' => $this->sort_order,
        ];
    }
}
