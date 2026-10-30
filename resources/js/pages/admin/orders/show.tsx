import { Head, Link, router } from '@inertiajs/react';
import { AdminReturnForm } from '@/components/admin-return-form';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { index, invoice, update } from '@/routes/admin/orders';
import { receipt as posReceipt } from '@/routes/admin/pos';
import { show as productShow } from '@/routes/products';
import type {
    AdminOrder,
    OrderStatusOption,
    PaymentMethodOption,
} from '@/types';

type Props = {
    order: AdminOrder;
    statuses: OrderStatusOption[];
    payment_methods: PaymentMethodOption[];
};

export default function AdminOrderShow({
    order,
    statuses,
    payment_methods,
}: Props) {
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
                        <Badge variant="outline">{order.source_label}</Badge>
                        <Badge variant="outline">{order.status_label}</Badge>
                        <Button asChild>
                            <Link href={invoice(order.number)}>
                                Print invoice
                            </Link>
                        </Button>
                        {order.source === 'pos' && (
                            <Button variant="outline" asChild>
                                <Link href={posReceipt(order.number)}>
                                    Receipt
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={index()}>All orders</Link>
                        </Button>
                    </div>
                </div>

                {order.can_update_status && (
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
                )}

                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="space-y-6">
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
                                                {item.returned_quantity > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        returned{' '}
                                                        {item.returned_quantity}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatPrice(item.line_total)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <AdminReturnForm
                            order={order}
                            paymentMethods={payment_methods}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border p-5">
                            <h2 className="text-sm font-medium">
                                {order.source === 'pos'
                                    ? 'Walk-in'
                                    : 'Delivery'}
                            </h2>
                            <p className="mt-2">{order.shipping_name}</p>
                            <p className="text-sm text-muted-foreground">
                                {order.shipping_phone}
                            </p>
                            {order.source !== 'pos' && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {order.shipping_address}
                                    <br />
                                    {order.shipping_city}
                                </p>
                            )}
                            {order.cashier && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Cashier {order.cashier.name}
                                </p>
                            )}
                            {order.notes && (
                                <p className="mt-3 text-sm">{order.notes}</p>
                            )}
                        </div>
                        <div className="rounded-xl border p-5">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                    <span>Discount</span>
                                    <span>
                                        -{formatPrice(order.discount_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                <span>Shipping</span>
                                <span>
                                    {order.source === 'pos'
                                        ? 'In-store'
                                        : 'Free'}
                                </span>
                            </div>
                            {order.tax_amount > 0 && (
                                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                                    <span>VAT {order.tax_rate}%</span>
                                    <span>{formatPrice(order.tax_amount)}</span>
                                </div>
                            )}
                            <div className="mt-4 flex justify-between border-t pt-4 font-medium">
                                <span>Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                            {order.payment_method_label && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Paid by {order.payment_method_label}
                                </p>
                            )}
                            {order.refunded_amount > 0 && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Refunded{' '}
                                    {formatPrice(order.refunded_amount)}
                                </p>
                            )}
                        </div>

                        {order.returns.length > 0 && (
                            <div className="rounded-xl border p-5">
                                <h2 className="text-sm font-medium">
                                    Returns
                                </h2>
                                <div className="mt-3 space-y-3 text-sm">
                                    {order.returns.map((entry) => (
                                        <div key={entry.id}>
                                            <p>
                                                {formatPrice(
                                                    entry.refund_amount,
                                                )}{' '}
                                                · {entry.refund_method_label}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {entry.created_at}
                                                {entry.reason
                                                    ? ` · ${entry.reason}`
                                                    : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
