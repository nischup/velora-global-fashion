<?php

namespace App\Enums;

enum PaymentType: string
{
    case Sale = 'sale';
    case Refund = 'refund';

    public function label(): string
    {
        return match ($this) {
            self::Sale => 'Sale',
            self::Refund => 'Refund',
        };
    }
}
