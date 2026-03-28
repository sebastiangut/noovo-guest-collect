import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── List all customers (real-time via Convex subscriptions) ───────────
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").collect();
  },
});

// ── Add a new customer ─────────────────────────────────────────────────
export const add = mutation({
  args: {
    nume:        v.string(),
    email:       v.string(),
    telefon:     v.string(),
    sex:         v.string(),
    varsta:      v.string(),
    localitate:  v.string(),
    tara:        v.string(),
    signature:   v.string(),
    gdprConsent: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customers", {
      ...args,
      createdAt: Date.now(),
      notif36h:  false,
      notif72h:  false,
      notif7d:   false,
      notif30d:  false,
    });
  },
});

// ── Delete a customer ──────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// ── Internal: mark a notification as sent ─────────────────────────────
export const markNotified = mutation({
  args: {
    id:    v.id("customers"),
    field: v.union(
      v.literal("notif36h"),
      v.literal("notif72h"),
      v.literal("notif7d"),
      v.literal("notif30d")
    ),
  },
  handler: async (ctx, { id, field }) => {
    await ctx.db.patch(id, { [field]: true });
  },
});

// ── Stats query (optional, for dashboard optimisation) ────────────────
export const stats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("customers").collect();
    const oradea  = all.filter(c => c.tara === "România" && c.localitate.toLowerCase().trim() === "oradea").length;
    const romania = all.filter(c => c.tara === "România" && c.localitate.toLowerCase().trim() !== "oradea").length;
    const world   = all.filter(c => c.tara !== "România").length;
    return { total: all.length, oradea, romania, world };
  },
});
