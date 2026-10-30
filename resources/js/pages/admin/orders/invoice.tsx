import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { show as orderShow } from '@/routes/admin/orders';
import type { AdminOrder } from '@/types';

type Props = {
    order: AdminOrder;
};

const printCss = `
.invoice-print-app {
    min-height: 100vh;
    background: #e8e4dc;
    color: #0d3b2e;
}

.invoice-print-toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px;
    background: #fbf7ef;
    border-bottom: 1px solid rgba(196, 161, 90, 0.35);
}

.invoice-a4 {
    width: 210mm;
    min-height: 297mm;
    margin: 24px auto;
    padding: 16mm 18mm;
    background: #fff;
    color: #0d3b2e;
    box-shadow: 0 16px 40px rgba(13, 59, 46, 0.12);
    box-sizing: border-box;
    font-family: "Segoe UI", Arial, "Nirmala UI", sans-serif;
}

.invoice-a4 * {
    color: inherit;
}

.invoice-table {
    width: 100%;
    border-collapse: collapse;
}

.invoice-table th {
    text-align: left;
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #0d3b2e;
    border-bottom: 1px solid #c4a15a;
    padding: 8px 0;
}

.invoice-table td {
    padding: 10px 0;
    border-bottom: 1px solid rgba(13, 59, 46, 0.12);
    font-size: 13px;
    vertical-align: top;
}

.invoice-table .num {
    text-align: right;
    white-space: nowrap;
}

.invoice-a4 img {
    display: block;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.invoice-logo {
    height: 56px;
    width: auto;
    background: #fff;
}

.invoice-item-photo {
    width: 48px;
    height: 48px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid rgba(196, 161, 90, 0.35);
    background: #f7f1e4;
}

.invoice-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

@media print {
    @page {
        size: A4 portrait;
        margin: 12mm;
    }

    html,
    body,
    #app {
        width: auto !important;
        min-width: 0 !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
        overflow: visible !important;
    }

    .invoice-print-app {
        min-height: 0;
        background: #fff !important;
    }

    .invoice-print-toolbar,
    [data-sonner-toaster] {
        display: none !important;
    }

    .invoice-a4 {
        width: auto;
        min-height: 0;
        margin: 0;
        padding: 0;
        box-shadow: none;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .invoice-a4 img {
        display: block !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
`;

export default function AdminOrderInvoice({ order }: Props) {
    const { name } = usePage().props;
    const items = order.items ?? [];

    return (
        <>
            <Head title={`Invoice ${order.number}`} />
            <style>{printCss}</style>
            <div className="invoice-print-app">
                <div className="invoice-print-toolbar">
                    <div>
                        <p className="text-sm font-medium">A4 invoice</p>
                        <p className="text-muted-foreground text-xs">
                            {order.number} · print on A4, margins None or
                            Default, headers off.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => window.print()}>Print</Button>
                        <Button variant="outline" asChild>
                            <Link href={orderShow(order.number)}>
                                Back to order
                            </Link>
                        </Button>
                    </div>
                </div>

                <article className="invoice-a4">
                    <div className="flex items-start justify-between gap-6 border-b border-[#C4A15A] pb-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="/images/logo.png"
                                alt=""
                                className="invoice-logo"
                            />
                            <div>
                                <p className="text-lg font-semibold tracking-[0.18em] uppercase">
                                    {name}
                                </p>
                                <p className="mt-1 text-xs tracking-[0.16em] text-[#0D3B2E]/70 uppercase">
                                    Invoice
                                </p>
                            </div>
                        </div>
                        <div className="text-right text-sm">
                            <p className="text-xl font-semibold">
                                {order.number}
                            </p>
                            <p className="mt-1 text-[#0D3B2E]/70">
                                {order.placed_at}
                            </p>
                            <p className="mt-1 text-[#0D3B2E]/70">
                                {order.source_label} · {order.status_label}
                            </p>
                        </div>
                    </div>

                    <section className="mt-8 grid grid-cols-2 gap-8 text-sm">
                        <div>
                            <p className="text-[10px] tracking-[0.18em] text-[#C4A15A] uppercase">
                                Bill to
                            </p>
                            <p className="mt-2 font-medium">
                                {order.customer.name}
                            </p>
                            {order.customer.email !== 'Walk-in' && (
                                <p className="text-[#0D3B2E]/70">
                                    {order.customer.email}
                                </p>
                            )}
                            <p className="text-[#0D3B2E]/70">
                                {order.shipping_phone}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] tracking-[0.18em] text-[#C4A15A] uppercase">
                                {order.source === 'pos' ? 'Sale' : 'Ship to'}
                            </p>
                            <p className="mt-2 font-medium">
                                {order.shipping_name}
                            </p>
                            {order.source !== 'pos' && (
                                <p className="text-[#0D3B2E]/70">
                                    {order.shipping_address}
                                    <br />
                                    {order.shipping_city}
                                </p>
                            )}
                            {order.source === 'pos' && (
                                <p className="text-[#0D3B2E]/70">In-store</p>
                            )}
                        </div>
                    </section>

                    <table className="invoice-table mt-8">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th className="num">Qty</th>
                                <th className="num">Price</th>
                                <th className="num">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="invoice-item">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt=""
                                                    className="invoice-item-photo"
                                                />
                                            ) : null}
                                            <div>
                                                <p className="font-medium">
                                                    {item.product_name}
                                                </p>
                                                <p className="text-xs text-[#0D3B2E]/60">
                                                    {[
                                                        item.variant_label,
                                                        item.variant_sku,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="num">{item.quantity}</td>
                                    <td className="num">
                                        {formatPrice(item.unit_price)}
                                    </td>
                                    <td className="num font-medium">
                                        {formatPrice(item.line_total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <section className="mt-8 ml-auto w-[260px] text-sm">
                        <div className="flex justify-between py-1">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between py-1 text-[#0D3B2E]/70">
                                <span>Discount</span>
                                <span>
                                    -{formatPrice(order.discount_amount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between py-1 text-[#0D3B2E]/70">
                            <span>Shipping</span>
                            <span>
                                {order.source === 'pos' ||
                                order.shipping_amount === 0
                                    ? 'Free'
                                    : formatPrice(order.shipping_amount)}
                            </span>
                        </div>
                        {order.tax_amount > 0 && (
                            <div className="flex justify-between py-1 text-[#0D3B2E]/70">
                                <span>VAT {order.tax_rate}%</span>
                                <span>{formatPrice(order.tax_amount)}</span>
                            </div>
                        )}
                        <div className="mt-2 flex justify-between border-t border-[#C4A15A] pt-3 text-base font-semibold">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                        {order.payment_method_label && (
                            <p className="mt-2 text-xs text-[#0D3B2E]/70">
                                Paid by {order.payment_method_label}
                            </p>
                        )}
                        {order.refunded_amount > 0 && (
                            <p className="mt-2 text-xs text-[#0D3B2E]/70">
                                Refunded {formatPrice(order.refunded_amount)}
                            </p>
                        )}
                    </section>

                    {order.notes && (
                        <p className="mt-8 text-sm text-[#0D3B2E]/70">
                            Notes: {order.notes}
                        </p>
                    )}

                    <footer className="mt-16 border-t border-[#C4A15A]/50 pt-4 text-center text-[11px] tracking-[0.16em] text-[#0D3B2E]/60 uppercase">
                        Thank you for shopping at {name}
                    </footer>
                </article>
            </div>
        </>
    );
}
