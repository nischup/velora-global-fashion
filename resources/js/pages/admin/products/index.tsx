import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PageLoadingModal, usePageLoader } from '@/components/page-loading-modal';
import { PaginationLinks } from '@/components/pagination-links';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/utils';
import { create, destroy, edit, index } from '@/routes/admin/products';
import type { AdminProductListItem, Paginated } from '@/types';
import { FormEvent } from 'react';

type Props = {
    products: Paginated<AdminProductListItem>;
    filters: { q: string; status: string; stock: string };
};

export default function AdminProductsIndex({ products, filters }: Props) {
    const { loading, showLoader } = usePageLoader();

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const query: Record<string, string> = {};

        for (const [key, value] of data.entries()) {
            if (typeof value === 'string' && value !== '') {
                query[key] = value;
            }
        }

        const hideLoader = showLoader();

        router.get(index.url(), query, {
            preserveState: true,
            replace: true,
            onFinish: hideLoader,
        });
    };

    return (
        <>
            <Head title="Products" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Products"
                        description="Catalog, variants, images, and stock."
                    />
                    <Button asChild>
                        <Link href={create()}>Add product</Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="flex flex-wrap gap-2">
                    <Input
                        name="q"
                        defaultValue={filters.q}
                        placeholder="Search name or SKU"
                        className="max-w-xs"
                    />
                    <select
                        name="status"
                        defaultValue={filters.status}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="live">Live</option>
                        <option value="draft">Draft</option>
                    </select>
                    <select
                        name="stock"
                        defaultValue={filters.stock}
                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                    >
                        <option value="">All stock</option>
                        <option value="low">Low stock</option>
                    </select>
                    <Button type="submit" variant="outline" disabled={loading}>
                        Filter
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Stock</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {(loading || products.data.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-16 text-center text-muted-foreground"
                                    >
                                        {loading
                                            ? null
                                            : 'No products match these filters.'}
                                    </td>
                                </tr>
                            )}
                            {!loading &&
                                products.data.map((product) => (
                                <tr key={product.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 overflow-hidden rounded-md bg-muted">
                                                {product.image_url && (
                                                    <img
                                                        src={product.image_url}
                                                        alt=""
                                                        className="size-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {product.brand?.name ?? 'No brand'} ·{' '}
                                                    {product.variants_count} variants
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.category?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.min_price !== null
                                            ? formatPrice(product.min_price)
                                            : '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {product.total_stock}
                                        {product.low_stock_count > 0 && (
                                            <span className="ml-2 text-xs text-destructive">
                                                {product.low_stock_count} low
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                product.status === 'live'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {product.status}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={edit(product.id)}>Edit</Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Delete ${product.name}?`)) {
                                                    router.delete(destroy.url(product.id));
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
                {!loading && <PaginationLinks paginator={products} />}
            </div>

            <PageLoadingModal open={loading} title="Loading products" />
        </>
    );
}

AdminProductsIndex.layout = {
    breadcrumbs: [{ title: 'Products', href: index() }],
};
