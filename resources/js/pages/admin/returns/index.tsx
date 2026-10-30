import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { index, show } from '@/routes/admin/returns';
import type { AdminOrder } from '@/types';
import type { FormEvent } from 'react';

type Props = {
    orders: AdminOrder[];
    filters: { q: string };
};

export default function AdminReturnsIndex({ orders, filters }: Props) {
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const q = String(data.get('q') ?? '').trim();

        router.get(index.url(), q === '' ? {} : { q }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Returns" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Returns"
                    description="Look up a receipt and send items back to stock."
                />
                <form onSubmit={submit} className="flex max-w-xl gap-2">
                    <Input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Receipt number, name, or phone"
                    />
                    <Button type="submit">Find</Button>
                </form>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Sale</th>
                                <th className="px-4 py-3 font-medium">Customer</th>
                                <th className="px-4 py-3 font-medium">Total</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        {filters.q
                                            ? 'No sale matches that search.'
                                            : 'No sales left to return.'}
                                    </td>
                                </tr>
                            )}
                            {orders.map((order) => (
                                <tr key={order.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {order.number}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.placed_at}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{order.customer.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {order.shipping_phone}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{formatPrice(order.total)}</div>
                                        <Badge variant="outline" className="mt-1">
                                            {order.status_label}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={show(order.number)}>
                                                {order.is_returnable
                                                    ? 'Return'
                                                    : 'View'}
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

AdminReturnsIndex.layout = {
    breadcrumbs: [{ title: 'Returns', href: index() }],
};
