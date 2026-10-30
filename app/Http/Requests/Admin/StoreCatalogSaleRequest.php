<?php

namespace App\Http\Requests\Admin;

use App\Enums\CatalogSaleScope;
use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCatalogSaleRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'percent' => ['required', 'integer', 'min:1', 'max:90'],
            'applies_to' => ['required', Rule::enum(CatalogSaleScope::class)],
            'product_ids' => ['required_if:applies_to,selected', 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_ids.required_if' => 'Choose at least one product for a selected-item sale.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'product_ids' => $this->collect('product_ids')->filter()->map(fn (mixed $id): int => (int) $id)->values()->all(),
            'starts_at' => $this->filled('starts_at') ? $this->string('starts_at')->toString() : null,
            'ends_at' => $this->filled('ends_at') ? $this->string('ends_at')->toString() : null,
        ]);
    }
}
