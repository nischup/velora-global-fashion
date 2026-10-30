<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use App\Models\Store;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStoreRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $store = $this->route('store');
        $storeId = $store instanceof Store ? $store->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:20', Rule::unique('stores', 'code')->ignore($storeId)],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'tax_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'code' => strtoupper((string) $this->input('code')),
        ]);
    }
}
