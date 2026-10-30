import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Spinner } from '@/components/ui/spinner';

const MIN_VISIBLE_MS = 500;

export function usePageLoader() {
    const [loading, setLoading] = useState(false);
    const timeout = useRef<number>(0);

    useEffect(() => {
        return () => window.clearTimeout(timeout.current);
    }, []);

    const showLoader = () => {
        window.clearTimeout(timeout.current);
        setLoading(true);
        const started = Date.now();

        return () => {
            const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - started));
            window.clearTimeout(timeout.current);
            timeout.current = window.setTimeout(() => setLoading(false), remaining);
        };
    };

    return { loading, showLoader };
}

export function PageLoadingModal({
    open,
    title,
}: {
    open: boolean;
    title: string;
}) {
    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0D3B2E]/50 backdrop-blur-[3px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="page-loading-title"
        >
            <div className="flex w-[min(90vw,17rem)] flex-col items-center gap-4 rounded-2xl border border-velora-gold/45 bg-velora-ivory px-8 py-8 shadow-[0_28px_70px_rgba(13,59,46,0.35)]">
                <div className="relative flex size-16 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-velora-gold/20" />
                    <span className="absolute inset-[5px] animate-spin rounded-full border-2 border-transparent border-t-velora-gold border-r-velora-gold/50" />
                    <Spinner className="size-7 text-velora-gold" />
                </div>
                <div className="text-center">
                    <p
                        id="page-loading-title"
                        className="text-sm font-medium tracking-wide text-velora-forest"
                    >
                        {title}
                    </p>
                    <p className="mt-1 text-xs text-velora-forest/60">
                        Please wait a moment
                    </p>
                </div>
            </div>
        </div>,
        document.body,
    );
}
