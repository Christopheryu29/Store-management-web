import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentDocument: v.optional(v.id("documents")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentDocument"]),

  users: defineTable({
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("cashier"), v.null()),
    assignedStores: v.array(v.id("stores")),
  }).index("by_user", ["userId"]),

  stores: defineTable({
    name: v.string(),
    password: v.string(),
    ownerIds: v.array(v.id("users")),

    inventory: v.array(
      v.object({
        itemId: v.string(),
        name: v.string(),
        price: v.number(),
        stock: v.number(),
      })
    ),
    totalSales: v.number(),
    debt: v.number(),
  }).index("by_name", ["name"]),
});
