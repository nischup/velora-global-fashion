import { Head, Link } from '@inertiajs/react';
import { AccountGoldRule } from '@/components/account-shell';
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
                        className="rounded-2xl border border-velora-gold/25 bg-velora-ivory p-8 shadow-[0_10px_30px_rgba(13,59,46,0.04)] transition hover:-translate-y-0.5 hover:border-velora-gold/50"
                    >
                        <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                            Category
                        </p>
                        <h2 className="mt-3 text-2xl text-velora-green">
                            {category.name}
                        </h2>
                    </Link>
                ))}
            </section>

            {featured.length > 0 && (
                <section className="mx-auto max-w-6xl px-4 py-8">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                                Collection
                            </p>
                            <h2 className="mt-1 text-2xl text-velora-green">
                                Featured
                            </h2>
                            <AccountGoldRule className="mt-3 max-w-40" />
                        </div>
                        <Link
                            href={shopIndex()}
                            className="text-sm tracking-[0.12em] text-velora-forest/70 uppercase underline-offset-4 hover:text-velora-green hover:underline"
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
                    <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                        Arrivals
                    </p>
                    <h2 className="mt-1 text-2xl text-velora-green">Just in</h2>
                    <AccountGoldRule className="mt-3 mb-6 max-w-40" />
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
