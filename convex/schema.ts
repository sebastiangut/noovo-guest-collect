import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  customers: defineTable({
    // Date personale
    nume:       v.string(),
    email:      v.string(),
    telefon:    v.string(),
    sex:        v.string(),
    varsta:     v.string(),
    localitate: v.string(),
    tara:       v.string(),

    // Semnătură GDPR (base64 PNG data URL)
    signature:   v.string(),
    gdprConsent: v.boolean(),

    // Timestamp creare (ms) — Convex adaugă automat _creationTime, dar îl stocăm și explicit
    createdAt: v.number(),

    // Status notificări
    notif36h:  v.boolean(),
    notif72h:  v.boolean(),
    notif7d:   v.boolean(),
    notif30d:  v.boolean(),
  })
    .index("by_tara",      ["tara"])
    .index("by_localitate", ["localitate"])
    .index("by_email",     ["email"]),
});
