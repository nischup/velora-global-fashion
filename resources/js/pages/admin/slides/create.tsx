import { Form, Head } from '@inertiajs/react';
import SlideController from '@/actions/App/Http/Controllers/Admin/SlideController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SlideImageField from '@/components/slide-image-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { create, index } from '@/routes/admin/slides';

type ProductOption = {
    id: number;
    name: string;
};

export default function AdminSlidesCreate({
    products,
    next_sort_order,
}: {
    products: ProductOption[];
    next_sort_order: number;
}) {
    return (
        <>
            <Head title="Add slide" />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading
                    title="Add slide"
                    description="This appears in the homepage slider."
                />
                <Form
                    {...SlideController.store.form()}
                    encType="multipart/form-data"
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" required />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="eyebrow">Label</Label>
                                <Input
                                    id="eyebrow"
                                    name="eyebrow"
                                    placeholder="New arrival"
                                />
                                <InputError message={errors.eyebrow} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" />
                                <InputError message={errors.description} />
                            </div>
                            <SlideImageField error={errors.image} />
                            <div className="grid gap-2">
                                <Label htmlFor="product_id">Button link</Label>
                                <select
                                    id="product_id"
                                    name="product_id"
                                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                                    defaultValue=""
                                >
                                    <option value="">Shop page</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.product_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sort_order">Order</Label>
                                <Input
                                    id="sort_order"
                                    name="sort_order"
                                    type="number"
                                    min={0}
                                    defaultValue={next_sort_order}
                                />
                                <InputError message={errors.sort_order} />
                            </div>
                            <input type="hidden" name="is_active" value="0" />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    value="1"
                                    defaultChecked
                                />
                                Active
                            </label>
                            <Button disabled={processing}>Save slide</Button>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

AdminSlidesCreate.layout = {
    breadcrumbs: [
        { title: 'Slides', href: index() },
        { title: 'Create', href: create() },
    ],
};
