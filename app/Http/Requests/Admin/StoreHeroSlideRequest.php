<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;

class StoreHeroSlideRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['sometimes', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $productId = $this->input('product_id');

        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'product_id' => $productId === '' || $productId === null ? null : $productId,
            'sort_order' => $this->input('sort_order') === '' || $this->input('sort_order') === null
                ? 0
                : $this->input('sort_order'),
        ]);
    }
}
