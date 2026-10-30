import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { show } from '@/routes/products';
import { index as shopIndex } from '@/routes/shop';
import type { HeroSlide } from '@/types';

const INTERVAL_MS = 6000;

type Props = {
    slides: HeroSlide[];
};

export function HeroSlider({ slides }: Props) {
    const items =
        slides.length > 0
            ? slides
            : [
                  {
                      id: 0,
                      title: 'Clothes with a quiet kind of luxury.',
                      description:
                          'Tailoring, silk, and everyday layers designed to be worn for years — not a single season.',
                      image_url: null,
                      slug: '',
                      brand: null,
                  },
              ];

    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const count = items.length;

    const goTo = useCallback(
        (index: number) => {
            setCurrent((index + count) % count);
        },
        [count],
    );

    useEffect(() => {
        if (count < 2 || paused) {
            return;
        }

        const media = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (media.matches) {
            return;
        }

        const timer = window.setInterval(() => {
            setCurrent((index) => (index + 1) % count);
        }, INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [count, paused]);

    return (
        <section
            className="relative overflow-hidden border-b border-velora-gold/30 bg-velora-green text-velora-cream"
            aria-roledescription="carousel"
            aria-label="New season"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className="relative h-[70vh] min-h-[420px] max-h-[760px]">
                {items.map((item, index) => {
                    const active = index === current;
                    const href = item.slug ? show(item.slug) : shopIndex();

                    return (
                        <div
                            key={item.id || index}
                            className={cn(
                                'absolute inset-0 transition-opacity duration-700 ease-out',
                                active
                                    ? 'z-10 opacity-100'
                                    : 'pointer-events-none z-0 opacity-0',
                            )}
                            aria-hidden={!active}
                        >
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="size-full bg-velora-green bg-[radial-gradient(circle_at_70%_40%,rgba(196,161,90,0.28),transparent_58%)]" />
                            )}
                            <div className="absolute inset-0 bg-linear-to-r from-velora-green/88 via-velora-green/45 to-velora-green/10" />
                            <div className="absolute inset-0 z-10 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-16 md:justify-center md:pb-0">
                                <p className="text-xs tracking-[0.28em] text-velora-gold uppercase">
                                    New season
                                </p>
                                {item.brand && (
                                    <p className="mt-4 text-[11px] tracking-[0.2em] text-velora-gold-soft uppercase">
                                        {item.brand}
                                    </p>
                                )}
                                <h1 className="mt-3 max-w-3xl text-4xl leading-tight font-medium tracking-tight md:text-6xl">
                                    {item.title}
                                </h1>
                                {item.description && (
                                    <p className="mt-4 max-w-xl text-velora-cream/75">
                                        {item.description}
                                    </p>
                                )}
                                <div className="mt-8">
                                    <Link
                                        href={href}
                                        className="inline-flex h-11 items-center bg-velora-cream px-6 text-sm tracking-[0.18em] text-velora-green uppercase transition hover:bg-velora-gold-soft"
                                        tabIndex={active ? 0 : -1}
                                    >
                                        Shop the collection
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {count > 1 && (
                    <>
                        <button
                            type="button"
                            className="absolute top-1/2 left-3 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-velora-gold/40 bg-velora-green/40 text-velora-cream backdrop-blur-sm hover:bg-velora-green/70 md:left-6"
                            onClick={() => goTo(current - 1)}
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            className="absolute top-1/2 right-3 z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-velora-gold/40 bg-velora-green/40 text-velora-cream backdrop-blur-sm hover:bg-velora-green/70 md:right-6"
                            onClick={() => goTo(current + 1)}
                            aria-label="Next slide"
                        >
                            <ChevronRight className="size-5" />
                        </button>
                        <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-2">
                            {items.map((item, index) => (
                                <button
                                    key={item.id || index}
                                    type="button"
                                    className={cn(
                                        'h-1.5 rounded-full transition-all',
                                        index === current
                                            ? 'w-8 bg-velora-gold'
                                            : 'w-2.5 bg-velora-cream/40 hover:bg-velora-gold-soft',
                                    )}
                                    onClick={() => goTo(index)}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={
                                        index === current ? 'true' : undefined
                                    }
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
