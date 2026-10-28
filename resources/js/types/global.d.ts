import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            storefront: {
                categories: { id: number; name: string; slug: string }[];
                cart_count: number;
                wishlist_count: number;
                wishlist_ids: number[];
            };
            [key: string]: unknown;
        };
    }
}
