// ═══════════════════════════════════════════════════
// ✅ Zod schema factory for AI settings
// ═══════════════════════════════════════════════════

import { z } from "zod";
import { AI_PROVIDERS } from "@/lib/services/ai-settings";

type Translate = (key: string) => string;

export function createAiSettingsSchema(t: Translate) {
  return z.object({
    provider: z.enum(AI_PROVIDERS),

    model: z
      .string()
      .trim()
      .min(1, t("aiModelRequired"))
      .max(100, t("aiModelTooLong")),

    enabled: z.boolean(),

    /**
     * Optional on update:
     * - Non-empty string → validate and replace the stored key.
     * - Empty string / undefined → keep the existing key.
     */
    apiKey: z
      .string()
      .trim()
      .max(500, t("aiKeyTooLong"))
      .optional(),
  });
}

export type AiSettingsInput = z.infer<
  ReturnType<typeof createAiSettingsSchema>
>;