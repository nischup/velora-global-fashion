import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/brands';

type BrandRow = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    products_count: number;
};

export default function AdminBrandsIndex({ brands }: { brands: BrandRow[] }) {
    return (
        <>
            <Head title="Brands" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Brands"
                        description="House labels and partner brands."
                    />
                    <Button asChild>
                        <Link href={create()}>Add brand</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Products</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {brands.map((brand) => (
                                <tr key={brand.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {brand.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {brand.slug}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {brand.products_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                brand.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {brand.is_active ? 'Active' : 'Hidden'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={edit(brand.id)}>Edit</Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (confirm(`Delete ${brand.name}?`)) {
                                                    router.delete(destroy.url(brand.id));
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

AdminBrandsIndex.layout = {
    breadcrumbs: [{ title: 'Brands', href: index() }],
};
