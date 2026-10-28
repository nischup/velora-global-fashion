import { Link, router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { show } from '@/routes/products';
import { store as toggleWishlist } from '@/routes/wishlist';
import type { ProductCard as ProductCardType } from '@/types';

export function ProductCard({ product }: { product: ProductCardType }) {
    const { storefront } = usePage().props;
    const saved = storefront.wishlist_ids.includes(product.id);

    return (
        <div className="group relative">
            <Link href={show(product.slug)} className="block">
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                            No image
                        </div>
                    )}
                    {!product.in_stock && (
                        <span className="absolute top-3 left-3 bg-background/90 px-2 py-1 text-[10px] tracking-[0.2em] uppercase">
                            Sold out
                        </span>
                    )}
                </div>
                <div className="mt-3 space-y-1">
                    {product.brand && (
                        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                            {product.brand.name}
                        </p>
                    )}
                    <h3 className="text-sm font-medium">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                        {product.min_price !== product.max_price
                            ? `From ${formatPrice(product.min_price)}`
                            : formatPrice(product.min_price)}
                    </p>
                </div>
            </Link>
            <button
                type="button"
                className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/90"
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={(event) => {
                    event.preventDefault();
                    router.post(
                        toggleWishlist.url(),
                        { product_id: product.id },
                        { preserveScroll: true },
                    );
                }}
            >
                <Heart
                    className={saved ? 'size-4 fill-current' : 'size-4'}
                />
            </button>
        </div>
    );
}
