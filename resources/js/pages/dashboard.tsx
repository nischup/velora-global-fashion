import { Head, Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import {
    ArrowUpRight,
    ClipboardList,
    Shirt,
    Sparkles,
    Tags,
    TriangleAlert,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, home } from '@/routes';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as posIndex } from '@/routes/admin/pos';
import { index as productsIndex } from '@/routes/admin/products';

type Stats = {
    products: number;
    live_products: number;
    low_stock: number;
    categories: number;
    orders: number;
};

type StatCardData = {
    label: string;
    value: number;
    href: InertiaLinkProps['href'];
    icon: LucideIcon;
    hint: string;
    tone?: 'default' | 'alert';
};

export default function Dashboard({ stats }: { stats: Stats }) {
    const cards: StatCardData[] = [
        {
            label: 'Orders',
            value: stats.orders,
            href: ordersIndex(),
            icon: ClipboardList,
            hint: 'Open order desk',
        },
        {
            label: 'Products',
            value: stats.products,
            href: productsIndex(),
            icon: Shirt,
            hint: 'Browse catalog',
        },
        {
            label: 'Live',
            value: stats.live_products,
            href: productsIndex.url({ query: { status: 'live' } }),
            icon: Sparkles,
            hint: 'Shop-ready pieces',
        },
        {
            label: 'Low stock',
            value: stats.low_stock,
            href: productsIndex.url({ query: { stock: 'low' } }),
            icon: TriangleAlert,
            hint: 'Needs restock',
            tone: 'alert',
        },
        {
            label: 'Categories',
            value: stats.categories,
            href: categoriesIndex(),
            icon: Tags,
            hint: 'Edit collections',
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-8 bg-velora-cream p-4 text-velora-green md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-[11px] tracking-[0.22em] text-velora-gold uppercase">
                            Atelier
                        </p>
                        <h1 className="mt-1 text-3xl tracking-tight">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-velora-forest/70">
                            Tap a number to open that desk.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        asChild
                        className="border-velora-gold/40 bg-velora-ivory text-velora-green hover:bg-velora-gold/10"
                    >
                        <Link href={home()}>View shop</Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {cards.map((card, index) => (
                        <StatCard key={card.label} {...card} index={index} />
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        asChild
                        className="bg-velora-green text-velora-cream hover:bg-velora-forest"
                    >
                        <Link href={posIndex()}>Open POS</Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="border-velora-gold/40 bg-velora-ivory hover:bg-velora-gold/10"
                    >
                        <Link href={ordersIndex()}>Manage orders</Link>
                    </Button>
                    <Button
                        variant="outline"
                        asChild
                        className="border-velora-gold/40 bg-velora-ivory hover:bg-velora-gold/10"
                    >
                        <Link href={productsIndex()}>Manage products</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

function StatCard({
    label,
    value,
    href,
    icon: Icon,
    hint,
    tone = 'default',
    index,
}: StatCardData & { index: number }) {
    const display = useCountUp(value);
    const alert = tone === 'alert' && value > 0;

    return (
        <Link
            href={href}
            className={cn(
                'dashboard-stat-card group relative overflow-hidden rounded-2xl border bg-velora-ivory p-5 shadow-[0_10px_28px_rgba(13,59,46,0.05)] transition duration-300',
                'hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(13,59,46,0.12)]',
                'focus-visible:ring-2 focus-visible:ring-velora-gold focus-visible:outline-none',
                'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                alert
                    ? 'border-velora-gold/55 hover:border-velora-gold'
                    : 'border-velora-gold/20 hover:border-velora-gold/55',
            )}
            style={{ animationDelay: `${index * 90}ms` }}
        >
            <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(165deg,rgba(196,161,90,0.16),transparent_42%)] opacity-80" />
            <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition duration-700 group-hover:translate-x-[220%] group-hover:opacity-100 motion-reduce:hidden" />

            <div className="relative flex items-start justify-between gap-3">
                <p className="text-[11px] tracking-[0.18em] text-velora-gold uppercase">
                    {label}
                </p>
                <span
                    className={cn(
                        'flex size-9 items-center justify-center rounded-full border transition duration-300 group-hover:scale-110',
                        alert
                            ? 'border-velora-gold/50 bg-velora-gold/15 text-velora-gold'
                            : 'border-velora-gold/25 bg-velora-cream text-velora-forest',
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>

            <p className="relative mt-5 text-4xl font-medium tracking-tight tabular-nums underline-offset-4 transition group-hover:text-velora-forest group-hover:underline">
                {display}
            </p>
            <p className="relative mt-2 flex items-center gap-1 text-xs text-velora-forest/60 transition group-hover:text-velora-green">
                {hint}
                <ArrowUpRight className="size-3.5 translate-y-px opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </p>
        </Link>
    );
}

function useCountUp(target: number, duration = 780) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const reduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reduced || target === 0) {
            setValue(target);
            return;
        }

        const start = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - (1 - progress) ** 3;
            setValue(Math.round(target * eased));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [duration, target]);

    return value;
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
