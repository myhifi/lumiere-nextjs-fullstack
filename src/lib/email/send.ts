import { render } from "@react-email/components";
import { ReservationConfirmation } from "./templates/ReservationConfirmation";
import { sendViaConsole } from "./providers/console";
import type {
  EmailProviderName,
  ReservationEmailData,
  SendEmailResult,
} from "./types";

// ═══════════════════════════════════════════════════
// 📧 الواجهة الموحّدة لإرسال الإيميل
// ═══════════════════════════════════════════════════
// تختار المزوّد بناءً على EMAIL_PROVIDER من .env
//   • console → يطبع في الطرفية (افتراضي للتطوير)
//   • resend  → يرسل فعلياً عبر Resend (يُضاف لاحقاً)

function getProvider(): EmailProviderName {
  const provider = process.env.EMAIL_PROVIDER as EmailProviderName | undefined;
  return provider ?? "console";
}

export async function sendReservationConfirmation(
  data: ReservationEmailData
): Promise<SendEmailResult> {
  try {
    // ─── 1. توليد HTML من قالب React ───
    const html = await render(
      ReservationConfirmation({
        guestName: data.guestName,
        reservationId: data.reservationId,
        tableNumber: data.tableNumber,
        reservationDate: data.reservationDate,
        guestsCount: data.guestsCount,
      })
    );

    // ─── 2. اختيار المزوّد ───
    const provider = getProvider();

    switch (provider) {
      case "console":
        return await sendViaConsole(data, html);

      case "resend":
        // سيُضاف في الخطوة 6 عند التسجيل
        console.warn(
          "[email] Resend provider not implemented yet, falling back to console"
        );
        return await sendViaConsole(data, html);

      default:
        return {
          success: false,
          error: `مزوّد إيميل غير معروف: ${provider}`,
        };
    }
  } catch (error) {
    console.error("[sendReservationConfirmation] error:", error);
    return {
      success: false,
      error: "فشل تجهيز الإيميل",
    };
  }
}