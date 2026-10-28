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

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-2 lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="size-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72">
                                <SheetHeader>
                                    <SheetTitle>{name}</SheetTitle>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col gap-4 text-sm tracking-[0.18em] uppercase">
                                    <Link href={shopIndex()}>Shop</Link>
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={shopCategory(category.slug)}
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                    <Link href={wishlistIndex()}>Wishlist</Link>
                                    <Link href={cartIndex()}>Bag</Link>
                                    {auth.user && !canManageCatalog(auth.user) && (
                                        <Link href={accountIndex()}>
                                            My account
                                        </Link>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={home()}
                        className="font-medium tracking-[0.28em] uppercase"
                    >
                        {name}
                    </Link>

                    <nav className="hidden items-center gap-8 text-xs tracking-[0.22em] uppercase lg:flex">
                        <Link href={shopIndex()} className="hover:opacity-70">
                            Shop
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={shopCategory(category.slug)}
                                className="hover:opacity-70"
                            >
                                {category.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={shopIndex()}>
                                <Search className="size-4" />
                                <span className="sr-only">Search</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={wishlistIndex()} className="relative">
                                <Heart className="size-4" />
                                <CountBadge count={wishlistCount} />
                                <span className="sr-only">Wishlist</span>
                            </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={cartIndex()} className="relative">
                                <ShoppingBag className="size-4" />
                                <CountBadge count={cartCount} />
                                <span className="sr-only">Shopping bag</span>
                            </Link>
                        </Button>
                        {auth.user ? (
                            <Button variant="ghost" size="icon" asChild>
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
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={login()}>Log in</Link>
                            </Button>
                        )}
                        {!auth.user && (
                            <Button
                                size="sm"
                                className="hidden sm:inline-flex"
                                asChild
                            >
                                <Link href={register()}>Join</Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t">
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p className="tracking-[0.2em] uppercase">{name}</p>
                    <p>Considered clothing. Made to last.</p>
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
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-950 px-1 text-[10px] text-white">
            {count > 9 ? '9+' : count}
        </span>
    );
}
