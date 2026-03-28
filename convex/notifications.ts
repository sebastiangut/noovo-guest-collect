import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─────────────────────────────────────────────────────────────────────────
// Twilio credentials sunt setate în Convex Dashboard → Settings → Environment Variables:
//   TWILIO_ACCOUNT_SID   = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN    = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   TWILIO_PHONE         = +40XXXXXXXXX          (număr SMS Twilio)
//   TWILIO_WA_FROM       = whatsapp:+14155238886 (WhatsApp sandbox sau număr business)
// ─────────────────────────────────────────────────────────────────────────

// ── Mesaje personalizate per interval ─────────────────────────────────
const MSG = {
  notif36h: (name: string) =>
    `Bună ziua, ${name}! 🥂 Vă mulțumim că ați ales NOO'VO Resto Lounge din Oradea. Sperăm că experiența a fost pe măsura așteptărilor!`,

  notif72h: (name: string) =>
    `Dragă ${name}, 🍽️ vă așteptăm din nou la NOO'VO! Rezervați o masă: +40 xxx xxx xxx. O zi minunată!`,

  notif7d: (name: string) =>
    `${name}, ✨ săptămâna aceasta avem preparate speciale la NOO'VO Resto Lounge. Veniți să le descoperiți!`,

  notif30d: (name: string) =>
    `${name}, ne-a fost dor de dvs. 🎁 Vă oferim 10% reducere la următoarea vizită la NOO'VO. Vă așteptăm!`,
};

// ── Twilio API wrapper ────────────────────────────────────────────────
async function twilioSend(to: string, from: string, body: string): Promise<boolean> {
  const sid   = process.env.TWILIO_ACCOUNT_SID!;
  const token = process.env.TWILIO_AUTH_TOKEN!;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: "Basic " + btoa(`${sid}:${token}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    console.error("Twilio error:", err);
    return false;
  }
  return true;
}

// ── Send one notification (WhatsApp → fallback SMS) ───────────────────
async function sendNotification(telefon: string, message: string): Promise<void> {
  const waFrom   = process.env.TWILIO_WA_FROM!;
  const smsFrom  = process.env.TWILIO_PHONE!;

  // Format phone for WhatsApp
  const waTo = `whatsapp:${telefon.startsWith("+") ? telefon : "+" + telefon}`;

  const waSent = await twilioSend(waTo, waFrom, message);
  if (!waSent) {
    // Fallback: plain SMS
    const smsTo = telefon.startsWith("+") ? telefon : "+" + telefon;
    await twilioSend(smsTo, smsFrom, message);
  }
}

// ── Internal mutation: mark notified ─────────────────────────────────
export const markNotified = internalMutation({
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

// ── Main scheduled action ─────────────────────────────────────────────
// Rulat la fiecare 30 de minute de crons.ts
export const checkAndSend = internalAction({
  handler: async (ctx) => {
    const customers = await ctx.runQuery(internal.customers.list);
    const now = Date.now();

    for (const customer of customers) {
      const hoursElapsed = (now - customer.createdAt) / (1000 * 60 * 60);
      const { _id, nume, telefon } = customer;

      // 36 ore
      if (!customer.notif36h && hoursElapsed >= 36) {
        try {
          await sendNotification(telefon, MSG.notif36h(nume));
          await ctx.runMutation(internal.notifications.markNotified, { id: _id, field: "notif36h" });
          console.log(`[notif36h] Sent to ${nume} (${telefon})`);
        } catch (e) { console.error(`[notif36h] Failed for ${nume}:`, e); }
      }

      // 72 ore
      if (!customer.notif72h && hoursElapsed >= 72) {
        try {
          await sendNotification(telefon, MSG.notif72h(nume));
          await ctx.runMutation(internal.notifications.markNotified, { id: _id, field: "notif72h" });
          console.log(`[notif72h] Sent to ${nume} (${telefon})`);
        } catch (e) { console.error(`[notif72h] Failed for ${nume}:`, e); }
      }

      // 7 zile (168 ore)
      if (!customer.notif7d && hoursElapsed >= 168) {
        try {
          await sendNotification(telefon, MSG.notif7d(nume));
          await ctx.runMutation(internal.notifications.markNotified, { id: _id, field: "notif7d" });
          console.log(`[notif7d] Sent to ${nume} (${telefon})`);
        } catch (e) { console.error(`[notif7d] Failed for ${nume}:`, e); }
      }

      // 30 zile (720 ore)
      if (!customer.notif30d && hoursElapsed >= 720) {
        try {
          await sendNotification(telefon, MSG.notif30d(nume));
          await ctx.runMutation(internal.notifications.markNotified, { id: _id, field: "notif30d" });
          console.log(`[notif30d] Sent to ${nume} (${telefon})`);
        } catch (e) { console.error(`[notif30d] Failed for ${nume}:`, e); }
      }
    }
  },
});
