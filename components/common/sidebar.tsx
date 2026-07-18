'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    useSidebar,
} from "@/components/ui/sidebar"
import { NavigationEntry, NavigationItem, navigationItems } from "@/lib/navigation"
import { ChartSpline } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
    const pathname = usePathname()
    const { isMobile, setOpenMobile } = useSidebar()

    const closeMobile = () => {
        if (isMobile) setOpenMobile(false)
    }

    const getMenuItem = (item: NavigationItem) => {
        return (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton isActive={pathname === item.href} render={<Link href={item.href} onClick={closeMobile} />}>
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link className="flex min-w-0 items-center gap-2" href="/" onClick={closeMobile}>
                            <ChartSpline className="size-8 shrink-0 sm:size-9" />
                            <span className="truncate text-base font-medium sm:text-lg">Token Dashboard</span>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="px-2 py-3">
                {
                    navigationItems.map((entry: NavigationEntry) => {
                        if ('items' in entry) {
                            return (
                                <SidebarGroup key={entry.label}>
                                    <SidebarGroupLabel>{entry.label}</SidebarGroupLabel>
                                    <SidebarMenu>
                                        {entry.items.map(getMenuItem)}
                                    </SidebarMenu>
                                </SidebarGroup>
                            )
                        }

                        return (
                            <SidebarMenu key={entry.label}>
                                {getMenuItem(entry)}
                            </SidebarMenu>
                        )
                    })
                }
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}