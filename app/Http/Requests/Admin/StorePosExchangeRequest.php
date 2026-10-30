<?php

namespace App\Http\Requests\Admin;

use App\Enums\PaymentMethod;
use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePosExchangeRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'return_items' => ['required', 'array', 'min:1'],
            'return_items.*.order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'return_items.*.quantity' => ['required', 'integer', 'min:1'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.discount_type' => ['nullable', Rule::in(['none', 'amount', 'percent'])],
            'items.*.discount_value' => ['nullable', 'numeric', 'min:0'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'store_customer_id' => ['nullable', 'integer', 'exists:store_customers,id'],
            'discount_type' => ['required', Rule::in(['none', 'amount', 'percent'])],
            'discount_value' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['required_without:payments', 'nullable', Rule::enum(PaymentMethod::class)],
            'amount_tendered' => ['nullable', 'numeric', 'min:0'],
            'payments' => ['nullable', 'array', 'min:1'],
            'payments.*.method' => ['required', Rule::enum(PaymentMethod::class)],
            'payments.*.amount' => ['required', 'numeric', 'min:0.01'],
            'payments.*.amount_tendered' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'reason' => ['nullable', 'string', 'max:255'],
        ];
    }
}
