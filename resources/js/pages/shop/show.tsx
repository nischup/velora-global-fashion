import { Head, Link, router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { store as addToCart } from '@/routes/cart';
import { category as shopCategory } from '@/routes/shop';
import { store as toggleWishlist } from '@/routes/wishlist';
import type {
    CatalogAttribute,
    ProductCard as ProductCardType,
    ProductDetail,
} from '@/types';

type Props = {
    product: ProductDetail;
    options: CatalogAttribute[];
    related: ProductCardType[];
};

export default function ShopShow({ product, options, related }: Props) {
    const { storefront } = usePage().props;
    const saved = storefront.wishlist_ids.includes(product.id);
    const sizeOptions = options.find((option) => option.slug === 'size');
    const colorOptions = options.find((option) => option.slug === 'color');
    const [activeImage, setActiveImage] = useState(
        product.images[0]?.url ?? null,
    );
    const [sizeId, setSizeId] = useState<number | null>(
        sizeOptions?.values[0]?.id ?? null,
    );
    const [colorId, setColorId] = useState<number | null>(
        colorOptions?.values[0]?.id ?? null,
    );
    const [quantity, setQuantity] = useState(1);

    const selected = useMemo(() => {
        return (
            product.variants.find((variant) => {
                const hasSize = sizeId
                    ? variant.attribute_value_ids.includes(sizeId)
                    : true;
                const hasColor = colorId
                    ? variant.attribute_value_ids.includes(colorId)
                    : true;

                return hasSize && hasColor;
            }) ?? product.variants[0]
        );
    }, [product.variants, sizeId, colorId]);

    return (
        <>
            <Head title={product.name} />

            <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-2">
                <div>
                    <div className="aspect-[4/5] overflow-hidden bg-muted">
                        {activeImage ? (
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center text-muted-foreground">
                                No image
                            </div>
                        )}
                    </div>
                    {product.images.length > 1 && (
                        <div className="mt-3 grid grid-cols-5 gap-2">
                            {product.images.map((image) => (
                                <button
                                    key={image.id}
                                    type="button"
                                    onClick={() => setActiveImage(image.url)}
                                    className="aspect-square overflow-hidden border"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.alt ?? product.name}
                                        className="size-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {product.brand && (
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            {product.brand.name}
                        </p>
                    )}
                    <h1 className="text-3xl tracking-tight">{product.name}</h1>
                    {product.category && (
                        <Link
                            href={shopCategory(product.category.slug)}
                            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                        >
                            {product.category.name}
                        </Link>
                    )}

                    {selected && (
                        <div className="flex items-center gap-3">
                            <p className="text-xl">
                                {formatPrice(selected.price)}
                            </p>
                            {selected.compare_at_price &&
                                selected.compare_at_price > selected.price && (
                                    <p className="text-muted-foreground line-through">
                                        {formatPrice(selected.compare_at_price)}
                                    </p>
                                )}
                            {!selected.in_stock && (
                                <Badge variant="secondary">Sold out</Badge>
                            )}
                            {selected.in_stock && selected.is_low_stock && (
                                <Badge variant="outline">Low stock</Badge>
                            )}
                        </div>
                    )}

                    {product.short_description && (
                        <p className="text-muted-foreground">
                            {product.short_description}
                        </p>
                    )}

                    {sizeOptions && (
                        <div>
                            <p className="mb-2 text-xs tracking-[0.18em] uppercase">
                                Size
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sizeOptions.values.map((value) => (
                                    <Button
                                        key={value.id}
                                        type="button"
                                        variant={
                                            sizeId === value.id
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() => setSizeId(value.id)}
                                    >
                                        {value.value}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {colorOptions && (
                        <div>
                            <p className="mb-2 text-xs tracking-[0.18em] uppercase">
                                Color
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {colorOptions.values.map((value) => (
                                    <Button
                                        key={value.id}
                                        type="button"
                                        variant={
                                            colorId === value.id
                                                ? 'default'
                                                : 'outline'
                                        }
                                        onClick={() => setColorId(value.id)}
                                    >
                                        {value.hex_color && (
                                            <span
                                                className="size-3 rounded-full border"
                                                style={{
                                                    backgroundColor:
                                                        value.hex_color,
                                                }}
                                            />
                                        )}
                                        {value.value}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selected && (
                        <p className="text-sm text-muted-foreground">
                            SKU {selected.sku}
                            {selected.in_stock
                                ? ` · ${selected.stock} in stock`
                                : ' · Out of stock'}
                        </p>
                    )}

                    {selected && (
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="flex items-center border">
                                <span className="sr-only">Quantity</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={Math.max(selected.stock, 1)}
                                    value={quantity}
                                    onChange={(event) =>
                                        setQuantity(
                                            Math.max(
                                                1,
                                                Number(event.target.value) || 1,
                                            ),
                                        )
                                    }
                                    className="h-11 w-16 bg-transparent px-3 text-sm"
                                />
                            </label>
                            <Button
                                type="button"
                                className="h-11 px-8"
                                disabled={!selected.in_stock}
                                onClick={() =>
                                    router.post(
                                        addToCart.url(),
                                        {
                                            variant_id: selected.id,
                                            quantity,
                                        },
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                {selected.in_stock
                                    ? 'Add to bag'
                                    : 'Sold out'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-11"
                                onClick={() =>
                                    router.post(
                                        toggleWishlist.url(),
                                        { product_id: product.id },
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <Heart
                                    className={
                                        saved ? 'size-4 fill-current' : 'size-4'
                                    }
                                />
                                {saved ? 'Saved' : 'Save'}
                            </Button>
                        </div>
                    )}

                    {product.description && (
                        <div className="border-t pt-6 text-sm leading-7 whitespace-pre-line">
                            {product.description}
                        </div>
                    )}
                </div>
            </div>

            {related.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 pb-16">
                    <h2 className="mb-6 text-xl">You may also like</h2>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {related.map((item) => (
                            <ProductCard key={item.id} product={item} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
