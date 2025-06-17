"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Package,
    Warehouse,
    ShoppingCart,
    Users,
    Settings,
    X,
} from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export function MobileSidebar() {
    const pathname = usePathname()
    const currentUser = useQuery(api.users.getCurrentUser)

    const routes = [
        {
            label: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            active: pathname === "/dashboard",
            roles: ["admin", "manager", "employee"],
        },
        {
            label: "Inventory",
            href: "/dashboard/inventory",
            icon: Package,
            active: pathname.startsWith("/dashboard/inventory"),
            roles: ["admin", "manager", "employee"],
        },
        {
            label: "Warehouses",
            href: "/dashboard/warehouses",
            icon: Warehouse,
            active: pathname.startsWith("/dashboard/warehouses"),
            roles: ["admin", "manager"],
        },
        {
            label: "Purchases",
            href: "/dashboard/purchases",
            icon: ShoppingCart,
            active: pathname.startsWith("/dashboard/purchases"),
            roles: ["admin", "manager"],
        },
        {
            label: "Users",
            href: "/dashboard/users",
            icon: Users,
            active: pathname.startsWith("/dashboard/users"),
            roles: ["admin"],
        },
        {
            label: "Settings",
            href: "/dashboard/settings",
            icon: Settings,
            active: pathname.startsWith("/dashboard/settings"),
            roles: ["admin"],
        },
    ]

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                    InventoryPro
                </h1>
                <Button variant="ghost" size="icon" asChild>
                    <X className="w-5 h-5" />
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                <nav className="space-y-1">
                    {routes
                        .filter((route) =>
                            route.roles.includes(currentUser?.role || "operator")
                        )
                        .map((route) => (
                            <Link key={route.href} href={route.href}>
                                <Button
                                    variant={route.active ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        route.active && "bg-indigo-50 dark:bg-indigo-900/20"
                                    )}
                                >
                                    <route.icon className="w-4 h-4 mr-2" />
                                    {route.label}
                                </Button>
                            </Link>
                        ))}
                </nav>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                            {currentUser?.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </span>
                    </div>
                    <div>
                        <p className="text-sm font-medium">
                            {currentUser?.name || "Loading..."}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {currentUser?.role || "Loading..."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
