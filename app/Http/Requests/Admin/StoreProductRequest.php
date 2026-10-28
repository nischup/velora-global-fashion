<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductStatus;
use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:products,slug'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::enum(ProductStatus::class)],
            'is_featured' => ['sometimes', 'boolean'],
            'images' => ['nullable', 'array', 'max:8'],
            'images.*' => ['image', 'max:5120'],
            'variants' => ['required_if:status,live', 'array'],
            'variants.*.sku' => ['required_with:variants', 'string', 'max:100', 'distinct', 'unique:product_variants,sku'],
            'variants.*.price' => ['required_with:variants', 'numeric', 'min:0'],
            'variants.*.compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'variants.*.stock' => ['required_with:variants', 'integer', 'min:0'],
            'variants.*.low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'variants.*.is_active' => ['sometimes', 'boolean'],
            'variants.*.size_id' => ['required_with:variants', 'integer', 'exists:product_attribute_values,id'],
            'variants.*.color_id' => ['required_with:variants', 'integer', 'exists:product_attribute_values,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $variants = $this->collect('variants')
            ->filter(fn (mixed $variant): bool => filled(data_get($variant, 'sku')))
            ->values()
            ->all();

        $this->merge([
            'is_featured' => $this->boolean('is_featured'),
            'brand_id' => $this->filled('brand_id') ? $this->integer('brand_id') : null,
            'variants' => $variants,
        ]);
    }
}
