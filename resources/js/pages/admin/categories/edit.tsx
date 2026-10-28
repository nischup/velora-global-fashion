import { Form, Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CategoryController from '@/actions/App/Http/Controllers/Admin/CategoryController';
import { edit, index } from '@/routes/admin/categories';
import type { CategoryOption } from '@/types';

type Category = {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    description: string | null;
    is_active: boolean;
    sort_order: number;
};

export default function AdminCategoriesEdit({
    category,
    parents,
}: {
    category: Category;
    parents: CategoryOption[];
}) {
    return (
        <>
            <Head title={`Edit ${category.name}`} />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title="Edit category" />
                <Form
                    {...CategoryController.update.form(category.id)}
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={category.name}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    defaultValue={category.slug}
                                />
                                <InputError message={errors.slug} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="parent_id">Parent</Label>
                                <select
                                    id="parent_id"
                                    name="parent_id"
                                    defaultValue={category.parent_id ?? ''}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                >
                                    <option value="">None</option>
                                    {parents.map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.depth > 0 ? '— ' : ''}
                                            {parent.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={category.description ?? ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Sort order</Label>
                                <Input
                                    id="sort_order"
                                    name="sort_order"
                                    type="number"
                                    defaultValue={category.sort_order}
                                />
                            </div>
                            <input type="hidden" name="is_active" value="0" />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={category.is_active}
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

AdminCategoriesEdit.layout = {
    breadcrumbs: [
        { title: 'Categories', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
