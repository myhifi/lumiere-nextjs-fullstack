import type { SendEmailResult, ReservationEmailData, OrderEmailData } from "../types";

type EmailData = ReservationEmailData | OrderEmailData;

export async function sendViaConsole(
  data: EmailData,
  html: string,
  subject: string
): Promise<SendEmailResult> {
  // Safely check which type of email we are logging
  const identifier = "reservationId" in data ? data.reservationId : data.orderId;
  
  console.log(`\n========================================`);
  console.log(`📧 [Console Provider] Email Sent`);
  console.log(`To: ${data.to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Reference ID: ${identifier}`);
  console.log(`========================================\n`);
  
  return { success: true, messageId: "console-" + Date.now() };
}