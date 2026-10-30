<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string|null $address
 * @property string|null $phone
 * @property numeric-string $tax_rate
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, PosRegister> $registers
 * @property-read Collection<int, Order> $orders
 */
#[Fillable(['name', 'code', 'address', 'phone', 'tax_rate', 'is_active'])]
class Store extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tax_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return HasMany<PosRegister, $this>
     */
    public function registers(): HasMany
    {
        return $this->hasMany(PosRegister::class);
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * @param  Builder<Store>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * @return array<string, mixed>
     */
    public function toAdminArray(bool $withRegisters = false): array
    {
        $payload = [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'phone' => $this->phone,
            'tax_rate' => (float) $this->tax_rate,
            'is_active' => $this->is_active,
            'registers_count' => $this->registers_count ?? $this->registers()->count(),
        ];

        if ($withRegisters) {
            $payload['registers'] = $this->registers
                ->map(fn (PosRegister $register) => $register->toAdminArray())
                ->values()
                ->all();
        }

        return $payload;
    }
}
