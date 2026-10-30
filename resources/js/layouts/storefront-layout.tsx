import { Link, usePage } from '@inertiajs/react';
import { Heart, Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { canManageCatalog } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { index as accountIndex } from '@/routes/account';
import { index as cartIndex } from '@/routes/cart';
import { dashboard, home, login } from '@/routes';
import { register } from '@/routes';
import { index as shopIndex, category as shopCategory } from '@/routes/shop';
import { index as wishlistIndex } from '@/routes/wishlist';

export default function StorefrontLayout({ children }: PropsWithChildren) {
    const { auth, name, storefront } = usePage().props;
    const categories = storefront?.categories ?? [];
    const cartCount = storefront?.cart_count ?? 0;
    const wishlistCount = storefront?.wishlist_count ?? 0;
    const activeSale = storefront?.active_sale ?? null;

    return (
        <div className="flex min-h-screen flex-col bg-velora-cream text-velora-green">
            {activeSale && (
                <div className="bg-velora-green px-4 py-2 text-center text-[11px] tracking-[0.22em] text-velora-cream uppercase">
                    {activeSale.name} — {activeSale.percent}% off{' '}
                    {activeSale.applies_to === 'all'
                        ? 'everything'
                        : 'selected pieces'}
                </div>
            )}
            <header className="sticky top-0 z-40 border-b border-velora-gold/30 bg-velora-cream/95 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-2 lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-velora-green hover:bg-velora-gold/15 hover:text-velora-green"
                                >
                                    <Menu className="size-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-72 border-velora-gold/25 bg-velora-cream text-velora-green"
                            >
                                <SheetHeader>
                                    <SheetTitle className="text-velora-green">
                                        {name}
                                    </SheetTitle>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col gap-4 text-sm tracking-[0.18em] text-velora-forest uppercase">
                                    <Link
                                        href={shopIndex()}
                                        className="hover:text-velora-gold"
                                    >
                                        Shop
                                    </Link>
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={shopCategory(category.slug)}
                                            className="hover:text-velora-gold"
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                    <Link
                                        href={wishlistIndex()}
                                        className="hover:text-velora-gold"
                                    >
                                        Wishlist
                                    </Link>
                                    <Link
                                        href={cartIndex()}
                                        className="hover:text-velora-gold"
                                    >
                                        Bag
                                    </Link>
                                    {auth.user &&
                                        !canManageCatalog(auth.user) && (
                                            <Link
                                                href={accountIndex()}
                                                className="hover:text-velora-gold"
                                            >
                                                My account
                                            </Link>
                                        )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={home()}
                        className="flex items-center gap-2.5 font-medium tracking-[0.28em] text-velora-green uppercase"
                    >
                        <span className="size-9 overflow-hidden rounded-full border border-velora-gold/40 bg-velora-ivory">
                            <img
                                src="/images/logo.png"
                                alt=""
                                className="size-full scale-110 object-cover"
                            />
                        </span>
                        {name}
                    </Link>

                    <nav className="hidden items-center gap-8 text-xs tracking-[0.22em] text-velora-forest uppercase lg:flex">
                        <Link
                            href={shopIndex()}
                            className="hover:text-velora-gold"
                        >
                            Shop
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={shopCategory(category.slug)}
                                className="hover:text-velora-gold"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-velora-green hover:bg-velora-gold/15 hover:text-velora-green"
                            asChild
                        >
                            <Link href={shopIndex()}>
                                <Search className="size-4" />
                                <span className="sr-only">Search</span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-velora-green hover:bg-velora-gold/15 hover:text-velora-green"
                            asChild
                        >
                            <Link href={wishlistIndex()} className="relative">
                                <Heart className="size-4" />
                                <CountBadge count={wishlistCount} />
                                <span className="sr-only">Wishlist</span>
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-velora-green hover:bg-velora-gold/15 hover:text-velora-green"
                            asChild
                        >
                            <Link href={cartIndex()} className="relative">
                                <ShoppingBag className="size-4" />
                                <CountBadge count={cartCount} />
                                <span className="sr-only">Shopping bag</span>
                            </Link>
                        </Button>
                        {auth.user ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-velora-green hover:bg-velora-gold/15 hover:text-velora-green"
                                asChild
                            >
                                <Link
                                    href={
                                        canManageCatalog(auth.user)
                                            ? dashboard()
                                            : accountIndex()
                                    }
                                >
                                    <UserRound className="size-4" />
                                    <span className="sr-only">Account</span>
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-velora-green hover:bg-velora-gold/15 hover:text-velora-green"
                                asChild
                            >
                                <Link href={login()}>Log in</Link>
                            </Button>
                        )}
                        {!auth.user && (
                            <Button
                                size="sm"
                                className="hidden bg-velora-green text-velora-cream hover:bg-velora-forest sm:inline-flex"
                                asChild
                            >
                                <Link href={register()}>Join</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-velora-gold/30 bg-velora-green text-velora-cream">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="tracking-[0.2em] text-velora-gold uppercase">
                        {name}
                    </p>
                    <p className="text-velora-cream/75">
                        Considered clothing. Made to last.
                    </p>
                </div>
            </footer>
        </div>
    );
}

function CountBadge({ count }: { count: number }) {
    if (count <= 0) {
        return null;
    }

    return (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-velora-gold px-1 text-[10px] text-velora-green">
            {count > 9 ? '9+' : count}
        </span>
    );
}
