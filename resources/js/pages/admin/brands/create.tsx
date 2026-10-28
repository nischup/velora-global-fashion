import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BrandController from '@/actions/App/Http/Controllers/Admin/BrandController';
import { create, index } from '@/routes/admin/brands';

export default function AdminBrandsCreate() {
    return (
        <>
            <Head title="Add brand" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title="Add brand" />
                <Form
                    {...BrandController.store.form()}
                    encType="multipart/form-data"
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
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" name="slug" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="logo">Logo</Label>
                                <Input id="logo" name="logo" type="file" accept="image/*" />
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" name="is_active" value="1" defaultChecked />
                                Active
                            </label>
                            <Button disabled={processing}>Save brand</Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminBrandsCreate.layout = {
    breadcrumbs: [
        { title: 'Brands', href: index() },
        { title: 'Create', href: create() },
    ],
};
