import { query } from "./_generated/server";

export const getStats = query({
    handler: async (ctx) => {
        const inventoryCount = await ctx.db.query("inventory").collect();
        const warehouseCount = await ctx.db.query("warehouses").collect();
        const supplierCount = await ctx.db.query("suppliers").collect();

        const lowStockItems = await ctx.db
            .query("inventory")
            .filter((q) => q.lt(q.field("quantity"), q.field("minStockLevel")))
            .collect();

        return {
            totalItems: inventoryCount,
            totalWarehouses: warehouseCount,
            totalSuppliers: supplierCount,
            lowStockItems: lowStockItems.length,
        };
    },
});

export const getRecentActivities = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("inventoryMovements")
            .order("desc")
            .take(10)
    },
});
