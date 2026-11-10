// ═══════════════════════════════════════════════════
// 🤖 AI provider factory (Google / OpenAI / DeepSeek)
// ═══════════════════════════════════════════════════
// Keeps all provider-specific imports in one place.
// Adding a new provider later only requires a new case.

import "server-only";

import { generateText, type LanguageModel } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { AVAILABLE_MODELS, DEFAULT_MODELS, type AiProvider } from "@/lib/services/ai-settings";

const GOOGLE_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

function resolveModelId(provider: AiProvider, model?: string): string {
  return model?.trim() || DEFAULT_MODELS[provider];
}

/**
 * Creates a language model for the selected provider.
 * Falls back to the provider's default model when `model`
 * is empty or omitted.
 */
export function createLanguageModel(
  provider: AiProvider,
  apiKey: string,
  model?: string
): LanguageModel {
  const modelId = resolveModelId(provider, model);

  switch (provider) {
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(modelId);
    }

    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(modelId);
    }

    case "deepseek": {
      const deepseek = createDeepSeek({ apiKey });
      return deepseek(modelId);
    }

    default: {
      const exhaustive: never = provider;
      throw new Error(
        `[ai/provider] Unsupported provider: ${exhaustive as string}`
      );
    }
  }
}

export function getProviderOptions(provider: AiProvider, model?: string) {
  const modelId = resolveModelId(provider, model);
  if (provider === "google" && modelId.startsWith("gemini-3")) {
    return { google: { thinkingConfig: { thinkingLevel: "low" } } };
  }
  return undefined;
}

type GoogleProbe = "ok" | "model-not-found" | "auth-failed" | "unknown";

async function probeGoogleModel(apiKey: string, modelId: string): Promise<GoogleProbe> {
  const id = modelId.replace(/^models\//, "");

  try {
    const res = await fetch(`${GOOGLE_API_BASE}/models/${encodeURIComponent(id)}`, {
      headers: { "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });

    if (res.ok) {
      const info = (await res.json()) as { supportedGenerationMethods?: string[] };
      const methods = info.supportedGenerationMethods;
      return !methods || methods.includes("generateContent") ? "ok" : "model-not-found";
    }

    if (res.status === 404) return "model-not-found";
    if (res.status === 400 || res.status === 401 || res.status === 403) return "auth-failed";
    return "unknown";
  } catch {
    return "unknown";
  }
}

async function generationTest(
  provider: AiProvider,
  apiKey: string,
  modelId: string
): Promise<boolean> {
  try {
    await generateText({
      model: createLanguageModel(provider, apiKey, modelId),
      prompt: "Reply with the single word: OK",
      temperature: provider === "google" ? undefined : 0,
      providerOptions: getProviderOptions(provider, modelId),
      abortSignal: AbortSignal.timeout(20000),
    });
    return true;
  } catch (error) {
    console.warn(`[testAiConnection] Generation failed for ${provider}/${modelId}:`, (error as Error).message);
    return false;
  }
}

/**
 * Lightweight key validation used by the "Test & Save" flow.
 *
 * Tries a list of known-good models for the provider. This ensures
 * the connection test succeeds even if a specific model ID is
 * temporarily deprecated or unavailable.
 */
export async function testAiConnection(
  provider: AiProvider,
  apiKey: string,
  model?: string
): Promise<boolean> {
  const chosen = model?.trim();
  const candidates = chosen
    ? [chosen]
    : [DEFAULT_MODELS[provider], ...(provider === "google" ? AVAILABLE_MODELS.google.map((availableModel) => availableModel.id) : [])];

  for (const modelId of [...new Set(candidates)]) {
    if (provider === "google") {
      const probe = await probeGoogleModel(apiKey, modelId);
      if (probe === "ok") return true;
      if (probe === "auth-failed") return false;
      if (probe === "model-not-found") continue;
      if (await generationTest(provider, apiKey, modelId)) return true;
      continue;
    }
    if (await generationTest(provider, apiKey, modelId)) return true;
  }
  return false;
}