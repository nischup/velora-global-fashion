import { Head, Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { home } from '@/routes';

export function AuthBrandLayout({
    title,
    heading,
    description,
    eyebrow = 'The house',
    children,
}: {
    title: string;
    heading: string;
    description: string;
    eyebrow?: string;
    children: ReactNode;
}) {
    const { name } = usePage().props;

    return (
        <>
            <Head title={title} />
            <div className="grid min-h-svh bg-velora-cream text-velora-green md:grid-cols-2">
                <aside className="relative hidden overflow-hidden bg-velora-green md:flex md:flex-col md:justify-between md:p-10 lg:p-12 xl:p-16">
                    <div className="pointer-events-none absolute -top-24 -right-16 size-80 rounded-full bg-velora-gold/15 blur-3xl" />
                    <div className="pointer-events-none absolute right-1/3 bottom-0 size-96 rounded-full bg-velora-gold/10 blur-3xl" />

                    <Link href={home()} className="relative z-10 inline-flex">
                        <span className="overflow-hidden rounded-2xl border border-velora-gold/45 bg-velora-ivory shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                            <img
                                src="/images/logo.png"
                                alt={name}
                                className="h-28 w-44 object-contain p-2"
                            />
                        </span>
                    </Link>

                    <div className="relative z-10 max-w-md space-y-5 text-velora-cream">
                        <p className="text-[11px] tracking-[0.28em] text-velora-gold uppercase">
                            {eyebrow}
                        </p>
                        <h1 className="text-4xl leading-tight tracking-tight xl:text-5xl">
                            {heading}
                        </h1>
                        <div className="h-px w-24 bg-velora-gold/70" />
                        <p className="text-sm leading-7 text-velora-cream/75">
                            {description}
                        </p>
                    </div>

                    <p className="relative z-10 text-[11px] tracking-[0.22em] text-velora-gold/80 uppercase">
                        Velora · Atelier
                    </p>
                </aside>

                <main className="flex items-center justify-center px-4 py-10 sm:px-8">
                    <div className="w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-8 flex justify-center md:hidden"
                        >
                            <span className="overflow-hidden rounded-2xl border border-velora-gold/40 bg-velora-ivory shadow-[0_10px_30px_rgba(13,59,46,0.08)]">
                                <img
                                    src="/images/logo.png"
                                    alt={name}
                                    className="h-20 w-36 object-contain p-2"
                                />
                            </span>
                        </Link>
                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}

export const authFieldClass =
    'h-11 border-velora-gold/30 bg-velora-ivory text-velora-green placeholder:text-velora-forest/40 focus-visible:border-velora-gold focus-visible:ring-velora-gold/25';

export const authLabelClass =
    'text-[11px] tracking-[0.18em] text-velora-forest/75 uppercase';
