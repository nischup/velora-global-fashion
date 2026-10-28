import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { index, update } from '@/routes/admin/orders';
import { show as productShow } from '@/routes/products';
import type { AdminOrder, OrderStatusOption } from '@/types';

type Props = {
    order: AdminOrder;
    statuses: OrderStatusOption[];
};

export default function AdminOrderShow({ order, statuses }: Props) {
    return (
        <>
            <Head title={`Order ${order.number}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        title={order.number}
                        description={`${order.customer.name} · ${order.customer.email}`}
                    />
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{order.status_label}</Badge>
                        <Button variant="outline" asChild>
                            <Link href={index()}>All orders</Link>
                        </Button>
                    </div>
                </div>

                <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        router.patch(update.url(order.number), {
                            status: data.get('status'),
                        });
                    }}
                >
                    <label className="text-sm">
                        Update status
                        <select
                            name="status"
                            defaultValue={order.status}
                            className="border-input mt-1 block h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            {statuses.map((status) => (
                                <option
                                    key={status.value}
                                    value={status.value}
                                >
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <Button type="submit">Save</Button>
                </form>

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="overflow-hidden rounded-xl border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {(order.items ?? []).map((item) => (
                                    <tr key={item.id} className="border-t">
                                        <td className="px-4 py-3">
                                            {item.product_slug ? (
                                                <Link
                                                    href={productShow(
                                                        item.product_slug,
                                                    )}
                                                    className="hover:underline"
                                                >
                                                    {item.product_name}
                                                </Link>
                                            ) : (
                                                item.product_name
                                            )}
                                            <p className="text-muted-foreground">
                                                {item.variant_label} ·{' '}
                                                {item.variant_sku}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatPrice(item.line_total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border p-5">
                            <h2 className="text-sm font-medium">Delivery</h2>
                            <p className="mt-2">{order.shipping_name}</p>
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
                        <div className="rounded-xl border p-5">
                            <div className="flex justify-between text-sm">
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
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
