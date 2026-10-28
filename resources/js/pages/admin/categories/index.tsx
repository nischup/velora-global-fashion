import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/categories';

type CategoryRow = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    sort_order: number;
    parent: { id: number; name: string } | null;
    products_count: number;
};

export default function AdminCategoriesIndex({
    categories,
}: {
    categories: CategoryRow[];
}) {
    return (
        <>
            <Head title="Categories" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Categories"
                        description="Organize the catalog into nested collections."
                    />
                    <Button asChild>
                        <Link href={create()}>Add category</Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Parent</th>
                                <th className="px-4 py-3 font-medium">Products</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {category.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {category.slug}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {category.parent?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {category.products_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                category.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {category.is_active
                                                ? 'Active'
                                                : 'Hidden'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={edit(category.id)}>
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete ${category.name}?`,
                                                    )
                                                ) {
                                                    router.delete(
                                                        destroy.url(category.id),
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
                    {categories.length === 0 && (
                        <p className="p-6 text-sm text-muted-foreground">
                            No categories yet.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

AdminCategoriesIndex.layout = {
    breadcrumbs: [{ title: 'Categories', href: index() }],
};
