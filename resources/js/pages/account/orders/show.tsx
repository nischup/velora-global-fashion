import { Head, Link } from '@inertiajs/react';
import {
    AccountShell,
    orderStatusClass,
} from '@/components/account-shell';
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

            <AccountShell>
                <p className="mt-8 text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    <Link
                        href={accountOrders()}
                        className="hover:text-velora-green hover:underline"
                    >
                        Orders
                    </Link>
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl tracking-tight text-velora-green">
                        {order.number}
                    </h1>
                    <span
                        className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.14em] uppercase ${orderStatusClass(order.status)}`}
                    >
                        {order.status_label}
                    </span>
                </div>
                <p className="mt-2 text-sm text-velora-forest/65">
                    Placed {order.placed_at}
                </p>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
                    <div className="overflow-hidden rounded-2xl border border-velora-gold/25 bg-velora-ivory">
                        {(order.items ?? []).map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex gap-4 px-5 py-5 ${
                                    index > 0
                                        ? 'border-t border-velora-gold/20'
                                        : ''
                                }`}
                            >
                                <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-velora-cream">
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
                                            href={productShow(
                                                item.product_slug,
                                            )}
                                            className="font-medium hover:underline"
                                        >
                                            {item.product_name}
                                        </Link>
                                    ) : (
                                        <p className="font-medium">
                                            {item.product_name}
                                        </p>
                                    )}
                                    {item.variant_label && (
                                        <p className="text-sm text-velora-forest/65">
                                            {item.variant_label}
                                        </p>
                                    )}
                                    <p className="text-sm text-velora-forest/65">
                                        Qty {item.quantity} ·{' '}
                                        {formatPrice(item.unit_price)}
                                    </p>
                                </div>
                                <p className="font-medium">
                                    {formatPrice(item.line_total)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-velora-gold/25 bg-velora-ivory p-6">
                            <h2 className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                                Delivery
                            </h2>
                            <p className="mt-3 font-medium">
                                {order.shipping_name}
                            </p>
                            <p className="text-sm text-velora-forest/65">
                                {order.shipping_phone}
                            </p>
                            <p className="mt-2 text-sm text-velora-forest/65">
                                {order.shipping_address}
                                <br />
                                {order.shipping_city}
                            </p>
                            {order.notes && (
                                <p className="mt-3 text-sm">{order.notes}</p>
                            )}
                        </div>
                        <div className="rounded-2xl bg-velora-green p-6 text-velora-cream">
                            <h2 className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                                Summary
                            </h2>
                            <div className="mt-4 flex justify-between text-sm">
                                <span className="text-velora-cream/70">
                                    Subtotal
                                </span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-sm text-velora-cream/70">
                                <span>Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="mt-4 flex justify-between border-t border-velora-gold/30 pt-4 font-medium">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                            <p className="mt-3 text-xs text-velora-gold-soft">
                                Payment: cash on delivery
                            </p>
                        </div>
                    </aside>
                </div>
            </AccountShell>
        </>
    );
}
