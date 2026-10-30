<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkUpdateOrdersRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'order_ids' => ['required', 'array', 'min:1'],
            'order_ids.*' => ['required', 'integer', 'exists:orders,id'],
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ];
    }
}
