import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/sales';

type SaleRow = {
    id: number;
    name: string;
    percent: number;
    applies_to: 'all' | 'selected';
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    is_running: boolean;
    products_count: number;
    products: { id: number; name: string }[];
};

export default function AdminSalesIndex({ sales }: { sales: SaleRow[] }) {
    return (
        <>
            <Head title="Sales" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Sales"
                        description="Winter, summer, or selected-item percent off. Original prices stay."
                    />
                    <Button asChild>
                        <Link href={create()}>New sale</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Off</th>
                                <th className="px-4 py-3 font-medium">Applies</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 && (
                                <tr>
                                    <td
                                        className="text-muted-foreground px-4 py-8"
                                        colSpan={5}
                                    >
                                        No sales yet. Add a winter or summer
                                        sale to discount the catalog.
                                    </td>
                                </tr>
                            )}
                            {sales.map((sale) => (
                                <tr key={sale.id} className="border-t">
                                    <td className="px-4 py-3 font-medium">
                                        {sale.name}
                                    </td>
                                    <td className="px-4 py-3">{sale.percent}%</td>
                                    <td className="px-4 py-3">
                                        {sale.applies_to === 'all' ? (
                                            <span>All products</span>
                                        ) : sale.products.length === 0 ? (
                                            <span className="text-muted-foreground">
                                                No products
                                            </span>
                                        ) : (
                                            <div className="flex max-w-xl flex-wrap gap-1">
                                                {sale.products.map((product) => (
                                                    <Badge
                                                        key={product.id}
                                                        variant="outline"
                                                    >
                                                        {product.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                sale.is_running
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {sale.is_running
                                                ? 'Live'
                                                : sale.is_active
                                                  ? 'Scheduled'
                                                  : 'Off'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={edit(sale.id)}>Edit</Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete ${sale.name}?`,
                                                    )
                                                ) {
                                                    router.delete(
                                                        destroy.url(sale.id),
                                                    );
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
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

AdminSalesIndex.layout = {
    breadcrumbs: [{ title: 'Sales', href: index() }],
};
