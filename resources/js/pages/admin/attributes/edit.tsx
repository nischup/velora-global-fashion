import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit, index, update } from '@/routes/admin/attributes';
import type { CatalogAttribute } from '@/types';

type ValueRow = {
    id?: number;
    value: string;
    hex_color: string;
};

export default function AdminAttributesEdit({
    attribute,
}: {
    attribute: CatalogAttribute;
}) {
    const form = useForm({
        name: attribute.name,
        slug: attribute.slug,
        values: attribute.values.map((value) => ({
            id: value.id,
            value: value.value,
            hex_color: value.hex_color ?? '',
        })) as ValueRow[],
    });

    return (
        <>
            <Head title={`Edit ${attribute.name}`} />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title="Edit attribute" />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.put(update.url(attribute.id));
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
                            <div key={row.id ?? `new-${index}`} className="flex gap-2">
                                <Input
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
                    <Button disabled={form.processing}>Save changes</Button>
                </form>
            </div>
        </>
    );
}

AdminAttributesEdit.layout = {
    breadcrumbs: [
        { title: 'Attributes', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
