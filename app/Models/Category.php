<?php

namespace App\Models;

use App\Models\Concerns\HasSlug;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $parent_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property string|null $image
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Category|null $parent
 * @property-read Collection<int, Category> $children
 * @property-read Collection<int, Product> $products
 */
#[Fillable(['parent_id', 'name', 'slug', 'description', 'image', 'is_active', 'sort_order'])]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, HasSlug;

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
     * @return BelongsTo<Category, $this>
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    /**
     * @return HasMany<Category, $this>
     */
    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order')->orderBy('name');
    }

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @param  Builder<Category>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @param  Builder<Category>  $query
     */
    public function scopeRoots(Builder $query): void
    {
        $query->whereNull('parent_id');
    }

    /**
     * @return list<int>
     */
    public function selfAndChildrenIds(): array
    {
        $childIds = $this->children()
            ->pluck('id')
            ->map(fn (mixed $id): int => (int) $id)
            ->values()
            ->all();

        return [$this->id, ...$childIds];
    }

    /**
     * @return array<int, array{id: int, name: string, slug: string, depth: int}>
     */
    public static function optionsForSelect(): array
    {
        return static::query()
            ->with(['children' => fn ($query) => $query->orderBy('sort_order')->orderBy('name')])
            ->roots()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->flatMap(function (Category $category): array {
                $options = [[
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'depth' => 0,
                ]];

                foreach ($category->children as $child) {
                    $options[] = [
                        'id' => $child->id,
                        'name' => $child->name,
                        'slug' => $child->slug,
                        'depth' => 1,
                    ];
                }

                return $options;
            })
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'parent' => $this->parent?->only(['id', 'name']),
            'products_count' => $this->products_count ?? $this->products()->count(),
            'children_count' => $this->children_count ?? $this->children()->count(),
        ];
    }
}
