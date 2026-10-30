import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-full border border-velora-gold/50 bg-velora-ivory shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
                <img
                    src="/images/logo.png"
                    alt=""
                    className="size-full scale-110 object-cover"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold tracking-wide">
                    {name}
                </span>
            </div>
        </>
    );
}
