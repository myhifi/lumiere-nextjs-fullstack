"use server";

import { getTranslations } from "next-intl/server";
import { detectIntent } from "@/lib/assistant/matcher";
import type { IntentKey } from "@/lib/assistant/knowledge-base";

// ═══════════════════════════════════════════════════
// 🤖 Server Action: Ask the FAQ Assistant
// ═══════════════════════════════════════════════════
// Pure detection + translation lookup. No external API.
// Response time: < 50 ms.

export type AssistantReply = {
  intent: IntentKey | null;
  text: string;
};

export async function askAssistant(query: string): Promise<AssistantReply> {
  // Guard against empty / whitespace input
  if (!query || typeof query !== "string" || query.trim().length < 2) {
    const t = await getTranslations("Assistant");
    return { intent: null, text: t("fallback") };
  }

  const t = await getTranslations("Assistant");
  const intent = detectIntent(query);

  if (!intent) {
    return { intent: null, text: t("fallback") };
  }

  // Use an explicit map — keeps next-intl's strict typing happy
  // and makes future key additions a compile-time checklist.
  const textMap: Record<IntentKey, string> = {
    hours: t("intents.hours"),
    location: t("intents.location"),
    parking: t("intents.parking"),
    reservation: t("intents.reservation"),
    cancel: t("intents.cancel"),
    menu: t("intents.menu"),
    allergies: t("intents.allergies"),
    vegetarian: t("intents.vegetarian"),
    halal: t("intents.halal"),
    events: t("intents.events"),
  };

  return { intent, text: textMap[intent] };
}