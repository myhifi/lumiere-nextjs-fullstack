// ═══════════════════════════════════════════════════
// 📞 معلومات التواصل مع المطعم
// ═══════════════════════════════════════════════════

// ⚠️ عدّل هذه القيم بمعلوماتك الحقيقية
export const CONTACT = {
  // رقم واتساب بصيغة دولية بدون + أو مسافات
  // مثال: 201001234567 (مصر)
  whatsappNumber: "201001234567",

  // نص الرسالة الافتراضية عند فتح الواتساب
  whatsappDefaultMessage:
    "مرحباً Lumière! أرغب في الاستفسار عن حجز طاولة.",

  email: "hello@lumiere.example",
  phone: "+20 100 123 4567",
  address: "القاهرة، مصر",
} as const;

// ─── مولّد رابط واتساب ───
export function getWhatsAppLink(message?: string): string {
  const text = encodeURIComponent(message ?? CONTACT.whatsappDefaultMessage);
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${text}`;
}