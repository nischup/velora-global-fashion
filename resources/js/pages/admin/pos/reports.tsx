import { Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { index } from '@/routes/admin/pos/reports';
import type { PosRegisterOption, PosShiftSummary } from '@/types';
import type { FormEvent } from 'react';

type MethodRow = {
    method: string;
    label: string;
    sales: number;
    refunds: number;
    net: number;
};

type Props = {
    filters: {
        from: string;
        to: string;
        store_id: number | null;
        register_id: number | null;
    };
    summary: {
        tickets: number;
        gross: number;
        discounts: number;
        tax: number;
        sales: number;
        refunds: number;
        net: number;
    };
    methods: MethodRow[];
    shifts: PosShiftSummary[];
    stores: Array<{ id: number; name: string }>;
    registers: PosRegisterOption[];
};

export default function AdminPosReports({
    filters,
    summary,
    methods,
    shifts,
    stores,
    registers,
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
            <Head title="POS reports" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <Heading
                        title="POS reports"
                        description="Daily sales, VAT, payment mix, and register shifts."
                    />
                    <Button className="print:hidden" onClick={() => window.print()}>
                        Print
                    </Button>
                </div>

                <form
                    onSubmit={submit}
                    className="flex flex-wrap gap-2 print:hidden"
                >
                    <Input
                        type="date"
                        name="from"
                        defaultValue={filters.from}
                        className="w-auto"
                    />
                    <Input
                        type="date"
                        name="to"
                        defaultValue={filters.to}
                        className="w-auto"
                    />
                    <select
                        name="store_id"
                        defaultValue={filters.store_id ?? ''}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All stores</option>
                        {stores.map((store) => (
                            <option key={store.id} value={store.id}>
                                {store.name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="register_id"
                        defaultValue={filters.register_id ?? ''}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All registers</option>
                        {registers.map((register) => (
                            <option key={register.id} value={register.id}>
                                {register.label}
                            </option>
                        ))}
                    </select>
                    <Button type="submit" variant="outline">
                        Apply
                    </Button>
                </form>

                <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
                    <Stat label="Tickets" value={String(summary.tickets)} />
                    <Stat label="Gross" value={formatPrice(summary.gross)} />
                    <Stat
                        label="Discounts"
                        value={formatPrice(summary.discounts)}
                    />
                    <Stat label="VAT" value={formatPrice(summary.tax)} />
                    <Stat label="Sales" value={formatPrice(summary.sales)} />
                    <Stat label="Refunds" value={formatPrice(summary.refunds)} />
                    <Stat label="Net" value={formatPrice(summary.net)} />
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Method</th>
                                <th className="px-4 py-3 font-medium">Sales</th>
                                <th className="px-4 py-3 font-medium">
                                    Refunds
                                </th>
                                <th className="px-4 py-3 font-medium">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.map((method) => (
                                <tr key={method.method} className="border-t">
                                    <td className="px-4 py-3">{method.label}</td>
                                    <td className="px-4 py-3">
                                        {formatPrice(method.sales)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatPrice(method.refunds)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatPrice(method.net)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Shift</th>
                                <th className="px-4 py-3 font-medium">
                                    Cashier
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Opening
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Expected
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Counted
                                </th>
                                <th className="px-4 py-3 font-medium">Diff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shifts.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-muted-foreground"
                                    >
                                        No shifts in this range.
                                    </td>
                                </tr>
                            )}
                            {shifts.map((shift) => (
                                <tr key={shift.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {shift.store?.name} ·{' '}
                                            {shift.register?.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {shift.opened_at}
                                            {shift.closed_at
                                                ? ` – ${shift.closed_at}`
                                                : ' · open'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {shift.cashier_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatPrice(shift.opening_cash)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatPrice(shift.expected_cash)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {shift.counted_cash === null
                                            ? '—'
                                            : formatPrice(shift.counted_cash)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {shift.difference === null
                                            ? '—'
                                            : formatPrice(shift.difference)}
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

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-lg font-medium">{value}</p>
        </div>
    );
}

AdminPosReports.layout = {
    breadcrumbs: [{ title: 'POS reports', href: '/admin/pos/reports' }],
};
