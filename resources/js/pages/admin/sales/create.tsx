import { Head } from '@inertiajs/react';
import AdminSaleForm from '@/components/admin-sale-form';
import Heading from '@/components/heading';
import { create, index, store } from '@/routes/admin/sales';
import type { SaleProductOption } from '@/components/admin-sale-form';

export default function AdminSalesCreate({
    products,
}: {
    products: SaleProductOption[];
}) {
    return (
        <>
            <Head title="New sale" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading
                    title="New sale"
                    description="70% off everything, or 30% / 50% on selected pieces."
                />
                <AdminSaleForm
                    products={products}
                    submitUrl={store.url()}
                    submitLabel="Create sale"
                />
            </div>
        </>
    );
}

AdminSalesCreate.layout = {
    breadcrumbs: [
        { title: 'Sales', href: index() },
        { title: 'Create', href: create() },
    ],
};
