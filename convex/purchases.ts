import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createPurchaseOrder = mutation({
    args: {
        supplierId: v.id("suppliers"),
        expectedDeliveryDate: v.number(),
        items: v.array(
            v.object({
                inventoryId: v.id("inventory"),
                quantity: v.number(),
                unitPrice: v.number(),
            })
        ),
        taxAmount: v.number(),
        shippingAmount: v.number(),
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

        const totalAmount = args.items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0
        );

        const orderId = await ctx.db.insert("purchaseOrders", {
            supplierId: args.supplierId,
            orderDate: Date.now(),
            expectedDeliveryDate: args.expectedDeliveryDate,
            status: "draft",
            totalAmount,
            taxAmount: args.taxAmount,
            shippingAmount: args.shippingAmount,
            notes: args.notes,
            createdBy: user._id,
        });

        for (const item of args.items) {
            await ctx.db.insert("purchaseOrderItems", {
                orderId,
                inventoryId: item.inventoryId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                receivedQuantity: 0,
            });
        }

        return orderId;
    },
});

export const approvePurchaseOrder = mutation({
    args: { orderId: v.id("purchaseOrders") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found");

        if (order.status !== "draft") {
            throw new Error("Only draft orders can be approved");
        }

        await ctx.db.patch(args.orderId, {
            status: "approved",
            approvedBy: user._id,
        });
    },
});

export const receivePurchaseOrderItems = mutation({
    args: {
        orderId: v.id("purchaseOrders"),
        items: v.array(
            v.object({
                itemId: v.id("purchaseOrderItems"),
                receivedQuantity: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const user = await ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
            .first();
        if (!user) throw new Error("User not found");

        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error("Order not found");

        if (order.status !== "approved") {
            throw new Error("Only approved orders can receive items");
        }

        for (const item of args.items) {
            const orderItem = await ctx.db.get(item.itemId);
            if (!orderItem) continue;

            if (item.receivedQuantity <= 0) continue;

            const totalReceived = orderItem.receivedQuantity + item.receivedQuantity;
            if (totalReceived > orderItem.quantity) {
                throw new Error(
                    `Received quantity for item ${orderItem.inventoryId} exceeds ordered quantity`
                );
            }

            await ctx.db.patch(item.itemId, {
                receivedQuantity: totalReceived,
            });

            // Update inventory
            const inventoryItem = await ctx.db.get(orderItem.inventoryId);
            if (!inventoryItem) continue;

            const newQuantity = inventoryItem.quantity + item.receivedQuantity;
            await ctx.db.patch(orderItem.inventoryId, {
                quantity: newQuantity,
            });

            // Record inventory movement
            await ctx.db.insert("inventoryMovements", {
                inventoryId: orderItem.inventoryId,
                warehouseId: inventoryItem.warehouseId,
                quantity: item.receivedQuantity,
                movementType: "purchase",
                referenceId: order._id.toString(),
                date: Date.now(),
                notes: `Received from PO ${order._id}`,
                userId: user._id,
            });
        }

        // Check if all items are fully received
        const allItems = await ctx.db
            .query("purchaseOrderItems")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .collect();

        const isFullyReceived = allItems.every(
            (item) => item.receivedQuantity >= item.quantity
        );

        if (isFullyReceived) {
            await ctx.db.patch(args.orderId, {
                status: "delivered",
            });
        } else {
            await ctx.db.patch(args.orderId, {
                status: "shipped",
            });
        }
    },
});

export const getPurchaseOrder = query({
    args: { orderId: v.id("purchaseOrders") },
    handler: async (ctx, args) => {
        const order = await ctx.db.get(args.orderId);
        if (!order) return null;

        const items = await ctx.db
            .query("purchaseOrderItems")
            .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
            .collect();

        const supplier = await ctx.db.get(order.supplierId);
        const createdBy = await ctx.db.get(order.createdBy);
        const approvedBy = order.approvedBy ? await ctx.db.get(order.approvedBy) : null;

        return {
            ...order,
            items,
            supplier,
            createdBy,
            approvedBy,
        };
    },
});

export const listPurchaseOrders = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        return await ctx.db.query("purchaseOrders").paginate(args.paginationOpts);
    },
});

export const getPurchaseOrdersByStatus = query({
    args: { status: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("purchaseOrders")
            .filter((q) => q.eq(q.field("status"), args.status))
            .collect();
    },
});
