import { Doc } from "@/convex/_generated/dataModel";

export type InventoryItem = Doc<"inventory"> & {
    supplier?: Doc<"suppliers">;
    warehouse?: Doc<"warehouses">;
};

export type Warehouse = Doc<"warehouses"> & {
    manager?: Doc<"users">;
};

export type Supplier = Doc<"suppliers">;

export type PurchaseOrder = Doc<"purchaseOrders"> & {
    supplier?: Doc<"suppliers">;
    createdBy?: Doc<"users">;
    approvedBy?: Doc<"users">;
    items?: PurchaseOrderItem[];
};

export type PurchaseOrderItem = Doc<"purchaseOrderItems"> & {
    inventory?: Doc<"inventory">;
};

export type InventoryMovement = Doc<"inventoryMovements"> & {
    inventory?: Doc<"inventory">;
    warehouse?: Doc<"warehouses">;
    user?: Doc<"users">;
};

export type User = Doc<"users">;

export interface DashboardStats {
    totalItems: number;
    totalWarehouses: number;
    totalSuppliers: number;
    lowStockItems: number;
}
