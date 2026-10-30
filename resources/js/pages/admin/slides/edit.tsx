import { Form, Head } from '@inertiajs/react';
import SlideController from '@/actions/App/Http/Controllers/Admin/SlideController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import SlideImageField from '@/components/slide-image-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { edit, index } from '@/routes/admin/slides';

type ProductOption = {
    id: number;
    name: string;
};

type Slide = {
    id: number;
    title: string;
    description: string | null;
    eyebrow: string | null;
    image_url: string | null;
    product_id: number | null;
    sort_order: number;
    is_active: boolean;
};

export default function AdminSlidesEdit({
    slide,
    products,
}: {
    slide: Slide;
    products: ProductOption[];
}) {
    return (
        <>
            <Head title={`Edit ${slide.title}`} />
            <div className="mx-auto w-full max-w-2xl p-4">
                <Heading title="Edit slide" />
                <Form
                    {...SlideController.update.form(slide.id)}
                    encType="multipart/form-data"
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={slide.title}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="eyebrow">Label</Label>
                                <Input
                                    id="eyebrow"
                                    name="eyebrow"
                                    defaultValue={slide.eyebrow ?? ''}
                                />
                                <InputError message={errors.eyebrow} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={slide.description ?? ''}
                                />
                                <InputError message={errors.description} />
                            </div>
                            <SlideImageField
                                label="Replace image"
                                existingUrl={slide.image_url}
                                error={errors.image}
                            />
                            <div className="grid gap-2">
                                <Label htmlFor="product_id">Button link</Label>
                                <select
                                    id="product_id"
                                    name="product_id"
                                    className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                                    defaultValue={slide.product_id ?? ''}
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
                                    defaultValue={slide.sort_order}
                                />
                                <InputError message={errors.sort_order} />
                            </div>
                            <input type="hidden" name="is_active" value="0" />
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    value="1"
                                    defaultChecked={slide.is_active}
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

AdminSlidesEdit.layout = {
    breadcrumbs: [
        { title: 'Slides', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
