import { Head, Link, usePage } from '@inertiajs/react';
import { Heart, Package } from 'lucide-react';
import {
    AccountEmpty,
    AccountGoldRule,
    AccountShell,
    orderStatusClass,
} from '@/components/account-shell';
import { formatPrice } from '@/lib/utils';
import {
    index as accountOrders,
    show as accountOrder,
} from '@/routes/account/orders';
import { index as shopIndex } from '@/routes/shop';
import { index as wishlistIndex } from '@/routes/wishlist';
import type { CustomerOrder } from '@/types';

type Props = {
    stats: {
        orders: number;
        wishlist: number;
    };
    orders: CustomerOrder[];
};

export default function AccountIndex({ stats, orders }: Props) {
    const { auth } = usePage().props;
    const firstName = auth.user?.name.split(' ')[0] ?? 'there';

    return (
        <>
            <Head title="My account" />

            <AccountShell>
                <section className="relative mt-8 overflow-hidden rounded-3xl border border-velora-gold/30 bg-velora-green text-velora-cream">
                    <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_70%_40%,rgba(196,161,90,0.22),transparent_58%)] md:block" />
                    <div className="relative grid items-center gap-8 px-6 py-10 md:grid-cols-[1fr_220px] md:px-10">
                        <div>
                            <p className="text-[11px] tracking-[0.28em] text-velora-gold uppercase">
                                My atelier
                            </p>
                            <h1 className="mt-3 text-4xl tracking-tight md:text-5xl">
                                Welcome back, {firstName}
                            </h1>
                            <AccountGoldRule className="mt-5 max-w-xs" />
                            <p className="mt-5 max-w-lg text-sm leading-6 text-velora-cream/75">
                                Track orders, saved pieces, and your details
                                here — considered clothing, made to last.
                            </p>
                        </div>
                        <div className="mx-auto size-44 shrink-0 overflow-hidden rounded-full border border-velora-gold/40 bg-velora-cream shadow-[0_18px_40px_rgba(13,59,46,0.18)] md:mx-0 md:justify-self-end">
                            <img
                                src="/images/logo.png"
                                alt="Velora"
                                className="size-full scale-110 object-cover"
                            />
                        </div>
                    </div>
                </section>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <Link
                        href={accountOrders()}
                        className="group rounded-2xl border border-velora-gold/25 bg-velora-ivory p-6 shadow-[0_10px_30px_rgba(13,59,46,0.04)] transition hover:-translate-y-0.5 hover:border-velora-gold/50"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                                Orders
                            </p>
                            <Package className="size-4 text-velora-gold" />
                        </div>
                        <p className="mt-4 text-4xl font-medium text-velora-green">
                            {stats.orders}
                        </p>
                        <p className="mt-2 text-sm text-velora-forest/65">
                            Pieces already on their way, or waiting to ship.
                        </p>
                    </Link>
                    <Link
                        href={wishlistIndex()}
                        className="group rounded-2xl border border-velora-gold/25 bg-velora-ivory p-6 shadow-[0_10px_30px_rgba(13,59,46,0.04)] transition hover:-translate-y-0.5 hover:border-velora-gold/50"
                    >
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                                Wishlist
                            </p>
                            <Heart className="size-4 text-velora-gold" />
                        </div>
                        <p className="mt-4 text-4xl font-medium text-velora-green">
                            {stats.wishlist}
                        </p>
                        <p className="mt-2 text-sm text-velora-forest/65">
                            Saved looks ready for the next season.
                        </p>
                    </Link>
                </div>

                <section className="mt-12">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                                Recent
                            </p>
                            <h2 className="mt-1 text-2xl text-velora-green">
                                Your orders
                            </h2>
                        </div>
                        <Link
                            href={accountOrders()}
                            className="text-sm tracking-[0.12em] text-velora-forest/70 uppercase underline-offset-4 hover:text-velora-green hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <AccountEmpty
                            action={
                                <Link
                                    href={shopIndex()}
                                    className="inline-flex h-11 items-center bg-velora-green px-6 text-xs tracking-[0.18em] text-velora-cream uppercase"
                                >
                                    Start shopping
                                </Link>
                            }
                        >
                            You have not placed an order yet.
                        </AccountEmpty>
                    ) : (
                        <div className="mt-6 overflow-hidden rounded-2xl border border-velora-gold/25 bg-velora-ivory">
                            {orders.map((order, index) => (
                                <Link
                                    key={order.id}
                                    href={accountOrder(order.number)}
                                    className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-velora-gold/10 ${
                                        index > 0
                                            ? 'border-t border-velora-gold/20'
                                            : ''
                                    }`}
                                >
                                    <div>
                                        <p className="font-medium tracking-wide">
                                            {order.number}
                                        </p>
                                        <p className="mt-1 text-sm text-velora-forest/65">
                                            {order.placed_at}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.14em] uppercase ${orderStatusClass(order.status)}`}
                                        >
                                            {order.status_label}
                                        </span>
                                        <p className="min-w-20 text-right font-medium">
                                            {formatPrice(order.total)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </AccountShell>
        </>
    );
}
