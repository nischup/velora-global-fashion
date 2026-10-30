<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductVariantRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'sku' => ['nullable', 'string', 'max:100', 'unique:product_variants,sku'],
            'barcode' => ['nullable', 'string', 'max:64', 'unique:product_variants,barcode'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'size_id' => ['required', 'integer', 'exists:product_attribute_values,id'],
            'color_id' => ['required', 'integer', 'exists:product_attribute_values,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
        ]);
    }
}
