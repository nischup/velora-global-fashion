import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { PageLoadingModal, usePageLoader } from '@/components/page-loading-modal';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { generate, index, print as printLabels } from '@/routes/admin/barcodes';
import { edit as editProduct } from '@/routes/admin/products';
import type { AdminBarcodeVariant, Paginated } from '@/types';
import type { FormEvent } from 'react';

const MAX_COPIES = 500;

type Props = {
    variants: Paginated<AdminBarcodeVariant>;
    filters: { q: string; status: string };
    missing_count: number;
};

export default function AdminBarcodesIndex({
    variants,
    filters,
    missing_count,
}: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const [copies, setCopies] = useState(1);
    const { loading, showLoader } = usePageLoader();
    const pageIds = useMemo(
        () => variants.data.map((variant) => variant.id),
        [variants.data],
    );
    const allSelected =
        pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
    const selectedRows = variants.data.filter((variant) =>
        selected.includes(variant.id),
    );
    const selectedMissing = selectedRows.filter(
        (variant) => !variant.barcode,
    ).length;
    const selectedReady = selectedRows.filter(
        (variant) => variant.barcode,
    ).length;

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

    const toggle = (id: number) => {
        setSelected((current) =>
            current.includes(id)
                ? current.filter((item) => item !== id)
                : [...current, id],
        );
    };

    const generateBarcodes = (ids: number[] = []) => {
        router.post(
            generate.url(),
            { variant_ids: ids },
            { preserveScroll: true, onSuccess: () => setSelected([]) },
        );
    };

    const printSelected = () => {
        const ids = selectedRows
            .filter((variant) => variant.barcode)
            .map((variant) => variant.id);

        if (ids.length === 0) {
            return;
        }

        router.get(
            printLabels.url({
                query: {
                    ids: ids.join(','),
                    copies: String(copies),
                },
            }),
        );
    };

    return (
        <>
            <Head title="Barcodes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Barcodes"
                        description="Generate unique codes, then print stickers to put on garments."
                    />
                    {missing_count > 0 && (
                        <Badge variant="secondary">
                            {missing_count} missing
                        </Badge>
                    )}
                </div>

                <form onSubmit={submit} className="flex flex-wrap gap-2">
                    <Input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Search name, SKU, or barcode"
                        className="max-w-xs"
                    />
                    <select
                        name="status"
                        defaultValue={filters.status}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All variants</option>
                        <option value="missing">Missing barcode</option>
                        <option value="ready">Ready to print</option>
                    </select>
                    <Button type="submit" variant="outline" disabled={loading}>
                        Filter
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => generateBarcodes()}
                        disabled={missing_count === 0}
                    >
                        Generate missing
                    </Button>
                </form>

                {!loading && selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
                        <p className="text-sm">{selected.length} selected</p>
                        {selectedMissing > 0 && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => generateBarcodes(selected)}
                            >
                                Generate selected
                            </Button>
                        )}
                        <label className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Copies</span>
                            <Input
                                type="number"
                                min={1}
                                max={MAX_COPIES}
                                value={copies}
                                onChange={(event) =>
                                    setCopies(
                                        Math.min(
                                            MAX_COPIES,
                                            Math.max(
                                                1,
                                                Number(event.target.value) || 1,
                                            ),
                                        ),
                                    )
                                }
                                className="w-24"
                                aria-label="Copies per label"
                            />
                        </label>
                        <Button
                            size="sm"
                            onClick={printSelected}
                            disabled={selectedReady === 0}
                        >
                            Print labels
                        </Button>
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={() =>
                                            setSelected(
                                                allSelected ? [] : pageIds,
                                            )
                                        }
                                        aria-label="Select page"
                                    />
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Product
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Variant
                                </th>
                                <th className="px-4 py-3 font-medium">SKU</th>
                                <th className="px-4 py-3 font-medium">
                                    Barcode
                                </th>
                                <th className="px-4 py-3 font-medium">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(loading || variants.data.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-16 text-center text-muted-foreground"
                                    >
                                        {loading
                                            ? null
                                            : 'No variants match these filters.'}
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                variants.data.map((variant) => (
                                <tr key={variant.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(
                                                variant.id,
                                            )}
                                            onChange={() => toggle(variant.id)}
                                            aria-label={`Select ${variant.product_name}`}
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={editProduct(variant.product_id)}
                                            className="font-medium hover:underline"
                                        >
                                            {variant.product_name}
                                        </Link>
                                        {variant.brand && (
                                            <p className="text-xs text-muted-foreground">
                                                {variant.brand}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {variant.label || '—'}
                                    </td>
                                    <td className="px-4 py-3">{variant.sku}</td>
                                    <td className="px-4 py-3">
                                        {variant.barcode ?? (
                                            <span className="text-muted-foreground">
                                                Missing
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {formatPrice(variant.price)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && <PaginationLinks paginator={variants} />}
            </div>

            <PageLoadingModal open={loading} title="Loading barcodes" />
        </>
    );
}

AdminBarcodesIndex.layout = {
    breadcrumbs: [{ title: 'Barcodes', href: index() }],
};
