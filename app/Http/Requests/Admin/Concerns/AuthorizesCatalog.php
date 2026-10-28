<?php

namespace App\Http\Requests\Admin\Concerns;

trait AuthorizesCatalog
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-catalog') ?? false;
    }
}
