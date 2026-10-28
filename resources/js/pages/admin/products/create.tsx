import { Head, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { slugify } from '@/lib/utils';
import { create, index, store } from '@/routes/admin/products';
import type { AttributeValue, BrandSummary, CategoryOption } from '@/types';

type VariantRow = {
    sku: string;
    price: string;
    stock: string;
    size_id: string;
    color_id: string;
};

type Props = {
    categories: CategoryOption[];
    brands: BrandSummary[];
    sizes: AttributeValue[];
    colors: AttributeValue[];
};

const emptyVariant = (): VariantRow => ({
    sku: '',
    price: '',
    stock: '0',
    size_id: '',
    color_id: '',
});

export default function AdminProductsCreate({
    categories,
    brands,
    sizes,
    colors,
}: Props) {
    const form = useForm({
        name: '',
        slug: '',
        category_id: '',
        brand_id: '',
        short_description: '',
        description: '',
        status: 'draft',
        is_featured: false,
        images: [] as File[],
        variants: [emptyVariant()] as VariantRow[],
    });

    return (
        <>
            <Head title="Add product" />
            <div className="mx-auto w-full max-w-4xl p-4">
                <Heading
                    title="Add product"
                    description="Create the product, then add size/color variants and images."
                />
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        form.post(store.url(), { forceFormData: true });
                    }}
                    className="space-y-6 rounded-xl border p-6"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) => {
                                    form.setData('name', event.target.value);
                                    if (!form.data.slug) {
                                        form.setData('slug', slugify(event.target.value));
                                    }
                                }}
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
                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Category</Label>
                            <select
                                id="category_id"
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData('category_id', event.target.value)
                                }
                                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                required
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.depth > 0 ? '— ' : ''}
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.category_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="brand_id">Brand</Label>
                            <select
                                id="brand_id"
                                value={form.data.brand_id}
                                onChange={(event) =>
                                    form.setData('brand_id', event.target.value)
                                }
                                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                            >
                                <option value="">No brand</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="short_description">Short description</Label>
                        <Input
                            id="short_description"
                            value={form.data.short_description}
                            onChange={(event) =>
                                form.setData('short_description', event.target.value)
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-wrap gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={form.data.status}
                                onChange={(event) =>
                                    form.setData('status', event.target.value)
                                }
                                className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="live">Live</option>
                            </select>
                        </div>
                        <label className="flex items-center gap-2 self-end text-sm">
                            <input
                                type="checkbox"
                                checked={form.data.is_featured}
                                onChange={(event) =>
                                    form.setData('is_featured', event.target.checked)
                                }
                            />
                            Featured
                        </label>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="images">Images</Label>
                        <Input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(event) =>
                                form.setData(
                                    'images',
                                    Array.from(event.target.files ?? []),
                                )
                            }
                        />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Variants</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    form.setData('variants', [
                                        ...form.data.variants,
                                        emptyVariant(),
                                    ])
                                }
                            >
                                Add variant
                            </Button>
                        </div>
                        {form.data.variants.map((variant, index) => (
                            <div
                                key={index}
                                className="grid gap-2 rounded-lg border p-3 md:grid-cols-5"
                            >
                                <Input
                                    placeholder="SKU"
                                    value={variant.sku}
                                    onChange={(event) => {
                                        const variants = [...form.data.variants];
                                        variants[index] = {
                                            ...variant,
                                            sku: event.target.value,
                                        };
                                        form.setData('variants', variants);
                                    }}
                                />
                                <Input
                                    placeholder="Price"
                                    type="number"
                                    min={0}
                                    value={variant.price}
                                    onChange={(event) => {
                                        const variants = [...form.data.variants];
                                        variants[index] = {
                                            ...variant,
                                            price: event.target.value,
                                        };
                                        form.setData('variants', variants);
                                    }}
                                />
                                <Input
                                    placeholder="Stock"
                                    type="number"
                                    min={0}
                                    value={variant.stock}
                                    onChange={(event) => {
                                        const variants = [...form.data.variants];
                                        variants[index] = {
                                            ...variant,
                                            stock: event.target.value,
                                        };
                                        form.setData('variants', variants);
                                    }}
                                />
                                <select
                                    value={variant.size_id}
                                    onChange={(event) => {
                                        const variants = [...form.data.variants];
                                        variants[index] = {
                                            ...variant,
                                            size_id: event.target.value,
                                        };
                                        form.setData('variants', variants);
                                    }}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                >
                                    <option value="">Size</option>
                                    {sizes.map((size) => (
                                        <option key={size.id} value={size.id}>
                                            {size.value}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={variant.color_id}
                                    onChange={(event) => {
                                        const variants = [...form.data.variants];
                                        variants[index] = {
                                            ...variant,
                                            color_id: event.target.value,
                                        };
                                        form.setData('variants', variants);
                                    }}
                                    className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                >
                                    <option value="">Color</option>
                                    {colors.map((color) => (
                                        <option key={color.id} value={color.id}>
                                            {color.value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))}
                        <InputError message={form.errors.variants} />
                    </div>
                    <Button disabled={form.processing}>Create product</Button>
                </form>
            </div>
        </>
    );
}

AdminProductsCreate.layout = {
    breadcrumbs: [
        { title: 'Products', href: index() },
        { title: 'Create', href: create() },
    ],
};
