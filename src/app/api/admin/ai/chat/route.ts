// ═══════════════════════════════════════════════════
// 🌊 Admin AI Co-Pilot — streaming chat endpoint
// ═══════════════════════════════════════════════════
// - Auth: ADMIN only.
// - Requires AI to be enabled and a valid stored key.
// - Builds live context, streams provider response.

import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { auth } from "@/auth";
import {
  getAiSettings,
  getDecryptedAiApiKey,
} from "@/lib/services/ai-settings";
import { createLanguageModel, getProviderOptions } from "@/lib/ai/provider";
import { buildAiContext } from "@/lib/ai/context";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { aiChatRequestSchema } from "@/lib/validations/ai-chat";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // ─── Auth ───────────────────────────────────────
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // ─── Config ─────────────────────────────────────
    const settings = await getAiSettings();
    if (!settings.enabled || !settings.hasApiKey) {
      return Response.json({ error: "AI assistant is disabled or missing key" }, { status: 400 });
    }

    const apiKey = await getDecryptedAiApiKey();
    if (!apiKey) {
      return Response.json(
        { error: "Stored API key could not be decrypted" },
        { status: 400 }
      );
    }

    // ─── Validation ─────────────────────────────────
    const body: unknown = await req.json();
    const parsed = aiChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { messages, locale } = parsed.data;

    // ─── Build context + prompt ────────────────────
    const context = await buildAiContext(30);
    const system = buildSystemPrompt({ context, locale });

    // ─── Provider + stream ─────────────────────────
    const model = createLanguageModel(settings.provider, apiKey, settings.model);

    const modelMessages = await convertToModelMessages(messages as UIMessage[]);

    const result = streamText({
      model,
      system,
      messages: modelMessages,
      providerOptions: getProviderOptions(settings.provider, settings.model),
      temperature: settings.provider === "google" ? undefined : 0.4,
      abortSignal: AbortSignal.any([req.signal, AbortSignal.timeout(55_000)]),
      onError: ({ error }) => console.error("[api/admin/ai/chat] stream error", error),
    });

    return result.toUIMessageStreamResponse({
      onError: () => "The AI provider did not respond in time. Please try again or switch models.",
    });
  } catch (error) {
    console.error("[api/admin/ai/chat]", error);
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}