<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @phpstan-require-extends Model
 *
 * @property string|null $slug
 * @property string|null $name
 */
trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::saving(function (Model $model): void {
            $slug = $model->getAttribute('slug');

            if (filled($slug)) {
                $model->setAttribute('slug', Str::slug((string) $slug));

                return;
            }

            $source = $model->getAttribute('name') ?? $model->getAttribute('value');

            if (blank($source)) {
                return;
            }

            $model->setAttribute('slug', static::uniqueSlug((string) $source, $model->getKey()));
        });
    }

    public static function uniqueSlug(string $source, int|string|null $ignoreId = null): string
    {
        $base = Str::slug($source) ?: 'item';
        $slug = $base;
        $i = 1;

        while (static::query()
            ->where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
