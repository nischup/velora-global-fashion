<?php

namespace App\Http\Requests\Admin;

use App\Enums\PaymentMethod;
use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderReturnRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'refund_method' => ['required', Rule::enum(PaymentMethod::class)],
            'reason' => ['nullable', 'string', 'max:255'],
            'from_pos' => ['nullable', 'boolean'],
            'from_returns' => ['nullable', 'boolean'],
        ];
    }
}
