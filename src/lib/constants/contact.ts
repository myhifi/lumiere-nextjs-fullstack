// ═══════════════════════════════════════════════════
// 📞 Restaurant contact constants (fallback defaults)
// ═══════════════════════════════════════════════════
// These values are FALLBACKS. The live WhatsApp number
// is read from the database (see lib/services/settings.ts).
// The other fields (email/phone/address) remain hardcoded
// for now — promote them to `Setting` rows when needed.

export const CONTACT = {
  // Fallback used until an admin saves a value in /admin/settings
  whatsappNumber: "201001234567",

  whatsappDefaultMessage:
    "مرحباً Lumière! أرغب في الاستفسار عن حجز طاولة.",

  email: "hello@lumiere.example",
  phone: "+20 100 123 4567",
  address: "القاهرة، مصر",
} as const;

// ─── Pure link builder (sync, DB-free) ───
// Accepts a pre-normalized number (digits only) and a message.
export function buildWhatsAppLink(number: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}