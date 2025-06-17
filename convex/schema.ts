import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkUserId: v.string(),
        email: v.string(),
        name: v.string(),
        role: v.union(v.literal("admin"), v.literal("manager"), v.literal("user")),
    }).index("by_clerk_id", ["clerkUserId"]),

    inventory: defineTable({
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
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_sku", ["sku"])
        .index("by_warehouse", ["warehouseId"]),

    warehouses: defineTable({
        name: v.string(),
        location: v.string(),
        capacity: v.number(),
        managerId: v.id("users"),
        contact: v.string(),
        isActive: v.boolean(),
    }).index("by_name", ["name"]),

    suppliers: defineTable({
        name: v.string(),
        contact: v.string(),
        email: v.string(),
        address: v.string(),
        taxId: v.optional(v.string()),
        paymentTerms: v.number(),
        notes: v.optional(v.string()),
    }).index("by_name", ["name"]),

    purchaseOrders: defineTable({
        supplierId: v.id("suppliers"),
        orderDate: v.number(),
        expectedDeliveryDate: v.number(),
        status: v.union(
            v.literal("draft"),
            v.literal("pending"),
            v.literal("approved"),
            v.literal("shipped"),
            v.literal("delivered"),
            v.literal("cancelled")
        ),
        totalAmount: v.number(),
        taxAmount: v.number(),
        shippingAmount: v.number(),
        notes: v.optional(v.string()),
        createdBy: v.id("users"),
        approvedBy: v.optional(v.id("users")),
    }).index("by_supplier", ["supplierId"]),

    purchaseOrderItems: defineTable({
        orderId: v.id("purchaseOrders"),
        inventoryId: v.id("inventory"),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
        receivedQuantity: v.number(),
    }).index("by_order", ["orderId"]),

    inventoryMovements: defineTable({
        inventoryId: v.id("inventory"),
        warehouseId: v.id("warehouses"),
        quantity: v.number(),
        movementType: v.union(
            v.literal("purchase"),
            v.literal("sale"),
            v.literal("transfer"),
            v.literal("adjustment")
        ),
        referenceId: v.string(),
        date: v.number(),
        notes: v.optional(v.string()),
        userId: v.id("users"),
    })
        .index("by_inventory", ["inventoryId"])
        .index("by_warehouse", ["warehouseId"]),
});
