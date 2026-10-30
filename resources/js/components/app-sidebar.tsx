import { Link, usePage } from '@inertiajs/react';
import {
    Barcode,
    BarChart3,
    Building2,
    ClipboardList,
    Images,
    LayoutGrid,
    Package,
    Palette,
    Percent,
    ScanLine,
    Shirt,
    Store,
    Tags,
    Undo2,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import { index as attributesIndex } from '@/routes/admin/attributes';
import { index as barcodesIndex } from '@/routes/admin/barcodes';
import { index as brandsIndex } from '@/routes/admin/brands';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as posIndex } from '@/routes/admin/pos';
import { index as posReports } from '@/routes/admin/pos/reports';
import { index as productsIndex } from '@/routes/admin/products';
import { index as salesIndex } from '@/routes/admin/sales';
import { index as returnsIndex } from '@/routes/admin/returns';
import { index as slidesIndex } from '@/routes/admin/slides';
import { index as storesIndex } from '@/routes/admin/stores';
import { canManageCatalog, type NavItem } from '@/types';

export function AppSidebar() {
    const { auth, name } = usePage().props;
    const catalogItems: NavItem[] = canManageCatalog(auth.user)
        ? [
              {
                  title: 'POS',
                  href: posIndex(),
                  icon: ScanLine,
              },
              {
                  title: 'Returns',
                  href: returnsIndex(),
                  icon: Undo2,
              },
              {
                  title: 'POS reports',
                  href: posReports(),
                  icon: BarChart3,
              },
              {
                  title: 'Stores',
                  href: storesIndex(),
                  icon: Building2,
              },
              {
                  title: 'Orders',
                  href: ordersIndex(),
                  icon: ClipboardList,
              },
              {
                  title: 'Products',
                  href: productsIndex(),
                  icon: Shirt,
              },
              {
                  title: 'Sales',
                  href: salesIndex(),
                  icon: Percent,
              },
              {
                  title: 'Barcodes',
                  href: barcodesIndex(),
                  icon: Barcode,
              },
              {
                  title: 'Categories',
                  href: categoriesIndex(),
                  icon: Tags,
              },
              {
                  title: 'Brands',
                  href: brandsIndex(),
                  icon: Store,
              },
              {
                  title: 'Slides',
                  href: slidesIndex(),
                  icon: Images,
              },
              {
                  title: 'Attributes',
                  href: attributesIndex(),
                  icon: Palette,
              },
          ]
        : [];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'View shop',
            href: home(),
            icon: Package,
        },
        ...catalogItems,
    ];

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="[&>[data-sidebar=sidebar]]:overflow-hidden [&>[data-sidebar=sidebar]]:rounded-xl [&>[data-sidebar=sidebar]]:border [&>[data-sidebar=sidebar]]:border-white/10"
        >
            <SidebarHeader className="border-b border-white/10 p-3 group-data-[collapsible=icon]:p-2">
                <Link
                    href={dashboard()}
                    prefetch
                    className="block overflow-hidden rounded-xl border border-velora-gold/40 bg-velora-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-full"
                >
                    <img
                        src="/images/logo.png"
                        alt={name}
                        className="h-24 w-full object-contain group-data-[collapsible=icon]:size-full group-data-[collapsible=icon]:scale-110 group-data-[collapsible=icon]:object-cover"
                    />
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
