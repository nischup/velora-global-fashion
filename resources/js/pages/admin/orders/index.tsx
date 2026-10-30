import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { PageLoadingModal, usePageLoader } from '@/components/page-loading-modal';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { bulk, index, show } from '@/routes/admin/orders';
import type {
    AdminOrder,
    OrderSourceOption,
    OrderStatus,
    OrderStatusOption,
    Paginated,
} from '@/types';
import type { FormEvent } from 'react';

type Props = {
    orders: Paginated<AdminOrder>;
    filters: {
        q: string;
        status: string;
        source: string;
        from: string;
        to: string;
    };
    statuses: OrderStatusOption[];
    sources: OrderSourceOption[];
};

export default function AdminOrdersIndex({
    orders,
    filters,
    statuses,
    sources,
}: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkStatus, setBulkStatus] = useState<OrderStatus>('processing');
    const { loading, showLoader } = usePageLoader();
    const openOrders = useMemo(
        () => orders.data.filter((order) => order.can_update_status),
        [orders.data],
    );

    const allOpenSelected =
        openOrders.length > 0 &&
        openOrders.every((order) => selected.includes(order.id));

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const query: Record<string, string> = {};

        for (const [key, value] of data.entries()) {
            if (typeof value === 'string' && value !== '') {
                query[key] = value;
            }
        }

        setSelected([]);
        const hideLoader = showLoader();

        router.get(index.url(), query, {
            preserveState: true,
            replace: true,
            onFinish: hideLoader,
        });
    };

    const toggle = (id: number, enabled: boolean) => {
        if (!enabled) {
            return;
        }

        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const toggleAll = () => {
        if (allOpenSelected) {
            setSelected([]);
            return;
        }

        setSelected(openOrders.map((order) => order.id));
    };

    return (
        <>
            <Head title="Orders" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Orders"
                    description="Filter online pending orders, select several, and move them together."
                />

                <form
                    key={`${filters.from}|${filters.to}|${filters.q}|${filters.status}|${filters.source}`}
                    onSubmit={submit}
                    className="flex flex-wrap items-end gap-2"
                >
                    <label className="grid gap-1">
                        <span className="text-muted-foreground text-xs">
                            From
                        </span>
                        <Input
                            type="date"
                            name="from"
                            defaultValue={filters.from}
                            lang="en-GB"
                            className="w-auto"
                        />
                    </label>
                    <label className="grid gap-1">
                        <span className="text-muted-foreground text-xs">
                            To
                        </span>
                        <Input
                            type="date"
                            name="to"
                            defaultValue={filters.to}
                            lang="en-GB"
                            className="w-auto"
                        />
                    </label>
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
                    <select
                        name="source"
                        defaultValue={filters.source}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All sources</option>
                        {sources.map((source) => (
                            <option key={source.value} value={source.value}>
                                {source.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary text-primary-foreground h-9 rounded-md px-4 text-sm disabled:opacity-60"
                    >
                        Filter
                    </button>
                </form>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
                        <p className="text-sm">
                            {selected.length} selected
                        </p>
                        <select
                            value={bulkStatus}
                            onChange={(event) =>
                                setBulkStatus(
                                    event.target.value as OrderStatus,
                                )
                            }
                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            {statuses
                                .filter(
                                    (status) =>
                                        status.value !== 'refunded',
                                )
                                .map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                        </select>
                        <Button
                            onClick={() =>
                                router.post(
                                    bulk.url(),
                                    {
                                        order_ids: selected,
                                        status: bulkStatus,
                                    },
                                    {
                                        onSuccess: () => setSelected([]),
                                    },
                                )
                            }
                        >
                            Apply to selected
                        </Button>
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="w-10 px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allOpenSelected}
                                        disabled={openOrders.length === 0}
                                        onChange={toggleAll}
                                        aria-label="Select open orders"
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Order
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Customer
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Source
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
                            {(loading || orders.data.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-16 text-center text-muted-foreground"
                                    >
                                        {loading
                                            ? null
                                            : 'No orders for these dates.'}
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                orders.data.map((order) => (
                                <tr key={order.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(
                                                order.id,
                                            )}
                                            disabled={!order.can_update_status}
                                            onChange={() =>
                                                toggle(
                                                    order.id,
                                                    order.can_update_status,
                                                )
                                            }
                                            aria-label={`Select ${order.number}`}
                                        />
                                    </td>
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
                                            {order.source_label}
                                        </Badge>
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

                {!loading && <PaginationLinks paginator={orders} />}
            </div>

            <PageLoadingModal open={loading} title="Loading orders" />
        </>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [{ title: 'Orders', href: '/admin/orders' }],
};
