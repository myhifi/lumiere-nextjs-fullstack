import { Resend } from "resend";
import type { ReservationEmailData, SendEmailResult } from "../types";

// ═══════════════════════════════════════════════════
// 📮 Resend Provider — production email delivery
// ═══════════════════════════════════════════════════
// Env vars:
//   RESEND_API_KEY  → from resend.com/api-keys
//   EMAIL_FROM      → verified sender (or sandbox)
//   EMAIL_REPLY_TO  → optional reply-to address

const SANDBOX_FROM = "Lumière <onboarding@resend.dev>";

export async function sendViaResend(
  data: ReservationEmailData,
  html: string,
  subject: string
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY is not set in the environment",
    };
  }

  const from = process.env.EMAIL_FROM ?? SANDBOX_FROM;
  const resend = new Resend(apiKey);

  try {
    const { data: result, error } = await resend.emails.send({
      from,
      to: data.to,
      subject,
      html,
      replyTo: process.env.EMAIL_REPLY_TO,
    });

    if (error) {
      console.error("[resend] API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: result?.id };
  } catch (error) {
    console.error("[resend] exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Resend error",
    };
  }
}