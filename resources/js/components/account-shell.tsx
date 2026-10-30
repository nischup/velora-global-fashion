import type { PropsWithChildren, ReactNode } from 'react';
import { AccountNav } from '@/components/account-nav';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

export function AccountShell({
    children,
    className,
    showNav = true,
}: PropsWithChildren<{ className?: string; showNav?: boolean }>) {
    return (
        <div
            className={cn(
                'min-h-[calc(100vh-4rem)] bg-velora-cream text-velora-green',
                className,
            )}
        >
            <div className="mx-auto max-w-6xl px-4 py-10">
                {showNav && <AccountNav />}
                {children}
            </div>
        </div>
    );
}

export function AccountGoldRule({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <span className="h-px flex-1 bg-velora-gold/70" />
            <span className="size-1.5 rotate-45 bg-velora-gold" />
            <span className="h-px flex-1 bg-velora-gold/70" />
        </div>
    );
}

export function orderStatusClass(status: OrderStatus): string {
    switch (status) {
        case 'delivered':
            return 'border-velora-green/20 bg-velora-green text-velora-cream';
        case 'cancelled':
        case 'refunded':
            return 'border-velora-green/15 bg-velora-green/8 text-velora-green/60';
        case 'shipped':
        case 'processing':
            return 'border-velora-forest/20 bg-velora-forest/10 text-velora-forest';
        default:
            return 'border-velora-gold/40 bg-velora-gold/15 text-velora-green';
    }
}

export function AccountEmpty({
    children,
    action,
}: {
    children: ReactNode;
    action?: ReactNode;
}) {
    return (
        <div className="mt-8 rounded-2xl border border-velora-gold/25 bg-velora-ivory px-6 py-10 text-center">
            <p className="text-velora-forest/70">{children}</p>
            {action && <div className="mt-5">{action}</div>}
        </div>
    );
}
