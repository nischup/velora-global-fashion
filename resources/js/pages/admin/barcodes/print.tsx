import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { index as barcodesIndex } from '@/routes/admin/barcodes';
import type { AdminBarcodeVariant } from '@/types';

type Props = {
    labels: AdminBarcodeVariant[];
    copies: number;
};

const printCss = `
.barcode-print-app {
    min-height: 100vh;
    background: #e8e4dc;
    color: #0d3b2e;
}

.barcode-print-toolbar {
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

.barcode-a4 {
    width: 210mm;
    min-height: 297mm;
    margin: 24px auto;
    padding: 8mm;
    background: #fff;
    box-shadow: 0 16px 40px rgba(13, 59, 46, 0.12);
}

.barcode-print-sheet {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 35.125mm;
    width: 194mm;
}

.barcode-label {
    box-sizing: border-box;
    height: 35.125mm;
    padding: 2.2mm 2.4mm 1.8mm;
    overflow: hidden;
    border: 0.3pt dashed #c4a15a;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    break-inside: avoid;
    page-break-inside: avoid;
    color: #0d3b2e;
    background: #fff;
}

.barcode-label svg {
    width: 100%;
    height: 12mm;
    display: block;
}

.barcode-label svg rect {
    fill: #000 !important;
}

@media print {
    @page {
        size: A4 portrait;
        margin: 8mm;
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

    .barcode-print-app {
        min-height: 0;
        background: #fff !important;
    }

    .barcode-print-toolbar,
    [data-sonner-toaster] {
        display: none !important;
    }

    .barcode-a4 {
        width: 194mm;
        min-height: 0;
        margin: 0;
        padding: 0;
        box-shadow: none;
    }

    .barcode-print-sheet {
        width: 194mm;
    }

    .barcode-label {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
}
`;

export default function AdminBarcodePrint({ labels }: Props) {
    return (
        <>
            <Head title="Print barcode labels" />
            <style>{printCss}</style>
            <div className="barcode-print-app">
                <div className="barcode-print-toolbar">
                    <div>
                        <p className="text-sm font-medium">A4 barcode sheet</p>
                        <p className="text-xs text-muted-foreground">
                            {labels.length} label
                            {labels.length === 1 ? '' : 's'} · 3 columns · print
                            on A4
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={barcodesIndex()}>Back</Link>
                        </Button>
                        <Button onClick={() => window.print()}>Print</Button>
                    </div>
                </div>

                {labels.length === 0 ? (
                    <p className="p-8 text-sm text-muted-foreground">
                        No barcodes to print. Generate codes first.
                    </p>
                ) : (
                    <div className="barcode-a4">
                        <div className="barcode-print-sheet">
                            {labels.map((label, index) => (
                                <article
                                    key={`${label.id}-${index}`}
                                    className="barcode-label"
                                >
                                    <div>
                                        <p className="text-[8px] tracking-[0.22em] text-[#c4a15a] uppercase">
                                            Velora
                                        </p>
                                        <p className="mt-0.5 truncate text-[11px] font-medium leading-tight">
                                            {label.product_name}
                                        </p>
                                        <p className="truncate text-[10px] text-[#164a38]/75">
                                            {label.label || label.sku} ·{' '}
                                            {formatPrice(label.price)}
                                        </p>
                                    </div>
                                    {label.barcode_svg && (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: label.barcode_svg,
                                            }}
                                        />
                                    )}
                                    <p className="text-center font-mono text-[10px] tracking-widest">
                                        {label.barcode}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
