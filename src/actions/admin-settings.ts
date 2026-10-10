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