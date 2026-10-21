import { Resend } from "resend";
import type { SendEmailResult, ReservationEmailData, OrderEmailData } from "../types";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailData = ReservationEmailData | OrderEmailData;

export async function sendViaResend(
  data: EmailData,
  html: string,
  subject: string
): Promise<SendEmailResult> {
  try {
    const { data: responseData, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Lumière <onboarding@resend.dev>",
      to: data.to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("[Resend Error]", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: responseData?.id };
  } catch (error) {
    console.error("[Resend Catch Error]", error);
    return { success: false, error: "Failed to send via Resend" };
  }
}