import { Head } from '@inertiajs/react';
import AdminSaleForm from '@/components/admin-sale-form';
import Heading from '@/components/heading';
import { edit, index, update } from '@/routes/admin/sales';
import type {
    SaleFormValues,
    SaleProductOption,
} from '@/components/admin-sale-form';

type Sale = SaleFormValues & { id: number };

export default function AdminSalesEdit({
    sale,
    products,
}: {
    sale: Sale;
    products: SaleProductOption[];
}) {
    return (
        <>
            <Head title={`Edit ${sale.name}`} />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title={sale.name} description="Update this catalog sale." />
                <AdminSaleForm
                    products={products}
                    sale={sale}
                    submitUrl={update.url(sale.id)}
                    method="put"
                    submitLabel="Save sale"
                />
            </div>
        </>
    );
}

AdminSalesEdit.layout = {
    breadcrumbs: [
        { title: 'Sales', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
