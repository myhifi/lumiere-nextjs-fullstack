import "dotenv/config";
import { sendReservationConfirmation } from "../src/lib/email/send";

const LOCALES = ["ar", "en", "fr", "de", "es"] as const;

async function main() {
  console.log("\n🧪 Testing email across all 5 locales\n");

  for (const locale of LOCALES) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`🌐 Locale: ${locale}`);
    console.log("=".repeat(60));

    const result = await sendReservationConfirmation(
      {
        to: "test@example.com",
        guestName: "Sami Adam",
        reservationId: "cmu2test1234567890abcdef",
        tableNumber: 3,
        reservationDate: new Date("2026-10-15T20:30:00"),
        guestsCount: 4,
      },
      locale
    );

    console.log(`📊 Result [${locale}]:`, result);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("✨ All 5 locales tested\n");
}

main().catch(console.error);