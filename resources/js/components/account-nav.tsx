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
        <nav className="flex flex-wrap items-center gap-2 border-b border-velora-gold/30 pb-4 text-xs tracking-[0.18em] uppercase">
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
                            'rounded-full px-4 py-2 text-velora-forest/70 transition-colors hover:bg-velora-green/8 hover:text-velora-green',
                            active &&
                                'bg-velora-green text-velora-cream hover:bg-velora-forest hover:text-velora-cream',
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
                className="ml-auto rounded-full px-4 py-2 text-velora-forest/70 transition-colors hover:bg-velora-gold/20 hover:text-velora-green"
            >
                Log out
            </Link>
        </nav>
    );
}
