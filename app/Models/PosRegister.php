<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $store_id
 * @property string $name
 * @property string $code
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Store $store
 * @property-read Collection<int, PosShift> $shifts
 */
#[Fillable(['store_id', 'name', 'code', 'is_active'])]
class PosRegister extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Store, $this>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * @return HasMany<PosShift, $this>
     */
    public function shifts(): HasMany
    {
        return $this->hasMany(PosShift::class);
    }

    /**
     * @param  Builder<PosRegister>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(): array
    {
        $store = $this->store;

        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'name' => $this->name,
            'code' => $this->code,
            'is_active' => $this->is_active,
            'store_name' => $store->name,
            'store_code' => $store->code,
            'tax_rate' => (float) $store->tax_rate,
            'label' => $store->name.' · '.$this->name,
        ];
    }
}
