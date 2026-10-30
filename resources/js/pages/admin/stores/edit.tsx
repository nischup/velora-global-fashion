import { Form, Head, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StoreController from '@/actions/App/Http/Controllers/Admin/StoreController';
import { edit, index } from '@/routes/admin/stores';
import { store as storeRegister } from '@/routes/admin/stores/registers';
import { destroy as destroyRegister, update as updateRegister } from '@/routes/admin/registers';

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
    phone: string | null;
    tax_rate: number;
    is_active: boolean;
    registers?: RegisterRow[];
};

export default function AdminStoresEdit({ store }: { store: StoreRow }) {
    return (
        <>
            <Head title={`Edit ${store.name}`} />
            <div className="mx-auto w-full max-w-3xl space-y-6 p-4">
                <Heading title={store.name} description="VAT applies to POS tickets at this store." />
                <Form
                    {...StoreController.update.form(store.id)}
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={store.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    defaultValue={store.code}
                                    required
                                />
                                <InputError message={errors.code} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    defaultValue={store.address ?? ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue={store.phone ?? ''}
                                />
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
                                    defaultValue={store.tax_rate}
                                    required
                                />
                                <InputError message={errors.tax_rate} />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={store.is_active}
                                />
                                Active
                            </label>
                            <Button disabled={processing}>Save store</Button>
                        </>
                    )}
                </Form>

                <section className="space-y-4 rounded-xl border p-6">
                    <Heading
                        title="Registers"
                        description="Each counter can have only one open shift."
                    />
                    <div className="space-y-3">
                        {(store.registers ?? []).map((register) => (
                            <form
                                key={register.id}
                                className="grid gap-2 md:grid-cols-[1fr_140px_auto_auto]"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const data = new FormData(
                                        event.currentTarget,
                                    );
                                    router.put(updateRegister.url(register.id), {
                                        name: String(data.get('name') ?? ''),
                                        code: String(data.get('code') ?? ''),
                                        is_active: data.get('is_active') === '1',
                                    });
                                }}
                            >
                                <Input
                                    name="name"
                                    defaultValue={register.name}
                                    required
                                />
                                <Input
                                    name="code"
                                    defaultValue={register.code}
                                    required
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        value="1"
                                        defaultChecked={register.is_active}
                                    />
                                    Active
                                </label>
                                <div className="flex gap-2">
                                    <Button type="submit" variant="outline">
                                        Save
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            if (
                                                confirm(
                                                    `Delete ${register.name}?`,
                                                )
                                            ) {
                                                router.delete(
                                                    destroyRegister.url(
                                                        register.id,
                                                    ),
                                                );
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </form>
                        ))}
                    </div>
                    <form
                        className="grid gap-2 md:grid-cols-[1fr_140px_auto]"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const data = new FormData(event.currentTarget);
                            router.post(storeRegister.url(store.id), {
                                name: String(data.get('name') ?? ''),
                                code: String(data.get('code') ?? ''),
                                is_active: true,
                            });
                        }}
                    >
                        <Input name="name" placeholder="Counter 2" required />
                        <Input name="code" placeholder="FLG-2" required />
                        <Button type="submit">Add register</Button>
                    </form>
                </section>
            </div>
        </>
    );
}

AdminStoresEdit.layout = {
    breadcrumbs: [
        { title: 'Stores', href: index() },
        { title: 'Edit', href: edit(store.id) },
    ],
};
