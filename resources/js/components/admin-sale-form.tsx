import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type SaleProductOption = {
    id: number;
    name: string;
    status: string;
};

export type SaleFormValues = {
    name: string;
    percent: number;
    applies_to: 'all' | 'selected';
    product_ids: number[];
    starts_at: string;
    ends_at: string;
    is_active: boolean;
};

type Props = {
    products: SaleProductOption[];
    sale?: SaleFormValues;
    submitUrl: string;
    method?: 'post' | 'put';
    submitLabel: string;
};

export default function AdminSaleForm({
    products,
    sale,
    submitUrl,
    method = 'post',
    submitLabel,
}: Props) {
    const [query, setQuery] = useState('');
    const form = useForm({
        name: sale?.name ?? '',
        percent: sale?.percent ?? 30,
        applies_to: sale?.applies_to ?? 'all',
        product_ids: sale?.product_ids ?? [],
        starts_at: sale?.starts_at ?? '',
        ends_at: sale?.ends_at ?? '',
        is_active: sale?.is_active ?? true,
    });

    const visibleProducts = useMemo(() => {
        const needle = query.trim().toLowerCase();

        if (needle === '') {
            return products;
        }

        return products.filter((product) =>
            product.name.toLowerCase().includes(needle),
        );
    }, [products, query]);

    const toggleProduct = (id: number) => {
        form.setData(
            'product_ids',
            form.data.product_ids.includes(id)
                ? form.data.product_ids.filter((item) => item !== id)
                : [...form.data.product_ids, id],
        );
    };

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                if (method === 'put') {
                    form.put(submitUrl);
                } else {
                    form.post(submitUrl);
                }
            }}
            className="space-y-4 rounded-xl border p-6"
        >
            <div className="grid gap-2">
                <Label htmlFor="name">Sale name</Label>
                <Input
                    id="name"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    placeholder="Winter sale"
                    required
                />
                <InputError message={form.errors.name} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="percent">Percent off</Label>
                <Input
                    id="percent"
                    type="number"
                    min={1}
                    max={90}
                    value={form.data.percent}
                    onChange={(event) =>
                        form.setData('percent', Number(event.target.value) || 1)
                    }
                    required
                />
                <p className="text-muted-foreground text-xs">
                    Original prices stay. Shop, bag, checkout, and POS use the
                    offer price while this sale is live.
                </p>
                <InputError message={form.errors.percent} />
            </div>
            <div className="grid gap-2">
                <Label>Apply to</Label>
                <select
                    value={form.data.applies_to}
                    onChange={(event) =>
                        form.setData(
                            'applies_to',
                            event.target.value as 'all' | 'selected',
                        )
                    }
                    className="border-input h-9 rounded-md border bg-transparent px-3 text-sm"
                >
                    <option value="all">All products</option>
                    <option value="selected">Selected products</option>
                </select>
                <InputError message={form.errors.applies_to} />
            </div>
            {form.data.applies_to === 'selected' && (
                <div className="grid gap-2">
                    <Label htmlFor="product-search">Products</Label>
                    <Input
                        id="product-search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search products"
                    />
                    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
                        {visibleProducts.map((product) => (
                            <label
                                key={product.id}
                                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
                            >
                                <input
                                    type="checkbox"
                                    checked={form.data.product_ids.includes(
                                        product.id,
                                    )}
                                    onChange={() => toggleProduct(product.id)}
                                />
                                <span>{product.name}</span>
                                {product.status !== 'live' && (
                                    <span className="text-muted-foreground text-xs">
                                        {product.status}
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                    <p className="text-muted-foreground text-xs">
                        {form.data.product_ids.length} selected
                    </p>
                    <InputError message={form.errors.product_ids} />
                </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="starts_at">Starts</Label>
                    <Input
                        id="starts_at"
                        type="datetime-local"
                        value={form.data.starts_at}
                        onChange={(event) =>
                            form.setData('starts_at', event.target.value)
                        }
                    />
                    <InputError message={form.errors.starts_at} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="ends_at">Ends</Label>
                    <Input
                        id="ends_at"
                        type="datetime-local"
                        value={form.data.ends_at}
                        onChange={(event) =>
                            form.setData('ends_at', event.target.value)
                        }
                    />
                    <InputError message={form.errors.ends_at} />
                </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(event) =>
                        form.setData('is_active', event.target.checked)
                    }
                />
                Active now (turns off other sales)
            </label>
            <Button disabled={form.processing}>{submitLabel}</Button>
        </form>
    );
}
