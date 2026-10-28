import { Head, Link } from '@inertiajs/react';
import { HeroSlider } from '@/components/hero-slider';
import { ProductCard } from '@/components/product-card';
import { index as shopIndex, category as shopCategory } from '@/routes/shop';
import type {
    CategorySummary,
    HeroSlide,
    ProductCard as ProductCardType,
} from '@/types';

type Props = {
    featured: ProductCardType[];
    latest: ProductCardType[];
    categories: CategorySummary[];
    slides: HeroSlide[];
};

export default function ShopHome({
    featured,
    latest,
    categories,
    slides = [],
}: Props) {
    return (
        <>
            <Head title="Velora" />

            <HeroSlider slides={slides} />

            <section className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={shopCategory(category.slug)}
                        className="border p-8 transition hover:bg-muted/40"
                    >
                        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
                            Category
                        </p>
                        <h2 className="mt-3 text-2xl">{category.name}</h2>
                    </Link>
                ))}
            </section>

            {featured.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-6 flex items-end justify-between">
                        <h2 className="text-xl tracking-tight">Featured</h2>
                        <Link
                            href={shopIndex()}
                            className="text-xs tracking-[0.18em] uppercase hover:opacity-70"
                        >
                            View all
                        </Link>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {featured.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {latest.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 py-8 pb-16">
                    <h2 className="mb-6 text-xl tracking-tight">Just in</h2>
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {latest.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
