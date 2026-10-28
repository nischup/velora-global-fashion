import { Link, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    LayoutGrid,
    Package,
    Palette,
    Shirt,
    Store,
    Tags,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, home } from '@/routes';
import { index as attributesIndex } from '@/routes/admin/attributes';
import { index as brandsIndex } from '@/routes/admin/brands';
import { index as categoriesIndex } from '@/routes/admin/categories';
import { index as ordersIndex } from '@/routes/admin/orders';
import { index as productsIndex } from '@/routes/admin/products';
import { canManageCatalog, type NavItem } from '@/types';

export function AppSidebar() {
    const { auth } = usePage().props;
    const catalogItems: NavItem[] = canManageCatalog(auth.user)
        ? [
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
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
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
