import { Head, Link } from '@inertiajs/react';
import { AccountNav } from '@/components/account-nav';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { index as shopIndex } from '@/routes/shop';
import { usePage } from '@inertiajs/react';
import type { ProductCard as ProductCardType } from '@/types';

type Props = {
    products: ProductCardType[];
};

export default function WishlistPage({ products }: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Wishlist" />

            <div className="mx-auto max-w-6xl px-4 py-10">
                {auth.user && (
                    <div className="mb-8">
                        <AccountNav />
                    </div>
                )}
                <p className="text-xs tracking-[0.22em] uppercase">Saved</p>
                <h1 className="mt-2 text-3xl tracking-tight">Wishlist</h1>

                {products.length === 0 ? (
                    <div className="mt-10 space-y-4">
                        <p className="text-muted-foreground">
                            Nothing saved yet.
                        </p>
                        <Button asChild>
                            <Link href={shopIndex()}>Browse the shop</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
