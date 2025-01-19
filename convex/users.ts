import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// **Assign a role to a user**
export const assignRole = mutation({
  args: { role: v.union(v.literal("owner"), v.literal("cashier")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (user) {
      // Update existing user's role
      await ctx.db.patch(user._id, { role: args.role });
    } else {
      // Create a new user with the specified role
      await ctx.db.insert("users", {
        userId,
        role: args.role,
        assignedStores: [],
      });
    }
  },
});

// **Fetch user details**
export const getUser = query(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const userId = identity.subject;
  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("userId"), userId))
    .first();

  // Return null instead of throwing an error
  return user || null;
});
// **Add a new store**
// **Add a new store**
export const addStore = mutation({
  args: {
    name: v.string(),
    password: v.string(), // Store password
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Convert user._id to Id<"users">
    const userIdAsId: Id<"users"> = user._id;

    // Create a new store and assign it to the current user
    const storeId = await ctx.db.insert("stores", {
      name: args.name,
      password: args.password, // In a real app, hash the password
      ownerIds: [userIdAsId], // Use the proper Id<"users"> type
      inventory: [],
      totalSales: 0,
      debt: 0,
    });

    // Update the user's assignedStores
    await ctx.db.patch(user._id, {
      assignedStores: [...user.assignedStores, storeId],
    });
  },
});

// **Fetch stores by owner**
export const getStoresByOwner = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Retrieve all stores
    const allStores = await ctx.db.query("stores").collect();

    // Filter stores where ownerIds includes the user's _id
    const ownedStores = allStores.filter((store) =>
      store.ownerIds.includes(user._id)
    );

    return ownedStores;
  },
});

// **Fetch stores assigned to a cashier**
export const getStoresByCashier = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("userId"), userId))
      .first();
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch stores assigned to the cashier
    const stores = await Promise.all(
      user.assignedStores.map((storeId) => ctx.db.get(storeId))
    );

    return stores.filter(Boolean); // Filter out any null entries
  },
});
