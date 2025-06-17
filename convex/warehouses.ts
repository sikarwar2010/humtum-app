import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createWarehouse = mutation({
    args: {
        name: v.string(),
        location: v.string(),
        capacity: v.number(),
        managerId: v.id("users"),
        contact: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const existingWarehouse = await ctx.db
            .query("warehouses")
            .withIndex("by_name", (q) => q.eq("name", args.name))
            .first();

        if (existingWarehouse) throw new Error("Warehouse name already exists");

        return await ctx.db.insert("warehouses", {
            ...args,
            isActive: true,
        });
    },
});

export const updateWarehouse = mutation({
    args: {
        id: v.id("warehouses"),
        name: v.string(),
        location: v.string(),
        capacity: v.number(),
        managerId: v.id("users"),
        contact: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        await ctx.db.patch(args.id, args);
    },
});

export const getWarehouse = query({
    args: { id: v.id("warehouses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const listWarehouses = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("warehouses").collect();
    },
});

export const getWarehouseCapacity = query({
    args: { warehouseId: v.id("warehouses") },
    handler: async (ctx, args) => {
        const warehouse = await ctx.db.get(args.warehouseId);
        if (!warehouse) throw new Error("Warehouse not found");

        const inventory = await ctx.db
            .query("inventory")
            .withIndex("by_warehouse", (q) => q.eq("warehouseId", args.warehouseId))
            .collect();

        const usedCapacity = inventory.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        return {
            totalCapacity: warehouse.capacity,
            usedCapacity,
            availableCapacity: warehouse.capacity - usedCapacity,
            utilizationPercentage: (usedCapacity / warehouse.capacity) * 100,
        };
    },
});
