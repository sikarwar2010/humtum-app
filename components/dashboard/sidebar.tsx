"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Warehouse, Package, ShoppingCart, Users, Settings, LogOut } from "lucide-react";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        role: ["admin", "manager", "user"],
    },
    {
        label: "Inventory",
        icon: Package,
        href: "/inventory",
        role: ["admin", "manager", "user"],
    },
    {
        label: "Warehouses",
        icon: Warehouse,
        href: "/warehouses",
        role: ["admin", "manager"],
    },
    {
        label: "Purchases",
        icon: ShoppingCart,
        href: "/purchases",
        role: ["admin", "manager"],
    },
    {
        label: "Suppliers",
        icon: Users,
        href: "/suppliers",
        role: ["admin", "manager"],
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        role: ["admin"],
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user } = useUser();
    const users = useQuery(api.users.getAllUsers);
    const currentUser = users?.find((u) => u.clerkUserId === user?.id);

    return (
        <div className="hidden h-full bg-background border-r md:flex md:w-64 md:flex-col">
            <div className="flex h-full flex-col gap-2">
                {/* Logo/Branding */}
                <div className="flex h-16 items-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Warehouse className="h-6 w-6 text-primary" />
                        <span className="text-lg font-semibold">InventoryPro</span>
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="flex flex-col gap-1 px-2">
                        {routes.map((route) => {
                            if (!route.role.includes(currentUser?.role || "user")) return null;

                            const isActive = pathname.startsWith(route.href);
                            return (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                                        isActive ? "bg-accent text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    <route.icon className="h-4 w-4" />
                                    {route.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.fullName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                                {currentUser?.role ? (
                                    <span className="capitalize">{currentUser.role}</span>
                                ) : (
                                    "Loading..."
                                )}
                            </p>
                        </div>
                        <SignOutButton>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <LogOut className="h-4 w-4" />
                                <span className="sr-only">Sign out</span>
                            </Button>
                        </SignOutButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
