// ═══════════════════════════════════════════════════
// ✅ Zod schema for AI chat requests
// ═══════════════════════════════════════════════════

import { z } from "zod";

const SUPPORTED_LOCALES = [
  "ar",
  "en",
  "fr",
  "de",
  "es",
  "it",
  "zh",
] as const;

export const aiChatRequestSchema = z.object({
  /**
   * UIMessage[] produced by `useChat`. Passed through
   * `convertToModelMessages` on the server, which performs
   * its own structural validation.
   */
  messages: z.array(z.unknown()).min(1).max(50),
  locale: z.enum(SUPPORTED_LOCALES).default("en"),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;