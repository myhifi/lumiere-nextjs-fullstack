"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { createWhatsAppNumberSchema } from "@/lib/validations/setting";
import {
  getWhatsAppNumber,
  setWhatsAppNumber,
} from "@/lib/services/settings";
import { logAction } from "@/lib/services/audit";
import { tError } from "@/lib/utils/server-errors";
import {
  getAiSettings,
  getDecryptedAiApiKey,
  saveAiSettings,
} from "@/lib/services/ai-settings";
import { createAiSettingsSchema } from "@/lib/validations/ai-settings";
import { testAiConnection } from "@/lib/ai/provider";

// ═══════════════════════════════════════════════════
// ⚙️ Server Actions: Site settings
// ═══════════════════════════════════════════════════

type ActionResult =
  | { success: true; value: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

// ADMIN only — settings affect the whole site
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") return null;
  return session.user;
}

function getUserName(user: { name?: string | null }): string {
  return user.name ?? "Unknown";
}

// ─── Update WhatsApp number ───
export async function updateWhatsAppNumber(
  input: unknown
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: await tError("adminRequired") };

  // Validate with the current locale's messages
  const tValidation = await getTranslations("Errors.validation");
  const schema = createWhatsAppNumberSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: await tError("invalidData"),
      fieldErrors,
    };
  }

  // Normalize to wa.me format: digits only, no +, no spaces
  const normalized = parsed.data.whatsappNumber
    .replace(/[\s\-()]/g, "")
    .replace(/^\+/, "");

  try {
    const previous = await getWhatsAppNumber();
    await setWhatsAppNumber(normalized);

    // Audit log — number change is site-wide and user-visible
    await logAction({
      userId: admin.id,
      userName: getUserName(admin),
      action: "UPDATE",
      entity: "Setting",
      entityId: "whatsappNumber",
      entityName: "WhatsApp Number",
      severity: "warning",
      changes: {
        before: { whatsappNumber: previous },
        after: { whatsappNumber: normalized },
      },
    });

    // Invalidate the settings page and any page using the button
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout"); // refresh the WhatsApp button everywhere

    return { success: true, value: normalized };
  } catch (error) {
    console.error("[updateWhatsAppNumber]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ═══════════════════════════════════════════════════
// 🤖 AI settings (BYOK)
// ═══════════════════════════════════════════════════

/**
 * Saves the admin's AI configuration.
 *
 * When an API key is provided, it is validated against the
 * selected provider before being encrypted and persisted.
 * When the key is left empty, the existing stored key is
 * reused and left untouched.
 */
export async function updateAiSettings(
  input: unknown
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: await tError("adminRequired") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createAiSettingsSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: await tError("invalidData"),
      fieldErrors,
    };
  }

  const { provider, model, enabled } = parsed.data;
  const newApiKey = parsed.data.apiKey?.trim() || null;

  try {
    const previous = await getAiSettings();

    // The key used for validation: new key if provided, otherwise stored key.
    const keyToTest = newApiKey ?? (await getDecryptedAiApiKey());

    if (enabled && !keyToTest) {
      return { success: false, error: await tError("aiKeyRequired") };
    }

    if (keyToTest) {
      const isValid = await testAiConnection(provider, keyToTest, model);

      if (!isValid) {
        return { success: false, error: await tError("aiKeyInvalid") };
      }
    }

    await saveAiSettings({
      provider,
      model,
      enabled,
      apiKey: newApiKey,
    });

    await logAction({
      userId: admin.id,
      userName: getUserName(admin),
      action: "UPDATE",
      entity: "Setting",
      entityId: "aiSettings",
      entityName: "AI Settings",
      severity: "warning",
      changes: {
        before: {
          provider: previous.provider,
          model: previous.model,
          enabled: previous.enabled,
          hasApiKey: previous.hasApiKey,
        },
        after: {
          provider,
          model,
          enabled,
          hasApiKey: Boolean(keyToTest),
        },
      },
    });

    revalidatePath("/admin/settings");
    return { success: true, value: "ok" };
  } catch (error) {
    console.error("[updateAiSettings]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

/**
 * Tests the current AI configuration without saving.
 *
 * If a new key is supplied, it is tested directly.
 * Otherwise the stored key is decrypted and tested.
 */
export async function testAiSettingsConnection(
  input: unknown
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: await tError("adminRequired") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createAiSettingsSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: await tError("invalidData"),
      fieldErrors,
    };
  }

  const { provider, model } = parsed.data;
  const apiKey =
    parsed.data.apiKey?.trim() || (await getDecryptedAiApiKey());

  if (!apiKey) {
    return { success: false, error: await tError("aiKeyRequired") };
  }

  try {
    const isValid = await testAiConnection(provider, apiKey, model);
    return isValid
      ? { success: true, value: "ok" }
      : { success: false, error: await tError("aiKeyInvalid") };
  } catch (error) {
    console.error("[testAiSettingsConnection]", error);
    return { success: false, error: await tError("unexpected") };
  }
}