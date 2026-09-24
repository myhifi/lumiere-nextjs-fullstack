import type {
  ReservationEmailData,
  SendEmailResult,
} from "../types";

// ═══════════════════════════════════════════════════
// 🖥️ Console Provider — للتحقق أثناء التطوير
// ═══════════════════════════════════════════════════
// يطبع الإيميل في الطرفية بدل إرساله فعلياً
// (يعادل EMAIL_BACKEND = console في Django)

export async function sendViaConsole(
  data: ReservationEmailData,
  html: string
): Promise<SendEmailResult> {
  const line = "═".repeat(60);

  console.log("\n" + line);
  console.log("📧 [DEV] إيميل جاهز للإرسال (لم يُرسل فعلياً)");
  console.log(line);
  console.log(`   إلى:      ${data.to}`);
  console.log(`   الموضوع:  تأكيد حجزك في Lumière — طاولة رقم ${data.tableNumber}`);
  console.log(`   المعرّف:  ${data.reservationId}`);
  console.log(line);
  console.log("📄 محتوى HTML (مقتطف):");
  // نطبع أول 400 حرف فقط، لتجنب إغراق الطرفية
  console.log(html.slice(0, 400) + "...");
  console.log(line);
  console.log("💡 لرؤية الإيميل كاملاً: افتح Terminal → وسّع النافذة");
  console.log("💡 للتبديل إلى Resend: أضف EMAIL_PROVIDER=resend في .env\n");

  return {
    success: true,
    messageId: `console-${Date.now()}`,
  };
}