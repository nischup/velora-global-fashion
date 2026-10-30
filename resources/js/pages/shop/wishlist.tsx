import { Head, Link, usePage } from '@inertiajs/react';
import { AccountEmpty, AccountShell } from '@/components/account-shell';
import { ProductCard } from '@/components/product-card';
import { index as shopIndex } from '@/routes/shop';
import type { ProductCard as ProductCardType } from '@/types';

type Props = {
    products: ProductCardType[];
};

export default function WishlistPage({ products }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Wishlist" />

            <AccountShell showNav={Boolean(auth.user)}>
                <p className="mt-8 text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    Saved
                </p>
                <h1 className="mt-2 text-3xl tracking-tight text-velora-green">
                    Wishlist
                </h1>

                {products.length === 0 ? (
                    <AccountEmpty
                        action={
                            <Link
                                href={shopIndex()}
                                className="inline-flex h-11 items-center bg-velora-green px-6 text-xs tracking-[0.18em] text-velora-cream uppercase"
                            >
                                Browse the shop
                            </Link>
                        }
                    >
                        Nothing saved yet.
                    </AccountEmpty>
                ) : (
                    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </AccountShell>
        </>
    );
}
