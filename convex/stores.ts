import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { v } from "convex/values";

// Fetch store details by ID
export const getStoreById = query({
  args: { storeId: v.id("stores") },
  handler: async (ctx, { storeId }: { storeId: Id<"stores"> }) => {
    const store = await ctx.db.get(storeId);

    if (!store) {
      throw new Error("Store not found");
    }

    return store;
  },
});

// Add a new inventory item
export const addInventoryItem = mutation({
  args: {
    storeId: v.id("stores"),
    name: v.string(),
    price: v.number(),
    stock: v.number(),
  },
  handler: async (ctx, { storeId, name, price, stock }) => {
    const store = await ctx.db.get(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    // Add new inventory item
    const newItem = {
      name,
      itemId: crypto.randomUUID(), // Unique ID for the item
      price,
      stock,
    };

    // Update the store's inventory
    await ctx.db.patch(storeId, {
      inventory: [...store.inventory, newItem],
    });

    return newItem; // Return the added item
  },
});

// Delete an inventory item
export const deleteInventoryItem = mutation({
  args: {
    storeId: v.id("stores"),
    itemId: v.string(),
  },
  handler: async (ctx, { storeId, itemId }) => {
    const store = await ctx.db.get(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    // Remove the item from the inventory
    const updatedInventory = store.inventory.filter(
      (item) => item.itemId !== itemId
    );

    await ctx.db.patch(storeId, {
      inventory: updatedInventory,
    });

    return { success: true };
  },
});

// Update an inventory item
export const updateInventoryItem = mutation({
  args: {
    storeId: v.id("stores"),
    itemId: v.string(),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    stock: v.optional(v.number()),
  },
  handler: async (ctx, { storeId, itemId, name, price, stock }) => {
    const store = await ctx.db.get(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    // Update the item in the inventory
    const updatedInventory = store.inventory.map((item) =>
      item.itemId === itemId
        ? {
            ...item,
            name: name ?? item.name,
            price: price ?? item.price,
            stock: stock ?? item.stock,
          }
        : item
    );

    await ctx.db.patch(storeId, {
      inventory: updatedInventory,
    });

    return { success: true };
  },
});

// Query to fetch store by name and password
export const getStoreByCredentials = query({
  args: { name: v.string(), password: v.string() },
  handler: async (ctx, { name, password }) => {
    const store = await ctx.db
      .query("stores")
      .filter((q) => q.eq(q.field("name"), name))
      .first();

    if (!store || store.password !== password) {
      throw new Error("Invalid store credentials");
    }

    return store;
  },
});

// Mutation to update inventory after checkout
export const checkoutItem = mutation({
  args: {
    storeId: v.id("stores"),
    itemId: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, { storeId, itemId, quantity }) => {
    const store = await ctx.db.get(storeId);
    if (!store) {
      throw new Error("Store not found");
    }

    const updatedInventory = store.inventory.map((item) => {
      if (item.itemId === itemId) {
        if (item.stock < quantity) {
          throw new Error("Insufficient stock");
        }
        return { ...item, stock: item.stock - quantity };
      }
      return item;
    });

    await ctx.db.patch(storeId, { inventory: updatedInventory });

    return { success: true };
  },
});
