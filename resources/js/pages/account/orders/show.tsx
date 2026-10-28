import { Head, Link } from '@inertiajs/react';
import { AccountNav } from '@/components/account-nav';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { index as accountOrders } from '@/routes/account/orders';
import { show as productShow } from '@/routes/products';
import type { CustomerOrder } from '@/types';

export default function AccountOrderShow({
    order,
}: {
    order: CustomerOrder;
}) {
    return (
        <>
            <Head title={`Order ${order.number}`} />

            <div className="mx-auto max-w-6xl px-4 py-10">
                <AccountNav />
                <p className="mt-8 text-xs tracking-[0.22em] uppercase">
                    <Link href={accountOrders()} className="hover:underline">
                        Orders
                    </Link>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl tracking-tight">{order.number}</h1>
                    <Badge variant="outline">{order.status_label}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Placed {order.placed_at}
                </p>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-6">
                        {(order.items ?? []).map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-4 border-b pb-6"
                            >
                                <div className="size-24 shrink-0 overflow-hidden bg-muted">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.product_name}
                                            className="size-full object-cover"
                                        />
                                    ) : null}
                                </div>
                                <div className="flex-1">
                                    {item.product_slug ? (
                                        <Link
                                            href={productShow(item.product_slug)}
                                            className="font-medium"
                                        >
                                            {item.product_name}
                                        </Link>
                                    ) : (
                                        <p className="font-medium">
                                            {item.product_name}
                                        </p>
                                    )}
                                    {item.variant_label && (
                                        <p className="text-sm text-muted-foreground">
                                            {item.variant_label}
                                        </p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Qty {item.quantity} ·{' '}
                                        {formatPrice(item.unit_price)}
                                    </p>
                                </div>
                                <p>{formatPrice(item.line_total)}</p>
                            </div>
                        ))}
                    </div>

                    <aside className="space-y-6">
                        <div className="border p-6">
                            <h2 className="text-sm tracking-[0.18em] uppercase">
                                Delivery
                            </h2>
                            <p className="mt-3">{order.shipping_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {order.shipping_phone}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {order.shipping_address}
                                <br />
                                {order.shipping_city}
                            </p>
                            {order.notes && (
                                <p className="mt-3 text-sm">{order.notes}</p>
                            )}
                        </div>
                        <div className="border p-6">
                            <h2 className="text-sm tracking-[0.18em] uppercase">
                                Summary
                            </h2>
                            <div className="mt-4 flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="mt-4 flex justify-between border-t pt-4 font-medium">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Payment: cash on delivery
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
