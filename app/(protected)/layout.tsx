import { ReactNode } from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardNavbar } from "@/components/dashboard/navbar"


export default async function DashboardLayout({
    children,
}: {
    children: ReactNode
}) {
    const { userId } = await auth()

    if (!userId) {
        redirect("/sign-in")
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardNavbar />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-800">
                    {children}
                </main>
            </div>
        </div>
    )
}
