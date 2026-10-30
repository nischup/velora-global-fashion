<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\AuthorizesCatalog;
use Illuminate\Foundation\Http\FormRequest;

class OpenPosShiftRequest extends FormRequest
{
    use AuthorizesCatalog;

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'register_id' => ['required', 'integer', 'exists:pos_registers,id'],
            'opening_cash' => ['required', 'numeric', 'min:0'],
        ];
    }
}
