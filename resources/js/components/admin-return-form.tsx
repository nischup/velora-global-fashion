import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { store as storeReturn } from '@/routes/admin/orders/returns';
import type { AdminOrder, PaymentMethodOption } from '@/types';

type Props = {
    order: AdminOrder;
    paymentMethods: PaymentMethodOption[];
    fromPos?: boolean;
    fromReturns?: boolean;
};

export function AdminReturnForm({
    order,
    paymentMethods,
    fromPos = false,
    fromReturns = false,
}: Props) {
    const returnable = (order.items ?? []).filter(
        (item) => item.returnable_quantity > 0,
    );
    const [quantities, setQuantities] = useState<Record<number, number>>(() =>
        Object.fromEntries(returnable.map((item) => [item.id, 0])),
    );
    const [refundMethod, setRefundMethod] = useState(
        order.payment_method ?? 'cash',
    );
    const [reason, setReason] = useState('');

    const selected = useMemo(
        () =>
            returnable
                .map((item) => ({
                    item,
                    quantity: quantities[item.id] ?? 0,
                }))
                .filter((row) => row.quantity > 0),
        [quantities, returnable],
    );

    const ratio =
        order.subtotal > 0 ? order.total / order.subtotal : 1;
    const refundEstimate = selected.reduce(
        (sum, row) => sum + row.item.unit_price * row.quantity * ratio,
        0,
    );

    if (!order.is_returnable || returnable.length === 0) {
        return null;
    }

    return (
        <form
            className="space-y-4 rounded-xl border p-5"
            onSubmit={(event) => {
                event.preventDefault();

                if (selected.length === 0) {
                    return;
                }

                router.post(storeReturn.url(order.number), {
                    items: selected.map((row) => ({
                        order_item_id: row.item.id,
                        quantity: row.quantity,
                    })),
                    refund_method: refundMethod,
                    reason: reason || null,
                    from_pos: fromPos,
                    from_returns: fromReturns,
                });
            }}
        >
            <div>
                <h2 className="text-sm font-medium">Return items</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Stock comes back, and the refund follows any discount on
                    the original sale.
                </p>
            </div>

            <div className="space-y-3">
                {returnable.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3"
                    >
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {item.product_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.variant_label} · left{' '}
                                {item.returnable_quantity}
                            </p>
                        </div>
                        <Input
                            type="number"
                            min={0}
                            max={item.returnable_quantity}
                            className="w-20"
                            value={quantities[item.id] ?? 0}
                            onChange={(event) =>
                                setQuantities((current) => ({
                                    ...current,
                                    [item.id]: Math.min(
                                        item.returnable_quantity,
                                        Math.max(
                                            0,
                                            Number(event.target.value) || 0,
                                        ),
                                    ),
                                }))
                            }
                        />
                    </div>
                ))}
            </div>

            <label className="block text-sm">
                Refund method
                <select
                    value={refundMethod}
                    onChange={(event) => setRefundMethod(event.target.value)}
                    className="border-input mt-1 h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                >
                    {paymentMethods.map((method) => (
                        <option key={method.value} value={method.value}>
                            {method.label}
                        </option>
                    ))}
                </select>
            </label>

            <label className="block text-sm">
                Reason
                <Input
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Optional"
                    className="mt-1"
                />
            </label>

            <div className="flex items-center justify-between text-sm font-medium">
                <span>Refund</span>
                <span>{formatPrice(refundEstimate)}</span>
            </div>

            <Button type="submit" disabled={selected.length === 0}>
                Confirm return
            </Button>
        </form>
    );
}
