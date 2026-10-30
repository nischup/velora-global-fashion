import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/stores';

type RegisterRow = {
    id: number;
    name: string;
    code: string;
    is_active: boolean;
};

type StoreRow = {
    id: number;
    name: string;
    code: string;
    address: string | null;
    tax_rate: number;
    is_active: boolean;
    registers_count: number;
    registers?: RegisterRow[];
};

export default function AdminStoresIndex({ stores }: { stores: StoreRow[] }) {
    return (
        <>
            <Head title="Stores" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Stores"
                        description="Locations, registers, and VAT for the POS."
                    />
                    <Button asChild>
                        <Link href={create()}>Add store</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Store</th>
                                <th className="px-4 py-3 font-medium">VAT</th>
                                <th className="px-4 py-3 font-medium">
                                    Registers
                                </th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {stores.map((store) => (
                                <tr key={store.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">
                                            {store.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {store.code}
                                            {store.address
                                                ? ` · ${store.address}`
                                                : ''}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {store.tax_rate}%
                                    </td>
                                    <td className="px-4 py-3">
                                        {(store.registers ?? [])
                                            .map((register) => register.name)
                                            .join(', ') ||
                                            store.registers_count}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                store.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {store.is_active
                                                ? 'Active'
                                                : 'Hidden'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={edit(store.id)}>
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete ${store.name}?`,
                                                    )
                                                ) {
                                                    router.delete(
                                                        destroy.url(store.id),
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

AdminStoresIndex.layout = {
    breadcrumbs: [{ title: 'Stores', href: index() }],
};
