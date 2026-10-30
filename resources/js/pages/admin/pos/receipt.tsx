import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { show as orderShow } from '@/routes/admin/orders';
import { index as posIndex } from '@/routes/admin/pos';
import { show as returnShow } from '@/routes/admin/returns';
import type { AdminOrder } from '@/types';

type Props = {
    order: AdminOrder;
};

const thermalPrintCss = `
.thermal-receipt {
    width: 58mm;
    box-sizing: border-box;
    padding: 3mm 5mm 8mm;
    background: #fff;
    color: #000;
    font-family: "Segoe UI", Arial, "Nirmala UI", sans-serif;
    font-size: 12px;
    line-height: 1.35;
    overflow-wrap: anywhere;
}

.thermal-receipt * {
    color: #000;
}

@media print {
    @page {
        size: 58mm auto;
        margin: 0;
    }

    html,
    body,
    #app {
        width: 58mm !important;
        min-width: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
        overflow: visible !important;
    }

    .thermal-screen {
        min-height: 0 !important;
        width: 58mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
    }

    .thermal-receipt {
        width: 58mm !important;
        max-width: 58mm !important;
        margin: 0 !important;
        box-shadow: none !important;
    }

    [data-sonner-toaster] {
        display: none !important;
    }
}
`;

function phoneLine(phone: string | null | undefined): string | null {
    if (!phone || phone === '—') {
        return null;
    }

    return phone;
}

export default function AdminPosReceipt({ order }: Props) {
    const phone = phoneLine(order.shipping_phone);

    return (
        <>
            <Head title={`Receipt ${order.number}`} />
            <style>{thermalPrintCss}</style>
            <div className="thermal-screen min-h-screen bg-neutral-200 px-4 py-8 text-foreground">
                <div className="mx-auto flex max-w-xl flex-wrap gap-2 print:hidden">
                    <Button onClick={() => window.print()}>Print</Button>
                    <Button variant="outline" asChild>
                        <Link href={posIndex()}>New sale</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={orderShow(order.number)}>Open order</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={returnShow(order.number)}>Return</Link>
                    </Button>
                </div>
                <p className="mx-auto mt-3 max-w-xl text-xs text-neutral-600 print:hidden">
                    Deli ES420 uses 58mm paper (48mm print width). In the print
                    dialog set paper to 58 mm, margins to None, scale to 100%,
                    and turn headers and footers off.
                </p>

                <article className="thermal-receipt mx-auto mt-6 shadow-md print:mt-0 print:shadow-none">
                    <div className="text-center">
                        <p className="text-[12px] font-semibold leading-tight">
                            Velora Global Fashion
                        </p>
                        <p className="mt-1 text-[13px] font-semibold">
                            Receipt
                        </p>
                        <p className="mt-1">{order.number}</p>
                        <p>{order.placed_at}</p>
                    </div>

                    <div className="my-2 border-t border-dashed border-black" />

                    <p className="font-semibold">{order.customer.name}</p>
                    <p>{phone ? `${phone} · Walk-in` : 'Walk-in'}</p>
                    {order.store_name && (
                        <p>
                            {order.store_name}
                            {order.register_name
                                ? ` · ${order.register_name}`
                                : ''}
                        </p>
                    )}
                    {order.cashier && <p>Sold by {order.cashier.name}</p>}

                    <div className="my-2 border-t border-dashed border-black" />

                    <div className="space-y-2">
                        {(order.items ?? []).map((item) => (
                            <div key={item.id}>
                                <p className="font-semibold">
                                    {item.product_name}
                                </p>
                                {(item.variant_label || item.variant_sku) && (
                                    <p className="text-[11px]">
                                        {[item.variant_label, item.variant_sku]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                )}
                                <div className="flex items-baseline justify-between gap-2">
                                    <span>
                                        {item.quantity} ×{' '}
                                        {formatPrice(item.unit_price)}
                                    </span>
                                    <span className="shrink-0 font-semibold">
                                        {formatPrice(item.line_total)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="my-2 border-t border-dashed border-black" />

                    <div className="space-y-0.5">
                        <div className="flex justify-between gap-2">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between gap-2">
                                <span>Discount</span>
                                <span>
                                    -{formatPrice(order.discount_amount)}
                                </span>
                            </div>
                        )}
                        {order.tax_amount > 0 && (
                            <div className="flex justify-between gap-2">
                                <span>VAT {order.tax_rate}%</span>
                                <span>{formatPrice(order.tax_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between gap-2 text-[13px] font-bold">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                        {(order.payments ?? []).filter((payment) => payment.type === 'sale').length > 0
                            ? (order.payments ?? [])
                                  .filter((payment) => payment.type === 'sale')
                                  .map((payment) => (
                                      <div
                                          key={payment.id}
                                          className="flex justify-between gap-2"
                                      >
                                          <span>{payment.method_label}</span>
                                          <span>
                                              {formatPrice(
                                                  payment.amount_tendered ??
                                                      payment.amount,
                                              )}
                                          </span>
                                      </div>
                                  ))
                            : (
                                <div className="flex justify-between gap-2">
                                    <span>{order.payment_method_label}</span>
                                    <span>
                                        {formatPrice(
                                            order.amount_tendered ??
                                                order.total,
                                        )}
                                    </span>
                                </div>
                            )}
                        {(order.change_due ?? 0) > 0 && (
                            <div className="flex justify-between gap-2">
                                <span>Change</span>
                                <span>{formatPrice(order.change_due)}</span>
                            </div>
                        )}
                        {order.refunded_amount > 0 && (
                            <div className="flex justify-between gap-2">
                                <span>Refunded</span>
                                <span>
                                    -{formatPrice(order.refunded_amount)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="my-2 border-t border-dashed border-black" />

                    <p className="text-center text-[11px]">
                        Thank you for shopping at
                        <br />
                        Velora Global Fashion
                    </p>
                </article>

            </div>
        </>
    );
}
