import { Head, Link, router } from '@inertiajs/react';
import { PaginationLinks } from '@/components/pagination-links';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index as shopIndex, category as shopCategory } from '@/routes/shop';
import type {
    BrandSummary,
    CategorySummary,
    Paginated,
    ProductCard as ProductCardType,
} from '@/types';
import { FormEvent } from 'react';

type Filters = {
    q: string;
    brand: number | null;
    min_price: number | null;
    max_price: number | null;
    in_stock: boolean;
    sort: string;
};

type Props = {
    products: Paginated<ProductCardType>;
    category: CategorySummary | null;
    brands: BrandSummary[];
    filters: Filters;
};

export default function ShopIndex({
    products,
    category,
    brands,
    filters,
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

        router.get(category ? shopCategory.url(category.slug) : shopIndex.url(), query, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title={category ? category.name : 'Shop'} />

            <div className="mx-auto max-w-6xl px-4 py-10">
                <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                    {category ? 'Category' : 'Catalog'}
                </p>
                <h1 className="mt-2 text-3xl tracking-tight">
                    {category?.name ?? 'All products'}
                </h1>
                {category?.description && (
                    <p className="mt-2 max-w-2xl text-muted-foreground">
                        {category.description}
                    </p>
                )}

                {category?.children && category.children.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {category.children.map((child) => (
                            <Link
                                key={child.id}
                                href={shopCategory(child.slug)}
                                className="border px-3 py-1 text-xs tracking-[0.16em] uppercase hover:bg-muted"
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                )}

                <form
                    onSubmit={submit}
                    className="mt-8 grid gap-3 border p-4 md:grid-cols-6"
                >
                    <div className="md:col-span-2">
                        <Label htmlFor="q">Search</Label>
                        <Input
                            id="q"
                            name="q"
                            defaultValue={filters.q}
                            placeholder="Dress, linen, SKU..."
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="brand">Brand</Label>
                        <select
                            id="brand"
                            name="brand"
                            defaultValue={filters.brand ?? ''}
                            className="border-input mt-1 h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                        >
                            <option value="">All</option>
                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="min_price">Min price</Label>
                        <Input
                            id="min_price"
                            name="min_price"
                            type="number"
                            min={0}
                            defaultValue={filters.min_price ?? ''}
                            className="mt-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="max_price">Max price</Label>
                        <Input
                            id="max_price"
                            name="max_price"
                            type="number"
                            min={0}
                            defaultValue={filters.max_price ?? ''}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="in_stock"
                                value="1"
                                defaultChecked={filters.in_stock}
                            />
                            In stock
                        </label>
                        <select
                            name="sort"
                            defaultValue={filters.sort}
                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            <option value="latest">Latest</option>
                            <option value="name">Name</option>
                            <option value="price_asc">Price: low</option>
                            <option value="price_desc">Price: high</option>
                        </select>
                    </div>
                    <div className="flex items-end md:col-span-6">
                        <Button type="submit">Filter</Button>
                    </div>
                </form>

                {products.data.length === 0 ? (
                    <p className="mt-12 text-muted-foreground">
                        No products match these filters.
                    </p>
                ) : (
                    <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                <div className="mt-10">
                    <PaginationLinks paginator={products} />
                </div>
            </div>
        </>
    );
}
