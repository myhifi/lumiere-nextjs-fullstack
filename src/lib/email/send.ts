import { createTranslator } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import { render } from "@react-email/components";
import {
  ReservationConfirmation,
  type EmailTranslator,
} from "./templates/ReservationConfirmation";
import { sendViaConsole } from "./providers/console";
import { sendViaResend } from "./providers/resend";
import { getWhatsAppNumber } from "@/lib/services/settings";
import type {
  EmailProviderName,
  ReservationEmailData,
  SendEmailResult,
} from "./types";
import { OrderConfirmation } from "./templates/OrderConfirmation";
import type { OrderEmailData } from "./types";

// ═══════════════════════════════════════════════════
// 📧 Unified email sender
// ═══════════════════════════════════════════════════
// Provider is selected via EMAIL_PROVIDER env var.
//   • console → prints to terminal (default in dev)
//   • resend  → real delivery (added later)
//
// Uses `createTranslator` (not `getTranslations`) so this
// function works in ANY Node context:
//   - Server Actions
//   - Standalone scripts (tsx)
//   - Cron jobs, webhooks, background workers

function getProvider(): EmailProviderName {
  const provider = process.env.EMAIL_PROVIDER as EmailProviderName | undefined;
  return provider ?? "console";
}

async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const mod = await import(`../../../messages/${locale}.json`);
  return mod.default as AbstractIntlMessages;
}

export async function sendReservationConfirmation(
  data: ReservationEmailData,
  locale: string = "en"
): Promise<SendEmailResult> {
  try {
    // ─── 1. Load messages for the given locale ───
    const messages = await loadMessages(locale);

    // ─── 2. Build a translator scoped to the email namespace ───
    const t = createTranslator({
      locale,
      messages,
      namespace: "Email.ReservationConfirmation",
    }) as unknown as EmailTranslator;

    // ─── 3. Render HTML from the React Email template ───
    const whatsappNumber = await getWhatsAppNumber();

    const html = await render(
      ReservationConfirmation({
        guestName: data.guestName,
        reservationId: data.reservationId,
        tableNumber: data.tableNumber,
        reservationDate: data.reservationDate,
        guestsCount: data.guestsCount,
        locale,
        t,
        whatsappNumber,
      })
    );

    // ─── 4. Dispatch via the configured provider ───
    const provider = getProvider();

    const subject = t("preview", { tableNumber: data.tableNumber });

    switch (provider) {
      case "console":
        return await sendViaConsole(data, html, subject);

      case "resend":
        return await sendViaResend(data, html, subject);

      default:
        return {
          success: false,
          error: `Unknown email provider: ${provider}`,
        };
    }
  } catch (error) {
    console.error("[sendReservationConfirmation] error:", error);
    return {
      success: false,
      error: "Failed to prepare email",
    };
  }
}

export async function sendOrderConfirmation(
  data: OrderEmailData
): Promise<SendEmailResult> {
  try {
    const locale = data.locale || "en";
    const messages = await loadMessages(locale);
    const t = createTranslator({
      locale,
      messages,
      namespace: "Email.OrderConfirmation",
    }) as unknown as EmailTranslator;

    const whatsappNumber = await getWhatsAppNumber();
    
    // Use NEXT_PUBLIC_APP_URL or fallback to production URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lumiere-nextjs-fullstack.vercel.app";

    const html = await render(
      OrderConfirmation({
        ...data,
        t,
        whatsappNumber,
        appUrl,
      })
    );

    const provider = getProvider();
    const subject = t("subject");

    switch (provider) {
      case "console":
        return await sendViaConsole(data, html, subject);

      case "resend":
        return await sendViaResend(data, html, subject);

      default:
        return { success: false, error: `Unknown email provider: ${provider}` };
    }
  } catch (error) {
    console.error("[sendOrderConfirmation] error:", error);
    return { success: false, error: "Failed to prepare email" };
  }
}