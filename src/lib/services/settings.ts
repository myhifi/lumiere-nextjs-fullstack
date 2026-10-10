import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CONTACT } from "@/lib/constants/contact";
import { buildWhatsAppLink } from "@/lib/constants/contact";

// ─── Keys (as const for type safety) ───
export const SETTING_KEYS = {
  WHATSAPP_NUMBER: "whatsappNumber",
} as const;

// ─── Defaults used when no DB row exists yet ───
const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.WHATSAPP_NUMBER]: CONTACT.whatsappNumber,
};

// ─── Read (cached per render, fail-safe fallback) ───
export const getWhatsAppNumber = cache(async (): Promise<string> => {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: SETTING_KEYS.WHATSAPP_NUMBER },
    });
    return row?.value ?? DEFAULTS[SETTING_KEYS.WHATSAPP_NUMBER];
  } catch (error) {
    // Never break the public site if the DB is unreachable
    console.error("[getWhatsAppNumber]", error);
    return DEFAULTS[SETTING_KEYS.WHATSAPP_NUMBER];
  }
});

// ─── Write (upsert — safe to call on a fresh DB) ───
export async function setWhatsAppNumber(value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key: SETTING_KEYS.WHATSAPP_NUMBER },
    update: { value },
    create: { key: SETTING_KEYS.WHATSAPP_NUMBER, value },
  });
}

/**
 * Async DB-backed WhatsApp link builder.
 * Used by WhatsAppButton (Server Component).
 */
export async function getWhatsAppLink(message?: string): Promise<string> {
  const number = await getWhatsAppNumber();
  return buildWhatsAppLink(
    number,
    message ?? CONTACT.whatsappDefaultMessage
  );
}