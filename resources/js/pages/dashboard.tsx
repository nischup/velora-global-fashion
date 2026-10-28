import { Head, Link } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as productsIndex } from '@/routes/admin/products';
import { home } from '@/routes';

type Stats = {
    products: number;
    live_products: number;
    low_stock: number;
    categories: number;
    orders: number;
};

export default function Dashboard({ stats }: { stats: Stats }) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Dashboard"
                        description="Catalog overview for Velora."
                    />
                    <Button variant="outline" asChild>
                        <Link href={home()}>View shop</Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <StatCard label="Orders" value={stats.orders} />
                    <StatCard label="Products" value={stats.products} />
                    <StatCard label="Live" value={stats.live_products} />
                    <StatCard label="Low stock" value={stats.low_stock} />
                    <StatCard label="Categories" value={stats.categories} />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild>
                        <Link href={ordersIndex()}>Manage orders</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href={productsIndex()}>Manage products</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-medium">{value}</p>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
