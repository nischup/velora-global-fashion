<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Staff = 'staff';
    case Customer = 'customer';

    public function canManageCatalog(): bool
    {
        return $this === self::Admin || $this === self::Staff;
    }
}
