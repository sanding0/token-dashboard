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
} from "@/components/ui/sidebar"
import { NavigationEntry, NavigationItem, navigationItems } from "@/lib/navigation"
import { ChartSpline } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
    const pathname = usePathname()
    const getMenuItem = (item: NavigationItem) => {
        return (
            <SidebarMenuItem key={item.label}>
                <SidebarMenuButton isActive={pathname === item.href} render={<Link href={item.href}></Link>}>
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }

    return (
        <Sidebar>
            <SidebarHeader className="m-5">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link className="flex gap-2 items-center" href="/">
                            <ChartSpline width={40} height={40} />
                            <span className="text-xl">Token Dashboard</span>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="m-auto">
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

                        return getMenuItem(entry)
                    })
                }
            </SidebarContent>
            <SidebarFooter />
        </Sidebar>
    )
}