import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StoreController from '@/actions/App/Http/Controllers/Admin/StoreController';
import { create, index } from '@/routes/admin/stores';

export default function AdminStoresCreate() {
    return (
        <>
            <Head title="Add store" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading
                    title="Add store"
                    description="A new location starts with Counter 1."
                />
                <Form
                    {...StoreController.store.form()}
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    required
                                    placeholder="FLG"
                                />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tax_rate">VAT %</Label>
                                <Input
                                    id="tax_rate"
                                    name="tax_rate"
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="0.01"
                                    defaultValue={0}
                                    required
                                />
                                <InputError message={errors.tax_rate} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                />
                                Active
                            </label>
                            <Button disabled={processing}>Save store</Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminStoresCreate.layout = {
    breadcrumbs: [
        { title: 'Stores', href: index() },
        { title: 'Create', href: create() },
    ],
};
