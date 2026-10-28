<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;

class StoreAttributeRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:product_attributes,slug'],
            'values' => ['required', 'array', 'min:1'],
            'values.*.value' => ['required', 'string', 'max:255'],
            'values.*.hex_color' => ['nullable', 'string', 'max:7'],
            'values.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
