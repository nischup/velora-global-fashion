import { Head, Link, router } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/admin/slides';

type SlideRow = {
    id: number;
    title: string;
    eyebrow: string | null;
    image_url: string | null;
    product_name: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function AdminSlidesIndex({ slides }: { slides: SlideRow[] }) {
    return (
        <>
            <Head title="Slides" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Slides"
                        description="Homepage banners. Active slides replace the automatic featured-product slider."
                    />
                    <Button asChild>
                        <Link href={create()}>Add slide</Link>
                    </Button>
                </div>
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Slide</th>
                                <th className="px-4 py-3 font-medium">Order</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {slides.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No slides yet. The homepage keeps using
                                        featured products until you add one.
                                    </td>
                                </tr>
                            )}
                            {slides.map((slide) => (
                                <tr key={slide.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {slide.image_url ? (
                                                <img
                                                    src={slide.image_url}
                                                    alt=""
                                                    className="h-12 w-20 rounded-md object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-20 rounded-md bg-muted" />
                                            )}
                                            <div>
                                                <div className="font-medium">
                                                    {slide.title}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {slide.eyebrow ||
                                                        'No label'}
                                                    {slide.product_name
                                                        ? ` · ${slide.product_name}`
                                                        : ' · Shop page'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {slide.sort_order}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                slide.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {slide.is_active
                                                ? 'Active'
                                                : 'Hidden'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link href={edit(slide.id)}>
                                                Edit
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete ${slide.title}?`,
                                                    )
                                                ) {
                                                    router.delete(
                                                        destroy.url(slide.id),
                                                    );
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

AdminSlidesIndex.layout = {
    breadcrumbs: [{ title: 'Slides', href: index() }],
};
