import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { index, show } from '@/routes/admin/orders';
import type { AdminOrder, OrderStatusOption, Paginated } from '@/types';
import type { FormEvent } from 'react';

type Props = {
    orders: Paginated<AdminOrder>;
    filters: { q: string; status: string };
    statuses: OrderStatusOption[];
};

export default function AdminOrdersIndex({
    orders,
    filters,
    statuses,
}: Props) {
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const query: Record<string, string> = {};

        for (const [key, value] of data.entries()) {
            if (typeof value === 'string' && value !== '') {
                query[key] = value;
            }
        }

        router.get(index.url(), query, { preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Orders"
                    description="Customer orders sit here, separate from the shop account."
                />

                <form onSubmit={submit} className="flex flex-wrap gap-2">
                    <Input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Search number, name, or email"
                        className="max-w-xs"
                    />
                    <select
                        name="status"
                        defaultValue={filters.status}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm"
                    >
                        Filter
                    </button>
                </form>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">
                                    Order
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Customer
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Date
                                </th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            )}
                            {orders.data.map((order) => (
                                <tr key={order.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={show(order.number)}
                                            className="underline-offset-4 hover:underline"
                                        >
                                            {order.number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{order.customer.name}</p>
                                        <p className="text-muted-foreground">
                                            {order.customer.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline">
                                            {order.status_label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {order.placed_at}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {formatPrice(order.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <PaginationLinks paginator={orders} />
            </div>
        </>
    );
}
