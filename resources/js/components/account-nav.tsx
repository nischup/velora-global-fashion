import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';
import { index as accountIndex } from '@/routes/account';
import { index as accountOrders } from '@/routes/account/orders';
import { edit as editProfile } from '@/routes/profile';
import { index as wishlistIndex } from '@/routes/wishlist';

const links = [
    { title: 'Overview', href: accountIndex() },
    { title: 'Orders', href: accountOrders() },
    { title: 'Wishlist', href: wishlistIndex() },
    { title: 'Settings', href: editProfile() },
];

export function AccountNav() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <nav className="flex flex-wrap items-center gap-2 border-b pb-4 text-xs tracking-[0.18em] uppercase">
            {links.map((link) => {
                const active =
                    link.title === 'Overview'
                        ? isCurrentUrl(link.href)
                        : isCurrentOrParentUrl(link.href);

                return (
                    <Link
                        key={link.title}
                        href={link.href}
                        className={cn(
                            'px-3 py-2 hover:bg-muted',
                            active && 'bg-neutral-950 text-white',
                        )}
                    >
                        {link.title}
                    </Link>
                );
            })}
            <Link
                href={logout()}
                method="post"
                as="button"
                className="ml-auto px-3 py-2 hover:bg-muted"
            >
                Log out
            </Link>
        </nav>
    );
}
