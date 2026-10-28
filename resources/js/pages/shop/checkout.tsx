import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { formatPrice } from '@/lib/utils';
import { index as cartIndex } from '@/routes/cart';
import { store } from '@/routes/checkout';
import type { CartItem } from '@/types';
import type { FormEvent } from 'react';

type Props = {
    items: CartItem[];
    subtotal: number;
    defaults: {
        shipping_name: string;
        shipping_phone: string;
        shipping_address: string;
        shipping_city: string;
        notes: string;
    };
};

export default function CheckoutPage({ items, subtotal, defaults }: Props) {
    const form = useForm({
        shipping_name: defaults.shipping_name,
        shipping_phone: defaults.shipping_phone,
        shipping_address: defaults.shipping_address,
        shipping_city: defaults.shipping_city,
        notes: defaults.notes,
    });

    const canPlace = items.length > 0 && items.every((item) => item.in_stock);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(store.url());
    };

    return (
        <>
            <Head title="Checkout" />

            <div className="mx-auto max-w-6xl px-4 py-10">
                <p className="text-xs tracking-[0.22em] uppercase">Checkout</p>
                <h1 className="mt-2 text-3xl tracking-tight">
                    Delivery details
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Cash on delivery. Pay when your order arrives.
                </p>

                <form
                    onSubmit={submit}
                    className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]"
                >
                    <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="shipping_name">Full name</Label>
                                <Input
                                    id="shipping_name"
                                    value={form.data.shipping_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'shipping_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.shipping_name}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shipping_phone">Phone</Label>
                                <Input
                                    id="shipping_phone"
                                    value={form.data.shipping_phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'shipping_phone',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.shipping_phone}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shipping_address">Address</Label>
                            <Textarea
                                id="shipping_address"
                                value={form.data.shipping_address}
                                onChange={(event) =>
                                    form.setData(
                                        'shipping_address',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={form.errors.shipping_address}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shipping_city">City</Label>
                            <Input
                                id="shipping_city"
                                value={form.data.shipping_city}
                                onChange={(event) =>
                                    form.setData(
                                        'shipping_city',
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError message={form.errors.shipping_city} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                value={form.data.notes}
                                onChange={(event) =>
                                    form.setData('notes', event.target.value)
                                }
                            />
                            <InputError message={form.errors.notes} />
                            <InputError message={form.errors.cart} />
                        </div>
                    </div>

                    <aside className="h-fit border p-6">
                        <h2 className="text-sm tracking-[0.18em] uppercase">
                            Your bag
                        </h2>
                        <div className="mt-4 space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.variant_id}
                                    className="flex justify-between gap-3 text-sm"
                                >
                                    <div>
                                        <p>
                                            {item.name}
                                            {item.options
                                                ? ` · ${item.options}`
                                                : ''}
                                        </p>
                                        <p className="text-muted-foreground">
                                            Qty {item.quantity}
                                        </p>
                                    </div>
                                    <p>{formatPrice(item.line_total)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between border-t pt-4 font-medium">
                            <span>Total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <Button
                            type="submit"
                            className="mt-6 w-full"
                            disabled={!canPlace || form.processing}
                        >
                            Place order
                        </Button>
                        <Button
                            variant="ghost"
                            className="mt-2 w-full"
                            asChild
                        >
                            <Link href={cartIndex()}>Back to bag</Link>
                        </Button>
                    </aside>
                </form>
            </div>
        </>
    );
}
