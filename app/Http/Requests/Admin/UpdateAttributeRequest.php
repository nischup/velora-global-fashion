<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use App\Models\ProductAttribute;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAttributeRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var ProductAttribute $attribute */
        $attribute = $this->route('attribute');

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('product_attributes', 'slug')->ignore($attribute)],
            'values' => ['required', 'array', 'min:1'],
            'values.*.id' => ['nullable', 'integer', 'exists:product_attribute_values,id'],
            'values.*.value' => ['required', 'string', 'max:255'],
            'values.*.hex_color' => ['nullable', 'string', 'max:7'],
            'values.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
