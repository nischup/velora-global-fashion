<?php

namespace App\Services;

use App\Models\ProductVariant;
use App\Support\Code128;
use Illuminate\Support\Collection;

class BarcodeService
{
    private ?int $nextSequence = null;

    public function generateUnique(): string
    {
        do {
            $code = $this->nextCode();
        } while (ProductVariant::query()->where('barcode', $code)->exists());

        return $code;
    }

    /**
     * @param  Collection<int, ProductVariant>|iterable<ProductVariant>  $variants
     */
    public function assignMissing(iterable $variants): int
    {
        $assigned = 0;

        foreach ($variants as $variant) {
            if (filled($variant->barcode)) {
                continue;
            }

            $variant->update(['barcode' => $this->generateUnique()]);
            $assigned++;
        }

        return $assigned;
    }

    public function svg(string $code): string
    {
        return Code128::svg($code);
    }

    private function nextCode(): string
    {
        if ($this->nextSequence === null) {
            $this->nextSequence = $this->highestSequence() + 1;
        }

        $sequence = $this->nextSequence;
        $this->nextSequence++;

        return '890'.str_pad((string) $sequence, 10, '0', STR_PAD_LEFT);
    }

    private function highestSequence(): int
    {
        return (int) ProductVariant::query()
            ->whereNotNull('barcode')
            ->pluck('barcode')
            ->filter(fn (mixed $code): bool => is_string($code) && preg_match('/^890\d{10}$/', $code) === 1)
            ->map(fn (string $code): int => (int) substr($code, 3))
            ->max();
    }
}
