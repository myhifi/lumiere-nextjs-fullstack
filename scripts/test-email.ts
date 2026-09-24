import "dotenv/config";
import { sendReservationConfirmation } from "../src/lib/email/send";

async function main() {
  console.log("\n🧪 اختبار إرسال إيميل\n");

  const result = await sendReservationConfirmation({
    to: "test@example.com",
    guestName: "أحمد محمد",
    reservationId: "cmu2test1234567890abcdef",
    tableNumber: 3,
    reservationDate: new Date("2026-10-15T20:30:00"),
    guestsCount: 4,
  });

  console.log("\n📊 النتيجة:", result);
}

main().catch(console.error);