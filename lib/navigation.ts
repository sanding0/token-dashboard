import { House, Plus, type LucideIcon } from "lucide-react"

export type NavigationItem = {
    label: string
    href: string
    icon?: LucideIcon
    disabled?: boolean
}

export type NavigationGroup = {
    label: string
    icon?: LucideIcon
    items: NavigationItem[]
}

export type NavigationEntry = NavigationItem | NavigationGroup

export const navigationItems: NavigationEntry[] = [
    {
        label: "Dashboard",
        href: "/",
        icon: House,
    },
    {
        label: "Mint",
        href: "/mint",
        icon: Plus,
    }
]