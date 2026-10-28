import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/attributes';
import type { CatalogAttribute } from '@/types';

export default function AdminAttributesIndex({
    attributes,
}: {
    attributes: CatalogAttribute[];
}) {
    return (
        <>
            <Head title="Attributes" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Attributes"
                        description="Size, color, and other variant options."
                    />
                    <Button asChild>
                        <Link href={create()}>Add attribute</Link>
                    </Button>
                </div>
                <div className="grid gap-4">
                    {attributes.map((attribute) => (
                        <div key={attribute.id} className="rounded-xl border p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-medium">{attribute.name}</h2>
                                    <p className="text-xs text-muted-foreground">
                                        {attribute.slug}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {attribute.values.map((value) => (
                                            <span
                                                key={value.id}
                                                className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
                                            >
                                                {value.hex_color && (
                                                    <span
                                                        className="size-3 rounded-full border"
                                                        style={{
                                                            backgroundColor:
                                                                value.hex_color,
                                                        }}
                                                    />
                                                )}
                                                {value.value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={edit(attribute.id)}>Edit</Link>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            if (confirm(`Delete ${attribute.name}?`)) {
                                                router.delete(destroy.url(attribute.id));
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

AdminAttributesIndex.layout = {
    breadcrumbs: [{ title: 'Attributes', href: index() }],
};
