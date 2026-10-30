import { Head, Link } from '@inertiajs/react';
import { AdminReturnForm } from '@/components/admin-return-form';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { show as orderShow } from '@/routes/admin/orders';
import { receipt as posReceipt } from '@/routes/admin/pos';
import { index } from '@/routes/admin/returns';
import type { AdminOrder, PaymentMethodOption } from '@/types';

type Props = {
    order: AdminOrder;
    payment_methods: PaymentMethodOption[];
};

export default function AdminReturnsShow({ order, payment_methods }: Props) {
    return (
        <>
            <Head title={`Return ${order.number}`} />
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        title={order.number}
                        description={`${order.customer.name} · ${order.placed_at ?? ''}`}
                    />
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{order.status_label}</Badge>
                        {order.source === 'pos' && (
                            <Button variant="outline" asChild>
                                <Link href={posReceipt(order.number)}>
                                    Receipt
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={orderShow(order.number)}>Order</Link>
                        </Button>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Item</th>
                                <th className="px-4 py-3 font-medium">Qty</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    Total
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(order.items ?? []).map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {item.product_name}
                                        </div>
                                        <p className="text-muted-foreground">
                                            {item.variant_label} ·{' '}
                                            {item.variant_sku}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.quantity}
                                        {item.returned_quantity > 0 && (
                                            <p className="text-xs text-muted-foreground">
                                                returned {item.returned_quantity}
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

                <div className="rounded-xl border p-5 text-sm">
                    <div className="flex justify-between">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                    </div>
                    {order.refunded_amount > 0 && (
                        <div className="mt-2 flex justify-between text-muted-foreground">
                            <span>Already refunded</span>
                            <span>-{formatPrice(order.refunded_amount)}</span>
                        </div>
                    )}
                </div>

                <AdminReturnForm
                    order={order}
                    paymentMethods={payment_methods}
                    fromReturns
                />

                {!order.is_returnable && (
                    <p className="text-sm text-muted-foreground">
                        Nothing left to return on this sale.
                    </p>
                )}
            </div>
        </>
    );
}

AdminReturnsShow.layout = {
    breadcrumbs: [{ title: 'Returns', href: index() }],
};
