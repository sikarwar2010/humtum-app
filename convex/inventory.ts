import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createInventoryItem = mutation({
    args: {
        name: v.string(),
        description: v.string(),
        sku: v.string(),
        barcode: v.optional(v.string()),
        category: v.string(),
        unit: v.string(),
        costPrice: v.number(),
        sellingPrice: v.number(),
        quantity: v.number(),
        minStockLevel: v.number(),
        supplierId: v.id("suppliers"),
        warehouseId: v.id("warehouses"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const existingItem = await ctx.db
            .query("inventory")
            .withIndex("by_sku", (q) => q.eq("sku", args.sku))
            .first();

        if (existingItem) throw new Error("SKU already exists");

        const now = Date.now();
        return await ctx.db.insert("inventory", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateInventoryItem = mutation({
    args: {
        id: v.id("inventory"),
        name: v.string(),
        description: v.string(),
        sku: v.string(),
        barcode: v.optional(v.string()),
        category: v.string(),
        unit: v.string(),
        costPrice: v.number(),
        sellingPrice: v.number(),
        minStockLevel: v.number(),
        supplierId: v.id("suppliers"),
        warehouseId: v.id("warehouses"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const existingItem = await ctx.db.get(args.id);
        if (!existingItem) throw new Error("Inventory item not found");

        await ctx.db.patch(args.id, {
            ...args,
            updatedAt: Date.now(),
        });
    },
});

export const adjustInventoryQuantity = mutation({
    args: {
        id: v.id("inventory"),
        quantity: v.number(),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        const item = await ctx.db.get(args.id);
        if (!item) throw new Error("Inventory item not found");

        const newQuantity = item.quantity + args.quantity;
        if (newQuantity < 0) throw new Error("Quantity cannot be negative");

        await ctx.db.patch(args.id, { quantity: newQuantity });

        await ctx.db.insert("inventoryMovements", {
            inventoryId: args.id,
            warehouseId: item.warehouseId,
            quantity: args.quantity,
            movementType: "adjustment",
            referenceId: `ADJ-${Date.now()}`,
            date: Date.now(),
            notes: args.notes,
            userId: user._id,
        });
    },
});

export const getInventoryItem = query({
    args: { id: v.id("inventory") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const listInventory = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        return await ctx.db.query("inventory").paginate(args.paginationOpts);
    },
});

export const getLowStockItems = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("inventory")
            .filter((q) => q.lt(q.field("quantity"), q.field("minStockLevel")))
            .collect();
    },
});

export const getInventoryByWarehouse = query({
    args: { warehouseId: v.id("warehouses") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("inventory")
            .withIndex("by_warehouse", (q) => q.eq("warehouseId", args.warehouseId))
            .collect();
    },
});

export const getInventoryMovementHistory = query({
    args: { inventoryId: v.id("inventory") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("inventoryMovements")
            .withIndex("by_inventory", (q) => q.eq("inventoryId", args.inventoryId))
            .order("desc")
            .collect();
    },
});
