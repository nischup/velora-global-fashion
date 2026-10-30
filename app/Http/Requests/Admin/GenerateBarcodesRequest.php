<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;

class GenerateBarcodesRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'variant_ids' => ['nullable', 'array'],
            'variant_ids.*' => ['integer', 'exists:product_variants,id'],
        ];
    }
}
