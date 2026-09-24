// ═══════════════════════════════════════════════════
// 🧪 اختبار دالة findBestTable
// ═══════════════════════════════════════════════════
// يشغّل 5 سيناريوهات واقعية ويعرض نتيجة كل واحد

import {
  findBestTable,
  type TableWithReservations,
} from "../src/lib/services/table-assignment";

// ─── أدوات مساعدة للاختبار ───
const baseDate = new Date("2026-10-15T00:00:00.000Z");

function at(hours: number, minutes: number = 0): Date {
  return new Date(baseDate.getTime() + hours * 60 * 60_000 + minutes * 60_000);
}

function makeTable(
  number: number,
  capacity: number,
  reservations: { start: Date; duration: number }[] = []
): TableWithReservations {
  return {
    id: `table-${number}`,
    number,
    capacity,
    location: null,
    isActive: true,
    reservations: reservations.map((r) => ({
      reservationDate: r.start,
      durationMinutes: r.duration,
    })),
  };
}

const line = "═".repeat(62);

console.log("\n🧪 اختبار دالة findBestTable\n" + line);

// ────────────────────────────────────────────────────
// السيناريو 1: تعيين أساسي
// ────────────────────────────────────────────────────
console.log("\n📋 السيناريو 1: 4 أشخاص، كل الطاولات فارغة");
console.log("   المتوقع: أصغر طاولة تستوعب 4 أشخاص (رقم 3)");

{
  const tables = [
    makeTable(1, 2),
    makeTable(3, 4),
    makeTable(4, 4),
    makeTable(6, 6),
    makeTable(9, 8),
  ];
  const result = findBestTable(tables, {
    guestsCount: 4,
    reservationDate: at(20),
  });
  console.log(`   🎯 النتيجة: طاولة رقم ${result?.number} (سعة ${result?.capacity})`);
}

// ────────────────────────────────────────────────────
// السيناريو 2: رفض التعارض
// ────────────────────────────────────────────────────
console.log("\n📋 السيناريو 2: 4 أشخاص، الطاولة 3 محجوزة 7:30–9:00");
console.log("   المتوقع: طاولة أخرى (رقم 4 أو 5)");

{
  const tables = [
    makeTable(3, 4, [{ start: at(19, 30), duration: 90 }]),
    makeTable(4, 4),
    makeTable(5, 4),
  ];
  const result = findBestTable(tables, {
    guestsCount: 4,
    reservationDate: at(20),
  });
  console.log(`   🎯 النتيجة: طاولة رقم ${result?.number}`);
}

// ────────────────────────────────────────────────────
// السيناريو 3: الحجز المتلاصق
// ────────────────────────────────────────────────────
console.log("\n📋 السيناريو 3: 4 أشخاص، الطاولة 3 محجوزة 6:30–8:00");
console.log("   الحجز الجديد يبدأ 8:00 بالضبط (متلاصق)");
console.log("   المتوقع: طاولة رقم 3 مسموحة (لا تعارض)");

{
  const tables = [
    makeTable(3, 4, [{ start: at(18, 30), duration: 90 }]),
    makeTable(4, 4, [{ start: at(19), duration: 90 }]),
  ];
  const result = findBestTable(tables, {
    guestsCount: 4,
    reservationDate: at(20),
  });
  console.log(`   🎯 النتيجة: طاولة رقم ${result?.number}`);
}

// ────────────────────────────────────────────────────
// السيناريو 4: عدد كبير جداً
// ────────────────────────────────────────────────────
console.log("\n📋 السيناريو 4: 15 شخصاً، أكبر طاولة سعة 10");
console.log("   المتوقع: null (لا توجد طاولة مناسبة)");

{
  const tables = [makeTable(9, 8), makeTable(10, 10)];
  const result = findBestTable(tables, {
    guestsCount: 15,
    reservationDate: at(20),
  });
  console.log(
    `   🎯 النتيجة: ${result === null ? "null ✅" : `طاولة ${result.number}`}`
  );
}

// ────────────────────────────────────────────────────
// السيناريو 5: التعادل (الأقل حجزاً)
// ────────────────────────────────────────────────────
console.log("\n📋 السيناريو 5: 4 أشخاص، طاولتان بنفس السعة");
console.log("   الطاولة 4 لها حجز سابق، الطاولة 5 فارغة");
console.log("   المتوقع: طاولة رقم 5 (الأقل حجزاً)");

{
  const tables = [
    makeTable(4, 4, [{ start: at(12), duration: 90 }]),
    makeTable(5, 4),
  ];
  const result = findBestTable(tables, {
    guestsCount: 4,
    reservationDate: at(20),
  });
  console.log(`   🎯 النتيجة: طاولة رقم ${result?.number}`);
}

console.log("\n" + line);
console.log("✨ اكتمل الاختبار\n");