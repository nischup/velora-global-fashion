import { Form, Head, router, useForm } from '@inertiajs/react';
import Heading from '@/components/heading';
import ImageUploadField from '@/components/image-upload-field';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import ProductController from '@/actions/App/Http/Controllers/Admin/ProductController';
import ProductImageController from '@/actions/App/Http/Controllers/Admin/ProductImageController';
import ProductVariantController from '@/actions/App/Http/Controllers/Admin/ProductVariantController';
import { edit, index } from '@/routes/admin/products';
import type {
    AdminProduct,
    AttributeValue,
    BrandSummary,
    CategoryOption,
} from '@/types';

type Props = {
    product: AdminProduct;
    categories: CategoryOption[];
    brands: BrandSummary[];
    sizes: AttributeValue[];
    colors: AttributeValue[];
};

export default function AdminProductsEdit({
    product,
    categories,
    brands,
    sizes,
    colors,
}: Props) {
    const imageForm = useForm({
        images: [] as File[],
    });
    const variantForm = useForm({
        sku: '',
        barcode: '',
        price: '',
        stock: '0',
        low_stock_threshold: '5',
        is_active: true,
        size_id: '',
        color_id: '',
    });

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4">
                <Heading title={product.name} description="Update details, images, variants, and stock." />

                <Form
                    {...ProductController.update.form(product.id)}
                    className="space-y-4 rounded-xl border p-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" name="name" defaultValue={product.name} required />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input id="slug" name="slug" defaultValue={product.slug} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <select
                                        id="category_id"
                                        name="category_id"
                                        defaultValue={product.category_id}
                                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                    >
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.depth > 0 ? '— ' : ''}
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="brand_id">Brand</Label>
                                    <select
                                        id="brand_id"
                                        name="brand_id"
                                        defaultValue={product.brand_id ?? ''}
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
                                    name="short_description"
                                    defaultValue={product.short_description ?? ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={product.description ?? ''}
                                />
                            </div>
                            <div className="flex flex-wrap gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        name="status"
                                        defaultValue={product.status}
                                        className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="live">Live</option>
                                    </select>
                                </div>
                                <input type="hidden" name="is_featured" value="0" />
                                <label className="flex items-center gap-2 self-end text-sm">
                                    <input
                                        type="checkbox"
                                        name="is_featured"
                                        value="1"
                                        defaultChecked={product.is_featured}
                                    />
                                    Featured
                                </label>
                            </div>
                            <Button disabled={processing}>Save details</Button>
                        </>
                    )}
                </Form>

                <section className="space-y-4 rounded-xl border p-6">
                    <h2 className="font-medium">Images</h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {product.images.map((image) => (
                            <div key={image.id} className="overflow-hidden rounded-lg border">
                                <img src={image.url} alt="" className="aspect-square object-cover" />
                                <div className="flex items-center justify-between p-2">
                                    {image.is_primary ? (
                                        <Badge>Primary</Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                router.patch(
                                                    ProductImageController.primary.url([
                                                        product.id,
                                                        image.id,
                                                    ]),
                                                )
                                            }
                                        >
                                            Make primary
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                            router.delete(
                                                ProductImageController.destroy.url([
                                                    product.id,
                                                    image.id,
                                                ]),
                                            )
                                        }
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            imageForm.post(
                                ProductImageController.store.url(product.id),
                                {
                                    forceFormData: true,
                                    preserveScroll: true,
                                    onSuccess: () => imageForm.reset(),
                                },
                            );
                        }}
                        className="space-y-3"
                    >
                        <ImageUploadField
                            label="Upload"
                            files={imageForm.data.images}
                            onChange={(images) =>
                                imageForm.setData('images', images)
                            }
                            uploading={imageForm.processing}
                            error={imageForm.errors.images}
                        />
                        <Button
                            disabled={
                                imageForm.processing ||
                                imageForm.data.images.length === 0
                            }
                        >
                            {imageForm.processing && <Spinner />}
                            Upload
                        </Button>
                    </form>
                </section>

                <section className="space-y-4 rounded-xl border p-6">
                    <h2 className="font-medium">Variants & stock</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left">
                                <tr>
                                    <th className="py-2">SKU</th>
                                    <th className="py-2">Barcode</th>
                                    <th className="py-2">Options</th>
                                    <th className="py-2">Price</th>
                                    <th className="py-2">Stock</th>
                                    <th className="py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {product.variants.map((variant) => (
                                    <tr key={variant.id} className="border-t">
                                        <td className="py-2">{variant.sku}</td>
                                        <td className="py-2">
                                            {variant.barcode ?? '—'}
                                        </td>
                                        <td className="py-2">
                                            {variant.label}
                                            {variant.is_low_stock && (
                                                <Badge variant="destructive" className="ml-2">
                                                    Low
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="py-2">{variant.price}</td>
                                        <td className="py-2">
                                            <form
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    const stock = new FormData(
                                                        event.currentTarget,
                                                    ).get('stock');
                                                    router.patch(
                                                        ProductVariantController.updateStock.url(
                                                            [product.id, variant.id],
                                                        ),
                                                        { stock },
                                                    );
                                                }}
                                                className="flex gap-2"
                                            >
                                                <Input
                                                    name="stock"
                                                    type="number"
                                                    min={0}
                                                    defaultValue={variant.stock}
                                                    className="w-24"
                                                />
                                                <Button size="sm" variant="outline">
                                                    Update
                                                </Button>
                                            </form>
                                        </td>
                                        <td className="py-2 text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    router.delete(
                                                        ProductVariantController.destroy.url(
                                                            [product.id, variant.id],
                                                        ),
                                                    )
                                                }
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            variantForm.post(
                                ProductVariantController.store.url(product.id),
                            );
                        }}
                        className="grid gap-2 rounded-lg border p-3 md:grid-cols-7"
                    >
                        <Input
                            placeholder="SKU"
                            value={variantForm.data.sku}
                            onChange={(event) =>
                                variantForm.setData('sku', event.target.value)
                            }
                        />
                        <Input
                            placeholder="Barcode (auto)"
                            value={variantForm.data.barcode}
                            onChange={(event) =>
                                variantForm.setData(
                                    'barcode',
                                    event.target.value,
                                )
                            }
                        />
                        <Input
                            placeholder="Price"
                            type="number"
                            value={variantForm.data.price}
                            onChange={(event) =>
                                variantForm.setData('price', event.target.value)
                            }
                        />
                        <Input
                            placeholder="Stock"
                            type="number"
                            value={variantForm.data.stock}
                            onChange={(event) =>
                                variantForm.setData('stock', event.target.value)
                            }
                        />
                        <select
                            value={variantForm.data.size_id}
                            onChange={(event) =>
                                variantForm.setData('size_id', event.target.value)
                            }
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
                            value={variantForm.data.color_id}
                            onChange={(event) =>
                                variantForm.setData('color_id', event.target.value)
                            }
                            className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                        >
                            <option value="">Color</option>
                            {colors.map((color) => (
                                <option key={color.id} value={color.id}>
                                    {color.value}
                                </option>
                            ))}
                        </select>
                        <Button disabled={variantForm.processing}>Add variant</Button>
                    </form>
                </section>
            </div>
        </>
    );
}

AdminProductsEdit.layout = {
    breadcrumbs: [
        { title: 'Products', href: index() },
        { title: 'Edit', href: edit(0) },
    ],
};
