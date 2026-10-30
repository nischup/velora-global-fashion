<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Contracts\Support\Responsable;
use Laravel\Fortify\Fortify;
use Symfony\Component\HttpFoundation\Response;

class IntendedFortifyRedirect implements Responsable
{
    public function __construct(public string $name) {}

    public function toResponse($request): Response
    {
        $path = Fortify::redirects($this->name);

        if ($this->name === 'email-verification' && $request->user() instanceof User) {
            $path = $request->user()->homePath();
        }

        return redirect()->intended($path);
    }
}
