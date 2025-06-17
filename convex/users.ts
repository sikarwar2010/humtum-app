import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
    args: {
        clerkUserId: v.string(),
        email: v.string(),
        name: v.string(),
        role: v.union(v.literal("admin"), v.literal("manager"), v.literal("user")),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
            .first();

        if (existingUser) return;

        await ctx.db.insert("users", {
            clerkUserId: args.clerkUserId,
            email: args.email,
            name: args.name,
            role: args.role,
        });
    },
});

export const updateUser = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.userId))
            .first();

        if (!user) return;

        await ctx.db.patch(user._id, {
            email: args.email,
            name: args.name,
        });
    },
});

export const deleteUser = mutation({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.userId))
            .first();

        if (!user) return;

        await ctx.db.delete(user._id);
    },
});

export const getUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.userId))
            .first();
    },
});

export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const updateUserRole = mutation({
    args: {
        userId: v.string(),
        role: v.union(v.literal("admin"), v.literal("manager"), v.literal("user")),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.userId))
            .first();

        if (!user) throw new Error("User not found");

        await ctx.db.patch(user._id, { role: args.role });
    },
});
