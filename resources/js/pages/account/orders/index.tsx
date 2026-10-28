import { Head, Link } from '@inertiajs/react';
import { AccountNav } from '@/components/account-nav';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

            <div className="mx-auto max-w-6xl px-4 py-10">
                <AccountNav />
                <p className="mt-8 text-xs tracking-[0.22em] uppercase">
                    Orders
                </p>
                <h1 className="mt-2 text-3xl tracking-tight">Your orders</h1>

                {orders.data.length === 0 ? (
                    <div className="mt-10 space-y-4">
                        <p className="text-muted-foreground">
                            No orders yet.
                        </p>
                        <Button asChild>
                            <Link href={shopIndex()}>Browse the shop</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="mt-8 overflow-x-auto border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
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
                                    <tr key={order.id} className="border-t">
                                        <td className="px-4 py-3">
                                            <Link
                                                href={accountOrder(
                                                    order.number,
                                                )}
                                                className="underline-offset-4 hover:underline"
                                            >
                                                {order.number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {order.placed_at}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="outline">
                                                {order.status_label}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            {order.item_count}
                                        </td>
                                        <td className="px-4 py-3 text-right">
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
            </div>
        </>
    );
}
