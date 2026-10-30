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
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-velora-gold/20 bg-velora-ivory">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-sm text-velora-forest/50">
                            No image
                        </div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {product.sale_percent ? (
                            <span className="bg-velora-gold px-2 py-1 text-[10px] tracking-[0.2em] text-velora-green uppercase">
                                {product.sale_percent}% off
                            </span>
                        ) : null}
                        {!product.in_stock && (
                            <span className="bg-velora-green/90 px-2 py-1 text-[10px] tracking-[0.2em] text-velora-cream uppercase">
                                Sold out
                            </span>
                        )}
                    </div>
                </div>
                <div className="mt-3 space-y-1">
                    {product.brand && (
                        <p className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                            {product.brand.name}
                        </p>
                    )}
                    <h3 className="text-sm font-medium text-velora-green">
                        {product.name}
                    </h3>
                    <p className="text-sm text-velora-forest/65">
                        {product.min_price !== product.max_price
                            ? `From ${formatPrice(product.min_price)}`
                            : formatPrice(product.min_price)}
                        {product.compare_at_price &&
                        product.compare_at_price > product.min_price ? (
                            <span className="ml-2 text-velora-forest/40 line-through">
                                {formatPrice(product.compare_at_price)}
                            </span>
                        ) : null}
                    </p>
                </div>
            </Link>
            <button
                type="button"
                className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full border border-velora-gold/30 bg-velora-cream/90 text-velora-green"
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
                    className={
                        saved
                            ? 'size-4 fill-velora-gold text-velora-gold'
                            : 'size-4'
                    }
                />
            </button>
        </div>
    );
}
