import { Head, Link } from '@inertiajs/react';
import { PaginationLinks } from '@/components/pagination-links';
import {
    AccountEmpty,
    AccountShell,
    orderStatusClass,
} from '@/components/account-shell';
import { formatPrice } from '@/lib/utils';
import { show as accountOrder } from '@/routes/account/orders';
import { index as shopIndex } from '@/routes/shop';
import type { CustomerOrder, Paginated } from '@/types';

type Props = {
    orders: Paginated<CustomerOrder>;
};

export default function AccountOrdersIndex({ orders }: Props) {
    return (
        <>
            <Head title="My orders" />

            <AccountShell>
                <p className="mt-8 text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                    Orders
                </p>
                <h1 className="mt-2 text-3xl tracking-tight text-velora-green">
                    Your orders
                </h1>

                {orders.data.length === 0 ? (
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
                        No orders yet.
                    </AccountEmpty>
                ) : (
                    <div className="mt-8 overflow-x-auto rounded-2xl border border-velora-gold/25 bg-velora-ivory">
                        <table className="w-full text-sm">
                            <thead className="bg-velora-green text-left text-velora-cream">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Order
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Date
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Items
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-t border-velora-gold/20"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={accountOrder(
                                                    order.number,
                                                )}
                                                className="font-medium underline-offset-4 hover:text-velora-forest hover:underline"
                                            >
                                                {order.number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-velora-forest/65">
                                            {order.placed_at}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full border px-3 py-1 text-[11px] tracking-[0.14em] uppercase ${orderStatusClass(order.status)}`}
                                            >
                                                {order.status_label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.item_count}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatPrice(order.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6">
                    <PaginationLinks paginator={orders} />
                </div>
            </AccountShell>
        </>
    );
}
