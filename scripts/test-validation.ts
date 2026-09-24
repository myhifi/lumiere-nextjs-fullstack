// ═══════════════════════════════════════════════════
// 🧪 اختبار مخططات Zod
// ═══════════════════════════════════════════════════

import { reservationSchema } from "../src/lib/validations/reservation";

const line = "═".repeat(62);
console.log("\n🧪 اختبار مخطط التحقق (Zod)\n" + line);

// ─── مساعد للطباعة ───
function test(label: string, data: unknown, expectValid: boolean) {
  const result = reservationSchema.safeParse(data);
  const status = result.success === expectValid ? "✅" : "❌";
  console.log(`\n${status} ${label}`);

  if (result.success) {
    console.log(`   ✓ نجح التحقق`);
  } else {
    console.log(`   ✗ أخطاء التحقق:`);
    result.error.issues.forEach((issue) => {
      console.log(`     • [${issue.path.join(".")}] ${issue.message}`);
    });
  }
}

// ─── مساعد: تاريخ مستقبلي ───
function futureDate(daysAhead = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

// ─── 1. بيانات صحيحة تماماً ───
test(
  "بيانات صحيحة تماماً",
  {
    guestName: "أحمد محمد",
    guestEmail: "Ahmed@Example.com",
    guestPhone: "+20 100 123 4567",
    guestsCount: 4,
    date: futureDate(1),
    time: "20:00",
    notes: "طاولة قريبة من النافذة",
  },
  true
);

// ─── 2. بريد خاطئ ───
test(
  "بريد إلكتروني غير صحيح",
  {
    guestName: "أحمد",
    guestEmail: "not-an-email",
    guestPhone: "+20 100 123 4567",
    guestsCount: 4,
    date: futureDate(1),
    time: "20:00",
  },
  false
);

// ─── 3. اسم قصير جداً ───
test(
  "اسم قصير جداً (حرف واحد)",
  {
    guestName: "أ",
    guestEmail: "a@b.com",
    guestPhone: "+20 100 123 4567",
    guestsCount: 4,
    date: futureDate(1),
    time: "20:00",
  },
  false
);

// ─── 4. عدد أشخاص أكثر من الحد ───
test(
  "عدد أشخاص = 15 (أكثر من الحد)",
  {
    guestName: "أحمد محمد",
    guestEmail: "a@b.com",
    guestPhone: "+20 100 123 4567",
    guestsCount: 15,
    date: futureDate(1),
    time: "20:00",
  },
  false
);

// ─── 5. تاريخ في الماضي ───
test(
  "تاريخ في الماضي",
  {
    guestName: "أحمد محمد",
    guestEmail: "a@b.com",
    guestPhone: "+20 100 123 4567",
    guestsCount: 2,
    date: "2020-01-01",
    time: "20:00",
  },
  false
);

// ─── 6. وقت خارج ساعات العمل ───
test(
  "وقت الحجز 03:00 صباحاً (خارج ساعات العمل)",
  {
    guestName: "أحمد محمد",
    guestEmail: "a@b.com",
    guestPhone: "+20 100 123 4567",
    guestsCount: 2,
    date: futureDate(1),
    time: "03:00",
  },
  false
);

// ─── 7. ملاحظات فارغة (اختياري) ───
test(
  "ملاحظات فارغة (حقل اختياري)",
  {
    guestName: "أحمد محمد",
    guestEmail: "a@b.com",
    guestPhone: "+20 100 123 4567",
    guestsCount: 2,
    date: futureDate(1),
    time: "20:00",
    notes: "",
  },
  true
);

console.log("\n" + line);
console.log("✨ اكتمل الاختبار\n");