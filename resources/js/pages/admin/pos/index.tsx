import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    Clock3,
    Minus,
    Pause,
    Plus,
    ScanLine,
    Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatPrice } from '@/lib/utils';
import {
    customers as customerSearch,
    exchange,
    index,
    lookup,
    receipt,
    store,
} from '@/routes/admin/pos';
import { destroy as discardHold, store as storeHold } from '@/routes/admin/pos/holds';
import { index as posReports } from '@/routes/admin/pos/reports';
import { store as openShift } from '@/routes/admin/pos/shifts';
import { update as closeShift } from '@/routes/admin/pos/shifts';
import type {
    AdminOrder,
    PaymentMethod,
    PaymentMethodOption,
    PosHoldSummary,
    PosLookupItem,
    PosProduct,
    PosRecentSale,
    PosRegisterOption,
    PosShiftSummary,
    PosVariant,
    StoreCustomer,
} from '@/types';

type TicketLine = {
    variant_id: number;
    product_name: string;
    sku: string;
    barcode: string | null;
    label: string;
    price: number;
    stock: number;
    quantity: number;
    discount: number;
    image_url: string | null;
};

type DiscountType = 'none' | 'amount' | 'percent';

type SplitRow = {
    method: PaymentMethod;
    amount: string;
    tendered: string;
};

type Props = {
    products: PosProduct[];
    filters: { q: string };
    payment_methods: PaymentMethodOption[];
    holds: PosHoldSummary[];
    recent: PosRecentSale[];
    resume: PosHoldSummary | null;
    exchange_order: AdminOrder | null;
    shift: PosShiftSummary | null;
    registers: PosRegisterOption[];
};

export default function AdminPosIndex({
    products,
    filters,
    payment_methods,
    holds,
    recent,
    resume,
    exchange_order,
    shift,
    registers,
}: Props) {
    const skuRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(filters.q);
    const [sku, setSku] = useState('');
    const [scanError, setScanError] = useState('');
    const [ticket, setTicket] = useState<TicketLine[]>([]);
    const [picker, setPicker] = useState<PosProduct | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [storeCustomerId, setStoreCustomerId] = useState<number | null>(null);
    const [matches, setMatches] = useState<StoreCustomer[]>([]);
    const [holdId, setHoldId] = useState<number | null>(null);
    const [discountType, setDiscountType] = useState<DiscountType>('none');
    const [discountValue, setDiscountValue] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
    const [tendered, setTendered] = useState('');
    const [split, setSplit] = useState(false);
    const [splits, setSplits] = useState<SplitRow[]>([
        { method: 'cash', amount: '', tendered: '' },
        { method: 'bkash', amount: '', tendered: '' },
    ]);
    const [notes, setNotes] = useState('');
    const [paying, setPaying] = useState(false);
    const [returnQty, setReturnQty] = useState<Record<number, number>>({});
    const [registerId, setRegisterId] = useState(
        registers[0] ? String(registers[0].id) : '',
    );
    const [openingCash, setOpeningCash] = useState('0');
    const [countedCash, setCountedCash] = useState('');
    const [closeNotes, setCloseNotes] = useState('');
    const [closing, setClosing] = useState(false);

    useEffect(() => {
        skuRef.current?.focus();
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (query === filters.q) {
                return;
            }

            router.get(
                index.url({
                    query: {
                        ...(query ? { q: query } : {}),
                        ...(exchange_order
                            ? { exchange: exchange_order.number }
                            : {}),
                        ...(holdId ? { hold: String(holdId) } : {}),
                    },
                }),
                {},
                { preserveState: true, replace: true },
            );
        }, 250);

        return () => window.clearTimeout(timer);
    }, [query, filters.q, exchange_order, holdId]);

    useEffect(() => {
        if (!resume?.items) {
            return;
        }

        setTicket(
            resume.items.map((item) => ({
                variant_id: item.variant_id,
                product_name: item.product_name,
                sku: item.sku,
                barcode: item.barcode,
                label: item.label,
                price: item.price,
                stock: item.stock,
                quantity: item.quantity,
                discount:
                    item.discount_type === 'amount' ? item.discount_value : 0,
                image_url: item.image_url,
            })),
        );
        setCustomerName(resume.customer_name ?? '');
        setCustomerPhone(resume.customer_phone ?? '');
        setStoreCustomerId(resume.store_customer_id);
        setDiscountType(resume.discount_type);
        setDiscountValue(
            resume.discount_value ? String(resume.discount_value) : '',
        );
        setNotes(resume.notes ?? '');
        setHoldId(resume.id);
    }, [resume]);

    useEffect(() => {
        if (exchange_order?.shipping_name) {
            setCustomerName(exchange_order.shipping_name);
            setCustomerPhone(
                exchange_order.shipping_phone === '—'
                    ? ''
                    : exchange_order.shipping_phone,
            );
        }
    }, [exchange_order]);

    useEffect(() => {
        const phone = customerPhone.trim();

        if (phone.length < 2) {
            setMatches([]);
            return;
        }

        const timer = window.setTimeout(() => {
            void fetch(customerSearch.url({ query: { q: phone } }), {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })
                .then((response) => response.json())
                .then((data: { customers: StoreCustomer[] }) =>
                    setMatches(data.customers ?? []),
                )
                .catch(() => setMatches([]));
        }, 250);

        return () => window.clearTimeout(timer);
    }, [customerPhone]);

    const subtotal = ticket.reduce(
        (sum, line) => sum + line.price * line.quantity,
        0,
    );
    const lineDiscounts = ticket.reduce((sum, line) => sum + line.discount, 0);
    const lineNet = Math.max(subtotal - lineDiscounts, 0);
    const parsedDiscount = Number(discountValue) || 0;
    const orderDiscount = useMemo(() => {
        if (discountType === 'amount') {
            return Math.min(parsedDiscount, lineNet);
        }

        if (discountType === 'percent') {
            return Math.min(lineNet * (parsedDiscount / 100), lineNet);
        }

        return 0;
    }, [discountType, parsedDiscount, lineNet]);
    const merchandiseTotal = Math.max(lineNet - orderDiscount, 0);
    const taxRate = shift?.tax_rate ?? 0;
    const taxAmount = Math.round(merchandiseTotal * (taxRate / 100) * 100) / 100;
    const ticketTotal = Math.round((merchandiseTotal + taxAmount) * 100) / 100;
    const returnCredit = useMemo(() => {
        if (!exchange_order) {
            return 0;
        }

        const lineNetSum = (exchange_order.items ?? []).reduce(
            (sum, item) => sum + item.line_total,
            0,
        );
        const ratio =
            lineNetSum > 0 ? exchange_order.total / lineNetSum : 1;

        return (exchange_order.items ?? []).reduce((sum, item) => {
            const qty = returnQty[item.id] ?? 0;
            const unit = item.line_total / Math.max(item.quantity, 1);
            return sum + unit * qty * ratio;
        }, 0);
    }, [exchange_order, returnQty]);
    const due = Math.max(ticketTotal - returnCredit, 0);
    const leftover = Math.max(returnCredit - ticketTotal, 0);
    const cashGiven = Number(tendered) || 0;
    const change = paymentMethod === 'cash' ? Math.max(cashGiven - due, 0) : 0;
    const splitAllocated = splits.reduce(
        (sum, row) => sum + (Number(row.amount) || 0),
        0,
    );
    const splitRemaining = Math.round((due - splitAllocated) * 100) / 100;
    const splitValid =
        !split ||
        due <= 0 ||
        (Math.abs(splitRemaining) < 0.01 &&
            splits.every((row) => {
                const amount = Number(row.amount) || 0;
                if (amount <= 0) {
                    return true;
                }

                if (row.method !== 'cash') {
                    return true;
                }

                return (Number(row.tendered) || 0) >= amount;
            }));
    const selectedReturns = Object.entries(returnQty)
        .map(([id, quantity]) => ({
            order_item_id: Number(id),
            quantity,
        }))
        .filter((row) => row.quantity > 0);
    const canPay =
        Boolean(shift) &&
        ticket.length > 0 &&
        (!exchange_order || selectedReturns.length > 0) &&
        (due <= 0 ||
            (split
                ? splitValid
                : paymentMethod !== 'cash' || cashGiven >= due)) &&
        !paying;

    const ticketPayload = () =>
        ticket.map((line) => ({
            variant_id: line.variant_id,
            quantity: line.quantity,
            discount_type: line.discount > 0 ? 'amount' : 'none',
            discount_value: line.discount,
        }));

    const paymentPayload = () => {
        if (due <= 0) {
            return {
                payment_method: paymentMethod,
                amount_tendered: null,
                payments: [],
            };
        }

        if (split) {
            const payments = splits
                .filter((row) => (Number(row.amount) || 0) > 0)
                .map((row) => ({
                    method: row.method,
                    amount: Number(row.amount) || 0,
                    amount_tendered:
                        row.method === 'cash'
                            ? Number(row.tendered) || 0
                            : null,
                }));

            return {
                payment_method: payments[0]?.method ?? paymentMethod,
                amount_tendered: payments.find((row) => row.method === 'cash')
                    ?.amount_tendered,
                payments,
            };
        }

        return {
            payment_method: paymentMethod,
            amount_tendered: paymentMethod === 'cash' ? cashGiven : null,
            payments: [
                {
                    method: paymentMethod,
                    amount: due,
                    amount_tendered:
                        paymentMethod === 'cash' ? cashGiven : null,
                },
            ],
        };
    };

    const addVariant = (
        productName: string,
        variant: PosVariant,
        imageUrl: string | null,
    ) => {
        if (!variant.in_stock || variant.stock < 1) {
            setScanError(`${productName} is out of stock.`);
            return;
        }

        setScanError('');
        setTicket((current) => {
            const existing = current.find(
                (line) => line.variant_id === variant.id,
            );

            if (existing) {
                return current.map((line) =>
                    line.variant_id === variant.id
                        ? {
                              ...line,
                              quantity: Math.min(line.stock, line.quantity + 1),
                          }
                        : line,
                );
            }

            return [
                ...current,
                {
                    variant_id: variant.id,
                    product_name: productName,
                    sku: variant.sku,
                    barcode: variant.barcode,
                    label: variant.label,
                    price: variant.price,
                    stock: variant.stock,
                    quantity: 1,
                    discount: 0,
                    image_url: imageUrl,
                },
            ];
        });
        setPicker(null);
        window.setTimeout(() => skuRef.current?.focus(), 0);
    };

    const scanCode = async () => {
        const code = sku.trim();

        if (code === '') {
            return;
        }

        const local = products
            .flatMap((product) =>
                product.variants.map((variant) => ({ product, variant })),
            )
            .find(({ variant }) => {
                const needle = code.toLowerCase();
                return (
                    variant.sku.toLowerCase() === needle ||
                    variant.barcode?.toLowerCase() === needle
                );
            });

        if (local) {
            addVariant(
                local.product.name,
                local.variant,
                local.product.image_url,
            );
            setSku('');
            return;
        }

        const response = await fetch(lookup.url({ query: { code } }), {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
        });

        if (!response.ok) {
            setScanError('No live product matches that SKU or barcode.');
            return;
        }

        const data = (await response.json()) as { item: PosLookupItem };
        addVariant(data.item.product_name, {
            id: data.item.variant_id,
            sku: data.item.sku,
            barcode: data.item.barcode,
            price: data.item.price,
            stock: data.item.stock,
            label: data.item.label,
            in_stock: data.item.in_stock,
        }, data.item.image_url);
        setSku('');
    };

    const setQuantity = (variantId: number, quantity: number) => {
        setTicket((current) =>
            current
                .map((line) =>
                    line.variant_id === variantId
                        ? {
                              ...line,
                              quantity: Math.min(
                                  line.stock,
                                  Math.max(0, quantity),
                              ),
                          }
                        : line,
                )
                .filter((line) => line.quantity > 0),
        );
    };

    const fieldClass =
        'border-velora-gold/30 bg-velora-ivory text-velora-green placeholder:text-velora-forest/40 focus-visible:border-velora-gold focus-visible:ring-velora-gold/25';
    const selectClass =
        'border-velora-gold/30 h-9 rounded-md border bg-velora-ivory px-2 text-sm text-velora-green';
    const ghostBtn =
        'border-velora-gold/35 bg-velora-ivory text-velora-green hover:bg-velora-gold/15 hover:text-velora-green';

    return (
        <>
            <Head title="POS" />
            <div className="flex h-full min-h-0 flex-1 flex-col gap-4 bg-velora-cream p-4 text-velora-green">
                <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-velora-gold/30 bg-velora-green px-5 py-4 text-velora-cream shadow-[0_16px_40px_rgba(13,59,46,0.12)]">
                    <div>
                        <p className="text-[11px] tracking-[0.28em] text-velora-gold uppercase">
                            {exchange_order ? 'Exchange' : 'Boutique counter'}
                        </p>
                        <h1 className="mt-1 text-2xl font-medium tracking-tight">
                            {exchange_order
                                ? `Exchange ${exchange_order.number}`
                                : 'Point of sale'}
                        </h1>
                        <p className="mt-1 max-w-xl text-sm text-velora-cream/70">
                            Scan a SKU or barcode. Park a ticket, save walk-in
                            customers, and reprint receipts.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {shift && (
                            <div className="rounded-xl border border-velora-gold/35 bg-velora-green/40 px-3 py-2 text-xs backdrop-blur-sm">
                                <p className="font-medium text-velora-gold-soft">
                                    {shift.store?.name} · {shift.register?.name}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 text-velora-cream/70">
                                    <Clock3 className="size-3" />
                                    Opened {shift.opened_at} ·{' '}
                                    {formatPrice(shift.expected_cash)}
                                </p>
                            </div>
                        )}
                        <Button
                            variant="outline"
                            className="border-velora-gold/40 bg-transparent text-velora-cream hover:bg-velora-gold/15 hover:text-velora-cream"
                            asChild
                        >
                            <Link href={posReports()}>
                                <BarChart3 className="size-4" />
                                Reports
                            </Link>
                        </Button>
                        {shift && (
                            <Button
                                variant="outline"
                                className="border-velora-gold/40 bg-transparent text-velora-cream hover:bg-velora-gold/15 hover:text-velora-cream"
                                onClick={() => {
                                    setCountedCash(String(shift.expected_cash));
                                    setClosing(true);
                                }}
                            >
                                Close shift
                            </Button>
                        )}
                        {exchange_order && (
                            <Button
                                variant="outline"
                                className="border-velora-gold/40 bg-transparent text-velora-cream hover:bg-velora-gold/15 hover:text-velora-cream"
                                asChild
                            >
                                <Link href={index()}>Cancel exchange</Link>
                            </Button>
                        )}
                    </div>
                </div>

                {(holds.length > 0 || recent.length > 0) && (
                    <div className="grid gap-3 md:grid-cols-2">
                        {holds.length > 0 && (
                            <div className="rounded-2xl border border-velora-gold/25 bg-velora-ivory p-4 shadow-[0_10px_30px_rgba(13,59,46,0.04)]">
                                <p className="flex items-center gap-2 text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                                    <Pause className="size-3.5" />
                                    Parked
                                </p>
                                <div className="mt-3 space-y-2">
                                    {holds.map((hold) => (
                                        <div
                                            key={hold.id}
                                            className="flex items-center justify-between gap-2 rounded-xl bg-velora-cream/80 px-3 py-2 text-sm"
                                        >
                                            <Link
                                                href={index.url({
                                                    query: {
                                                        hold: String(hold.id),
                                                    },
                                                })}
                                                className="hover:text-velora-gold"
                                            >
                                                {hold.customer_name ||
                                                    'Walk-in'}{' '}
                                                · {hold.item_count} items ·{' '}
                                                {hold.held_at}
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-velora-forest/70 hover:bg-velora-gold/15 hover:text-velora-green"
                                                onClick={() =>
                                                    router.delete(
                                                        discardHold.url(
                                                            hold.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                Drop
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {recent.length > 0 && (
                            <div className="rounded-2xl border border-velora-gold/25 bg-velora-ivory p-4 shadow-[0_10px_30px_rgba(13,59,46,0.04)]">
                                <p className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                                    Reprint
                                </p>
                                <div className="mt-3 space-y-2 text-sm">
                                    {recent.map((sale) => (
                                        <Link
                                            key={sale.id}
                                            href={receipt(sale.number)}
                                            className="flex justify-between rounded-xl bg-velora-cream/80 px-3 py-2 transition hover:bg-velora-gold/15"
                                        >
                                            <span>
                                                {sale.number} ·{' '}
                                                {sale.customer_name}
                                            </span>
                                            <span className="text-velora-forest/70">
                                                {formatPrice(sale.total)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {exchange_order && (
                    <div className="rounded-2xl border border-velora-gold/30 bg-velora-ivory p-4">
                        <p className="text-sm font-medium">
                            Returning from {exchange_order.number}
                        </p>
                        <div className="mt-3 space-y-2">
                            {(exchange_order.items ?? [])
                                .filter((item) => item.returnable_quantity > 0)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 text-sm"
                                    >
                                        <div>
                                            <p>{item.product_name}</p>
                                            <p className="text-xs text-velora-forest/60">
                                                left {item.returnable_quantity}
                                            </p>
                                        </div>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={item.returnable_quantity}
                                            className={cn(fieldClass, 'w-20')}
                                            value={returnQty[item.id] ?? 0}
                                            onChange={(event) =>
                                                setReturnQty((current) => ({
                                                    ...current,
                                                    [item.id]: Math.min(
                                                        item.returnable_quantity,
                                                        Math.max(
                                                            0,
                                                            Number(
                                                                event.target
                                                                    .value,
                                                            ) || 0,
                                                        ),
                                                    ),
                                                }))
                                            }
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[1.3fr_0.9fr]">
                    <section className="flex min-h-0 flex-col gap-3">
                        <div className="grid gap-2 md:grid-cols-[1fr_280px]">
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder="Search name, SKU, or barcode"
                                className={fieldClass}
                            />
                            <form
                                className="flex gap-2"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    void scanCode();
                                }}
                            >
                                <div className="relative flex-1">
                                    <ScanLine className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-velora-gold" />
                                    <Input
                                        ref={skuRef}
                                        value={sku}
                                        onChange={(event) =>
                                            setSku(event.target.value)
                                        }
                                        placeholder="Scan SKU or barcode"
                                        className={cn(fieldClass, 'pl-9')}
                                        autoComplete="off"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className={ghostBtn}
                                >
                                    Add
                                </Button>
                            </form>
                        </div>
                        {scanError && (
                            <p className="text-sm text-destructive">
                                {scanError}
                            </p>
                        )}

                        <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 xl:grid-cols-5">
                            {products.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    className="overflow-hidden rounded-xl border border-velora-gold/20 bg-velora-ivory text-left shadow-[0_6px_16px_rgba(13,59,46,0.04)] transition hover:-translate-y-0.5 hover:border-velora-gold/50"
                                    onClick={() => {
                                        const available =
                                            product.variants.filter(
                                                (variant) => variant.in_stock,
                                            );

                                        if (available.length === 1) {
                                            addVariant(
                                                product.name,
                                                available[0],
                                                product.image_url,
                                            );
                                            return;
                                        }

                                        setPicker(product);
                                    }}
                                >
                                    <div className="aspect-square bg-velora-cream">
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-[10px] text-velora-forest/45">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <div className="px-2 py-1.5">
                                        {product.brand && (
                                            <p className="truncate text-[9px] tracking-[0.14em] text-velora-gold uppercase">
                                                {product.brand}
                                            </p>
                                        )}
                                        <p className="mt-0.5 truncate text-xs font-medium leading-tight">
                                            {product.name}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-velora-forest/65">
                                            {formatPrice(
                                                Math.min(
                                                    ...product.variants.map(
                                                        (variant) =>
                                                            variant.price,
                                                    ),
                                                ),
                                            )}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-velora-gold/25 bg-velora-ivory shadow-[0_16px_40px_rgba(13,59,46,0.06)]">
                        <div className="relative border-b border-velora-gold/20 bg-velora-green px-4 py-4 text-velora-cream">
                            <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                                Ticket
                            </p>
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                                <Input
                                    value={customerName}
                                    onChange={(event) =>
                                        setCustomerName(event.target.value)
                                    }
                                    placeholder="Walk-in name"
                                    className="border-velora-gold/30 bg-velora-green/40 text-velora-cream placeholder:text-velora-cream/45 focus-visible:border-velora-gold focus-visible:ring-velora-gold/30"
                                />
                                <Input
                                    value={customerPhone}
                                    onChange={(event) => {
                                        setCustomerPhone(event.target.value);
                                        setStoreCustomerId(null);
                                    }}
                                    placeholder="Phone — saved for next time"
                                    className="border-velora-gold/30 bg-velora-green/40 text-velora-cream placeholder:text-velora-cream/45 focus-visible:border-velora-gold focus-visible:ring-velora-gold/30"
                                />
                            </div>
                            {matches.length > 0 && (
                                <div className="absolute right-4 left-4 z-10 mt-1 overflow-hidden rounded-xl border border-velora-gold/30 bg-velora-ivory text-velora-green shadow-xl">
                                    {matches.map((customer) => (
                                        <button
                                            key={customer.id}
                                            type="button"
                                            className="block w-full px-3 py-2 text-left text-sm hover:bg-velora-gold/15"
                                            onClick={() => {
                                                setCustomerName(customer.name);
                                                setCustomerPhone(
                                                    customer.phone,
                                                );
                                                setStoreCustomerId(customer.id);
                                                setMatches([]);
                                            }}
                                        >
                                            {customer.name} · {customer.phone}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
                            {ticket.length === 0 && (
                                <p className="rounded-xl border border-dashed border-velora-gold/30 px-4 py-8 text-center text-sm text-velora-forest/60">
                                    Scan a barcode or tap a product to start.
                                </p>
                            )}
                            {ticket.map((line) => (
                                <div
                                    key={line.variant_id}
                                    className="flex gap-3 rounded-xl bg-velora-cream/70 p-2"
                                >
                                    <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-velora-cream">
                                        {line.image_url && (
                                            <img
                                                src={line.image_url}
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {line.product_name}
                                        </p>
                                        <p className="text-xs text-velora-forest/60">
                                            {line.label || line.sku} ·{' '}
                                            {formatPrice(line.price)}
                                        </p>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                className={cn(ghostBtn, 'size-7')}
                                                onClick={() =>
                                                    setQuantity(
                                                        line.variant_id,
                                                        line.quantity - 1,
                                                    )
                                                }
                                            >
                                                <Minus className="size-3" />
                                            </Button>
                                            <span className="w-6 text-center text-sm">
                                                {line.quantity}
                                            </span>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                className={cn(ghostBtn, 'size-7')}
                                                disabled={
                                                    line.quantity >= line.stock
                                                }
                                                onClick={() =>
                                                    setQuantity(
                                                        line.variant_id,
                                                        line.quantity + 1,
                                                    )
                                                }
                                            >
                                                <Plus className="size-3" />
                                            </Button>
                                            <Input
                                                type="number"
                                                min={0}
                                                className={cn(fieldClass, 'h-7 w-20')}
                                                value={
                                                    line.discount || ''
                                                }
                                                placeholder="৳ off"
                                                onChange={(event) => {
                                                    const value = Math.min(
                                                        Number(
                                                            event.target
                                                                .value,
                                                        ) || 0,
                                                        line.price *
                                                            line.quantity,
                                                    );
                                                    setTicket((current) =>
                                                        current.map((item) =>
                                                            item.variant_id ===
                                                            line.variant_id
                                                                ? {
                                                                      ...item,
                                                                      discount:
                                                                          value,
                                                                  }
                                                                : item,
                                                        ),
                                                    );
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="ml-auto size-7 text-velora-forest/60 hover:bg-velora-gold/15 hover:text-velora-green"
                                                onClick={() =>
                                                    setTicket((current) =>
                                                        current.filter(
                                                            (item) =>
                                                                item.variant_id !==
                                                                line.variant_id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium">
                                        {formatPrice(
                                            line.price * line.quantity -
                                                line.discount,
                                        )}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 border-t border-velora-gold/20 p-4">
                            <div className="grid grid-cols-[110px_1fr] gap-2">
                                <select
                                    value={discountType}
                                    onChange={(event) =>
                                        setDiscountType(
                                            event.target.value as DiscountType,
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="none">Ticket discount</option>
                                    <option value="amount">৳ off</option>
                                    <option value="percent">% off</option>
                                </select>
                                <Input
                                    type="number"
                                    min={0}
                                    disabled={discountType === 'none'}
                                    value={discountValue}
                                    onChange={(event) =>
                                        setDiscountValue(event.target.value)
                                    }
                                    placeholder="0"
                                    className={fieldClass}
                                />
                            </div>

                            <div className="space-y-1 rounded-xl bg-velora-cream/80 px-3 py-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {lineDiscounts > 0 && (
                                    <div className="flex justify-between text-velora-forest/60">
                                        <span>Line off</span>
                                        <span>
                                            -{formatPrice(lineDiscounts)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between text-velora-forest/60">
                                    <span>Ticket off</span>
                                    <span>-{formatPrice(orderDiscount)}</span>
                                </div>
                                {taxAmount > 0 && (
                                    <div className="flex justify-between text-velora-forest/60">
                                        <span>VAT {taxRate}%</span>
                                        <span>{formatPrice(taxAmount)}</span>
                                    </div>
                                )}
                                {exchange_order && (
                                    <div className="flex justify-between text-velora-forest/60">
                                        <span>Exchange credit</span>
                                        <span>
                                            -{formatPrice(returnCredit)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-velora-gold/25 pt-2 text-lg font-medium">
                                    <span>{due > 0 ? 'Due' : 'Total'}</span>
                                    <span>
                                        {formatPrice(
                                            due > 0 ? due : ticketTotal,
                                        )}
                                    </span>
                                </div>
                                {leftover > 0 && (
                                    <div className="flex justify-between text-sm text-velora-forest">
                                        <span>Refund customer</span>
                                        <span>{formatPrice(leftover)}</span>
                                    </div>
                                )}
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={split}
                                    onChange={(event) =>
                                        setSplit(event.target.checked)
                                    }
                                />
                                Split payment
                            </label>

                            {!split && (
                                <>
                                    <div className="grid grid-cols-3 gap-2">
                                        {payment_methods.map((method) => (
                                            <Button
                                                key={method.value}
                                                type="button"
                                                variant="outline"
                                                className={
                                                    paymentMethod ===
                                                    method.value
                                                        ? 'bg-velora-green text-velora-cream hover:bg-velora-forest hover:text-velora-cream'
                                                        : ghostBtn
                                                }
                                                onClick={() =>
                                                    setPaymentMethod(
                                                        method.value,
                                                    )
                                                }
                                            >
                                                {method.label}
                                            </Button>
                                        ))}
                                    </div>

                                    {paymentMethod === 'cash' && due > 0 && (
                                        <div>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={tendered}
                                                onChange={(event) =>
                                                    setTendered(
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Cash received"
                                                className={fieldClass}
                                            />
                                            <p className="mt-2 text-sm text-velora-forest/65">
                                                Change {formatPrice(change)}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {split && due > 0 && (
                                <div className="space-y-2">
                                    {splits.map((row, index) => (
                                        <div
                                            key={`${row.method}-${index}`}
                                            className="grid grid-cols-[110px_1fr_1fr] gap-2"
                                        >
                                            <select
                                                value={row.method}
                                                onChange={(event) =>
                                                    setSplits((current) =>
                                                        current.map(
                                                            (item, itemIndex) =>
                                                                itemIndex ===
                                                                index
                                                                    ? {
                                                                          ...item,
                                                                          method: event
                                                                              .target
                                                                              .value as PaymentMethod,
                                                                      }
                                                                    : item,
                                                        ),
                                                    )
                                                }
                                                className={selectClass}
                                            >
                                                {payment_methods.map(
                                                    (method) => (
                                                        <option
                                                            key={method.value}
                                                            value={method.value}
                                                        >
                                                            {method.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={row.amount}
                                                placeholder="Amount"
                                                className={fieldClass}
                                                onChange={(event) =>
                                                    setSplits((current) =>
                                                        current.map(
                                                            (item, itemIndex) =>
                                                                itemIndex ===
                                                                index
                                                                    ? {
                                                                          ...item,
                                                                          amount: event
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : item,
                                                        ),
                                                    )
                                                }
                                            />
                                            {row.method === 'cash' ? (
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={row.tendered}
                                                    placeholder="Tendered"
                                                    className={fieldClass}
                                                    onChange={(event) =>
                                                        setSplits((current) =>
                                                            current.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? {
                                                                              ...item,
                                                                              tendered:
                                                                                  event
                                                                                      .target
                                                                                      .value,
                                                                          }
                                                                        : item,
                                                            ),
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <div className="flex items-center text-xs text-velora-forest/55">
                                                    Exact
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <p className="text-xs text-velora-forest/60">
                                        Left to allocate{' '}
                                        {formatPrice(
                                            Math.max(splitRemaining, 0),
                                        )}
                                    </p>
                                </div>
                            )}

                            <Input
                                value={notes}
                                onChange={(event) =>
                                    setNotes(event.target.value)
                                }
                                placeholder="Note (optional)"
                                className={fieldClass}
                            />

                            <div className="grid gap-2 sm:grid-cols-2">
                                {!exchange_order && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={ghostBtn}
                                        disabled={
                                            !shift || ticket.length === 0
                                        }
                                        onClick={() =>
                                            router.post(storeHold.url(), {
                                                items: ticketPayload(),
                                                customer_name:
                                                    customerName || null,
                                                customer_phone:
                                                    customerPhone || null,
                                                store_customer_id:
                                                    storeCustomerId,
                                                hold_id: holdId,
                                                discount_type: discountType,
                                                discount_value:
                                                    discountType === 'none'
                                                        ? 0
                                                        : parsedDiscount,
                                                notes: notes || null,
                                            })
                                        }
                                    >
                                        Park sale
                                    </Button>
                                )}
                                <Button
                                    className="h-11 w-full bg-velora-green text-velora-cream hover:bg-velora-forest"
                                    disabled={!canPay}
                                    onClick={() => {
                                        setPaying(true);
                                        const payload = {
                                            items: ticketPayload(),
                                            customer_name: customerName || null,
                                            customer_phone:
                                                customerPhone || null,
                                            store_customer_id: storeCustomerId,
                                            hold_id: holdId,
                                            discount_type: discountType,
                                            discount_value:
                                                discountType === 'none'
                                                    ? 0
                                                    : parsedDiscount,
                                            notes: notes || null,
                                            ...paymentPayload(),
                                        };

                                        if (exchange_order) {
                                            router.post(
                                                exchange.url(
                                                    exchange_order.number,
                                                ),
                                                {
                                                    ...payload,
                                                    return_items:
                                                        selectedReturns,
                                                    reason: 'Size or style exchange',
                                                },
                                                {
                                                    onFinish: () =>
                                                        setPaying(false),
                                                },
                                            );
                                            return;
                                        }

                                        router.post(store.url(), payload, {
                                            onFinish: () => setPaying(false),
                                        });
                                    }}
                                >
                                    {exchange_order
                                        ? leftover > 0
                                            ? `Refund ${formatPrice(leftover)}`
                                            : `Exchange ${formatPrice(due)}`
                                        : `Charge ${formatPrice(due)}`}
                                </Button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {!shift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-velora-green/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-velora-gold/30 bg-velora-cream p-6 text-velora-green shadow-2xl">
                        <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                            Register
                        </p>
                        <h2 className="mt-1 text-lg font-medium">Open shift</h2>
                        <p className="mt-1 text-sm text-velora-forest/65">
                            Choose a register and count the cash in the drawer
                            before selling.
                        </p>
                        <div className="mt-4 space-y-3">
                            <select
                                value={registerId}
                                onChange={(event) =>
                                    setRegisterId(event.target.value)
                                }
                                className={cn(selectClass, 'w-full')}
                            >
                                {registers.map((register) => (
                                    <option
                                        key={register.id}
                                        value={register.id}
                                    >
                                        {register.label}
                                    </option>
                                ))}
                            </select>
                            <Input
                                type="number"
                                min={0}
                                value={openingCash}
                                onChange={(event) =>
                                    setOpeningCash(event.target.value)
                                }
                                placeholder="Opening cash"
                                className={fieldClass}
                            />
                            <Button
                                className="h-11 w-full bg-velora-green text-velora-cream hover:bg-velora-forest"
                                disabled={!registerId}
                                onClick={() =>
                                    router.post(openShift.url(), {
                                        register_id: Number(registerId),
                                        opening_cash: Number(openingCash) || 0,
                                    })
                                }
                            >
                                Open shift
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {closing && shift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-velora-green/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-velora-gold/30 bg-velora-cream p-6 text-velora-green shadow-2xl">
                        <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                            End of day
                        </p>
                        <h2 className="mt-1 text-lg font-medium">Close shift</h2>
                        <p className="mt-1 text-sm text-velora-forest/65">
                            Expected cash {formatPrice(shift.expected_cash)}
                        </p>
                        <div className="mt-4 space-y-3">
                            <Input
                                type="number"
                                min={0}
                                value={countedCash}
                                onChange={(event) =>
                                    setCountedCash(event.target.value)
                                }
                                placeholder="Counted cash"
                                className={fieldClass}
                            />
                            <Input
                                value={closeNotes}
                                onChange={(event) =>
                                    setCloseNotes(event.target.value)
                                }
                                placeholder="Note (optional)"
                                className={fieldClass}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className={ghostBtn}
                                    onClick={() => setClosing(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-velora-green text-velora-cream hover:bg-velora-forest"
                                    onClick={() =>
                                        router.patch(
                                            closeShift.url(shift.id),
                                            {
                                                counted_cash:
                                                    Number(countedCash) || 0,
                                                notes: closeNotes || null,
                                            },
                                        )
                                    }
                                >
                                    Close shift
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {picker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-velora-green/55 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-velora-gold/30 bg-velora-cream p-6 text-velora-green shadow-2xl">
                        <h2 className="text-lg font-medium">{picker.name}</h2>
                        <p className="mt-1 text-sm text-velora-forest/65">
                            Choose a size or colour.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {picker.variants.map((variant) => (
                                <Button
                                    key={variant.id}
                                    type="button"
                                    variant="outline"
                                    className={ghostBtn}
                                    disabled={!variant.in_stock}
                                    onClick={() =>
                                        addVariant(
                                            picker.name,
                                            variant,
                                            picker.image_url,
                                        )
                                    }
                                >
                                    {variant.label || variant.sku} ·{' '}
                                    {formatPrice(variant.price)}
                                </Button>
                            ))}
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            className="mt-4 text-velora-forest/70 hover:bg-velora-gold/15 hover:text-velora-green"
                            onClick={() => setPicker(null)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

AdminPosIndex.layout = {
    breadcrumbs: [{ title: 'POS', href: '/admin/pos' }],
};
