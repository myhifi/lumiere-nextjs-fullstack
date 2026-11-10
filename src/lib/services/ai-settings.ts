// ═══════════════════════════════════════════════════
// ⚙️ AI settings service (BYOK)
// ═══════════════════════════════════════════════════
// Reads and writes the admin's AI configuration using
// the existing key/value Setting model. No new table.

import "server-only";

import { prisma } from "@/lib/prisma";
import { decrypt, encrypt } from "@/lib/crypto";

export const AI_PROVIDERS = ["google", "openai", "deepseek"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const DEFAULT_MODELS: Record<AiProvider, string> = {
  google: "gemini-3.8-flash",
  openai: "gpt-4o-mini",
  deepseek: "deepseek-chat",
};

export const AVAILABLE_MODELS: Record<AiProvider, { id: string; label: string }[]> = {
  google: [
    { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash" },
    { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
    { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite (Fastest)" },
    { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
  ],
  openai: [
    { id: "gpt-4o-mini", label: "GPT-4o Mini (Fast & Cheap)" },
    { id: "gpt-4o", label: "GPT-4o (Smartest)" },
  ],
  deepseek: [
    { id: "deepseek-chat", label: "DeepSeek Chat" },
    { id: "deepseek-coder", label: "DeepSeek Coder" },
  ],
};

const SETTING_KEYS = {
  provider: "AI_PROVIDER",
  model: "AI_MODEL",
  apiKey: "AI_API_KEY_ENCRYPTED",
  enabled: "AI_ENABLED",
} as const;

const DEFAULT_PROVIDER: AiProvider = "google";

export type AiSettings = {
  provider: AiProvider;
  model: string;
  enabled: boolean;
  hasApiKey: boolean;
  availableModels: typeof AVAILABLE_MODELS;
};

function isAiProvider(value: string | undefined): value is AiProvider {
  return value !== undefined && AI_PROVIDERS.includes(value as AiProvider);
}

/**
 * Returns the current AI configuration without decrypting the key.
 * Safe to pass to Server Components and admin UI.
 */
export async function getAiSettings(): Promise<AiSettings> {
  const rows = await prisma.setting.findMany({
    where: { key: { in: Object.values(SETTING_KEYS) } },
  });

  const map = new Map(rows.map((row) => [row.key, row.value]));

  const providerValue = map.get(SETTING_KEYS.provider);
  const provider = isAiProvider(providerValue)
    ? providerValue
    : DEFAULT_PROVIDER;
  const savedModel = map.get(SETTING_KEYS.model);
  const model =
    savedModel &&
    AVAILABLE_MODELS[provider].some((availableModel) => availableModel.id === savedModel)
      ? savedModel
      : DEFAULT_MODELS[provider];

  return {
    provider,
    model,
    enabled: map.get(SETTING_KEYS.enabled) === "true",
    hasApiKey: Boolean(map.get(SETTING_KEYS.apiKey)),
    availableModels: AVAILABLE_MODELS,
  };
}

/**
 * Decrypts the stored API key for server-side use only.
 *
 * Returns `null` if no key is stored or if decryption fails.
 * Never call this from a Client Component or expose the
 * returned value to the browser.
 */
export async function getDecryptedAiApiKey(): Promise<string | null> {
  const row = await prisma.setting.findUnique({
    where: { key: SETTING_KEYS.apiKey },
  });

  if (!row?.value) return null;

  try {
    return decrypt(row.value);
  } catch (error) {
    console.error("[getDecryptedAiApiKey] Failed to decrypt key", error);
    return null;
  }
}

/**
 * Persists the AI configuration.
 *
 * If `apiKey` is provided, it is encrypted and stored.
 * If `apiKey` is `null`, the existing stored key is left untouched.
 */
export async function saveAiSettings(input: {
  provider: AiProvider;
  model: string;
  enabled: boolean;
  apiKey?: string | null;
}): Promise<void> {
  const { provider, model, enabled, apiKey } = input;

  const operations = [
    prisma.setting.upsert({
      where: { key: SETTING_KEYS.provider },
      create: { key: SETTING_KEYS.provider, value: provider },
      update: { value: provider },
    }),
    prisma.setting.upsert({
      where: { key: SETTING_KEYS.model },
      create: { key: SETTING_KEYS.model, value: model },
      update: { value: model },
    }),
    prisma.setting.upsert({
      where: { key: SETTING_KEYS.enabled },
      create: { key: SETTING_KEYS.enabled, value: enabled ? "true" : "false" },
      update: { value: enabled ? "true" : "false" },
    }),
  ];

  if (apiKey) {
    const encrypted = encrypt(apiKey);

    operations.push(
      prisma.setting.upsert({
        where: { key: SETTING_KEYS.apiKey },
        create: { key: SETTING_KEYS.apiKey, value: encrypted },
        update: { value: encrypted },
      })
    );
  }

  await prisma.$transaction(operations);
}

/**
 * Permanently removes the stored API key.
 * Used by an explicit "Remove key" action.
 */
export async function clearAiApiKey(): Promise<void> {
  await prisma.setting.deleteMany({
    where: { key: SETTING_KEYS.apiKey },
  });
}