import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BrandController from '@/actions/App/Http/Controllers/Admin/BrandController';
import { edit, index } from '@/routes/admin/brands';

type Brand = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    logo_url: string | null;
};

export default function AdminBrandsEdit({ brand }: { brand: Brand }) {
    return (
        <>
            <Head title={`Edit ${brand.name}`} />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title="Edit brand" />
                <Form
                    {...BrandController.update.form(brand.id)}
                    encType="multipart/form-data"
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" defaultValue={brand.name} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" name="slug" defaultValue={brand.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={brand.description ?? ''}
                                />
                            </div>
                            {brand.logo_url && (
                                <img src={brand.logo_url} alt="" className="h-16 object-contain" />
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="logo">Replace logo</Label>
                                <Input id="logo" name="logo" type="file" accept="image/*" />
                            </div>
                            <input type="hidden" name="is_active" value="0" />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={brand.is_active}
                                />
                                Active
                            </label>
                            <Button disabled={processing}>Save changes</Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminBrandsEdit.layout = {
    breadcrumbs: [
        { title: 'Brands', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
