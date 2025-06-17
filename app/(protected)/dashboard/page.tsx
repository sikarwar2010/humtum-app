import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LowStockItems } from "@/components/dashboard/low-stock-items";
import { WarehouseCapacity } from "@/components/dashboard/warehouse-capacity";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <DashboardShell>
            <DashboardHeader
                heading="Dashboard"
                text="Overview of your inventory"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <OverviewCards />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <WarehouseCapacity className="lg:col-span-4" />
                <RecentActivity className="lg:col-span-3" />
            </div>
            <LowStockItems />
        </DashboardShell>
    );
}
