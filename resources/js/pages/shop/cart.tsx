import { Head, Link, router } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { create as checkout } from '@/routes/checkout';
import { destroy, update } from '@/routes/cart';
import { show } from '@/routes/products';
import { index as shopIndex } from '@/routes/shop';
import type { CartItem } from '@/types';

type Props = {
    items: CartItem[];
    subtotal: number;
};

export default function CartPage({ items, subtotal }: Props) {
    return (
        <>
            <Head title="Shopping bag" />

            <div className="mx-auto max-w-6xl px-4 py-10">
                <p className="text-xs tracking-[0.22em] uppercase">Cart</p>
                <h1 className="mt-2 text-3xl tracking-tight">Shopping bag</h1>

                {items.length === 0 ? (
                    <div className="mt-10 space-y-4">
                        <p className="text-muted-foreground">
                            Your bag is empty.
                        </p>
                        <Button asChild>
                            <Link href={shopIndex()}>Continue shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div
                                    key={item.variant_id}
                                    className="flex gap-4 border-b pb-6"
                                >
                                    <Link
                                        href={show(item.slug)}
                                        className="size-28 shrink-0 overflow-hidden bg-muted"
                                    >
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="size-full object-cover"
                                            />
                                        ) : null}
                                    </Link>
                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            {item.brand && (
                                                <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
                                                    {item.brand}
                                                </p>
                                            )}
                                            <Link
                                                href={show(item.slug)}
                                                className="font-medium"
                                            >
                                                {item.name}
                                            </Link>
                                            {item.options && (
                                                <p className="text-sm text-muted-foreground">
                                                    {item.options}
                                                </p>
                                            )}
                                            {!item.in_stock && (
                                                <p className="mt-1 text-sm text-destructive">
                                                    Not enough stock
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <div className="flex items-center border">
                                                <button
                                                    type="button"
                                                    className="px-3 py-2"
                                                    aria-label="Decrease quantity"
                                                    onClick={() =>
                                                        router.patch(
                                                            update.url(
                                                                item.variant_id,
                                                            ),
                                                            {
                                                                quantity:
                                                                    item.quantity -
                                                                    1,
                                                            },
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="min-w-8 text-center text-sm">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="px-3 py-2"
                                                    aria-label="Increase quantity"
                                                    disabled={
                                                        item.quantity >=
                                                        item.stock
                                                    }
                                                    onClick={() =>
                                                        router.patch(
                                                            update.url(
                                                                item.variant_id,
                                                            ),
                                                            {
                                                                quantity:
                                                                    item.quantity +
                                                                    1,
                                                            },
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p>
                                                        {formatPrice(
                                                            item.line_total,
                                                        )}
                                                    </p>
                                                    {item.compare_at_price &&
                                                    item.compare_at_price >
                                                        item.price ? (
                                                        <p className="text-xs text-muted-foreground line-through">
                                                            {formatPrice(
                                                                item.compare_at_price *
                                                                    item.quantity,
                                                            )}
                                                        </p>
                                                    ) : null}
                                                </div>
                                                <button
                                                    type="button"
                                                    aria-label="Remove item"
                                                    onClick={() =>
                                                        router.delete(
                                                            destroy.url(
                                                                item.variant_id,
                                                            ),
                                                            {
                                                                preserveScroll:
                                                                    true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="size-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="h-fit border p-6">
                            <h2 className="text-sm tracking-[0.18em] uppercase">
                                Summary
                            </h2>
                            <div className="mt-4 flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="mt-4 flex justify-between border-t pt-4 font-medium">
                                <span>Total</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <Button className="mt-6 w-full" asChild>
                                <Link href={checkout()}>Checkout</Link>
                            </Button>
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}
