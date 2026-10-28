import { Head, Link } from '@inertiajs/react';
import { AccountNav } from '@/components/account-nav';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { index as accountOrders, show as accountOrder } from '@/routes/account/orders';
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
    return (
        <>
            <Head title="My account" />

            <div className="mx-auto max-w-6xl px-4 py-10">
                <AccountNav />
                <p className="mt-8 text-xs tracking-[0.22em] uppercase">
                    Account
                </p>
                <h1 className="mt-2 text-3xl tracking-tight">
                    Welcome back
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Track orders, saved pieces, and your details here. Staff
                    catalog tools stay in the admin panel.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <Link href={accountOrders()} className="border p-6">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Orders
                        </p>
                        <p className="mt-2 text-3xl">{stats.orders}</p>
                    </Link>
                    <Link href={wishlistIndex()} className="border p-6">
                        <p className="text-xs tracking-[0.18em] text-muted-foreground uppercase">
                            Wishlist
                        </p>
                        <p className="mt-2 text-3xl">{stats.wishlist}</p>
                    </Link>
                </div>

                <section className="mt-12">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl">Recent orders</h2>
                        <Link
                            href={accountOrders()}
                            className="text-sm underline-offset-4 hover:underline"
                        >
                            View all
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div className="mt-6 space-y-4">
                            <p className="text-muted-foreground">
                                You have not placed an order yet.
                            </p>
                            <Button asChild>
                                <Link href={shopIndex()}>Start shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-6 divide-y border">
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    href={accountOrder(order.number)}
                                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 hover:bg-muted/40"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {order.number}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {order.placed_at} ·{' '}
                                            {order.status_label}
                                        </p>
                                    </div>
                                    <p>{formatPrice(order.total)}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
