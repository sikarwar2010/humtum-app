"use client"

import { usePathname } from "next/navigation"
import { Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileSidebar } from "./mobile-sidebar"

export function DashboardNavbar() {
    const pathname = usePathname()
    const title = pathname.split("/").pop()?.replace("-", " ") || "Dashboard"

    return (
        <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center space-x-4">
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-[280px]">
                            <MobileSidebar />
                        </SheetContent>
                    </Sheet>
                    <h1 className="text-lg font-semibold capitalize">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            className="pl-10 w-64 focus-visible:ring-0"
                        />
                    </div>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" className="hidden md:flex">
                        Notifications
                    </Button>
                </div>
            </div>
        </header>
    )
}
