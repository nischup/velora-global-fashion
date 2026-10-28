import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { create, index, store } from '@/routes/admin/attributes';

type ValueRow = { value: string; hex_color: string };

export default function AdminAttributesCreate() {
    const form = useForm({
        name: '',
        slug: '',
        values: [{ value: '', hex_color: '' }] as ValueRow[],
    });

    return (
        <>
            <Head title="Add attribute" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title="Add attribute" />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(store.url());
                    }}
                    className="space-y-4 rounded-xl border p-6"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(event) =>
                                form.setData('name', event.target.value)
                            }
                            required
                        />
                        <InputError message={form.errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={form.data.slug}
                            onChange={(event) =>
                                form.setData('slug', event.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Values</Label>
                        {form.data.values.map((row, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    placeholder="M, Black..."
                                    value={row.value}
                                    onChange={(event) => {
                                        const values = [...form.data.values];
                                        values[index] = {
                                            ...row,
                                            value: event.target.value,
                                        };
                                        form.setData('values', values);
                                    }}
                                />
                                <Input
                                    placeholder="#111111"
                                    value={row.hex_color}
                                    onChange={(event) => {
                                        const values = [...form.data.values];
                                        values[index] = {
                                            ...row,
                                            hex_color: event.target.value,
                                        };
                                        form.setData('values', values);
                                    }}
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                form.setData('values', [
                                    ...form.data.values,
                                    { value: '', hex_color: '' },
                                ])
                            }
                        >
                            Add value
                        </Button>
                    </div>
                    <Button disabled={form.processing}>Save attribute</Button>
                </form>
            </div>
        </>
    );
}

AdminAttributesCreate.layout = {
    breadcrumbs: [
        { title: 'Attributes', href: index() },
        { title: 'Create', href: create() },
    ],
};
