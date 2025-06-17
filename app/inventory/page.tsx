import { InventoryTable } from "@/components/inventory/inventory-table";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function InventoryPage() {
    return (
        <div className="space-y-4">
            <DashboardHeader
                heading="Inventory"
                text="Manage your inventory items"
            >
                <Button asChild>
                    <Link href="/inventory/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Link>
                </Button>
            </DashboardHeader>
            <InventoryTable />
        </div>
    );
}
