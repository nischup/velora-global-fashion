import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

export function PaginationLinks<T>({ paginator }: { paginator: Paginated<T> }) {
    if (paginator.last_page <= 1) {
        return null;
    }

    return (
        <nav className="flex flex-wrap items-center justify-center gap-1">
            {paginator.links.map((link, index) => {
                const className = cn(
                    'rounded-md px-3 py-1.5 text-sm',
                    link.active && 'bg-primary text-primary-foreground',
                    !link.active && 'hover:bg-accent',
                    !link.url && 'pointer-events-none opacity-40',
                );

                if (!link.url) {
                    return (
                        <span
                            key={`${link.label}-${index}`}
                            className={className}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={`${link.label}-${index}`}
                        href={link.url}
                        className={className}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        preserveScroll
                    />
                );
            })}
        </nav>
    );
}
