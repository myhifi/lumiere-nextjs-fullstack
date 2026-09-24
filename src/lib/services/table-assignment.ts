// ═══════════════════════════════════════════════════
// 🎯 Table Assignment — منطق تخصيص الطاولة الذكي
// ═══════════════════════════════════════════════════
// دالة نقية (Pure Function):
//   • لا تتصل بـ Prisma
//   • لا تعرف شيئاً عن HTTP أو React
//   • تُستقبل البيانات، وتُعيد أفضل طاولة أو null

// ─── الثوابت ───
export const DEFAULT_DURATION_MINUTES = 90;
export const CAPACITY_BUFFER = 3;

// ─── الأنواع ───
export type TableWithReservations = {
  id: string;
  number: number;
  capacity: number;
  location: string | null;
  isActive: boolean;
  reservations: {
    reservationDate: Date;
    durationMinutes: number;
  }[];
};

export type AssignmentRequest = {
  guestsCount: number;
  reservationDate: Date;
  durationMinutes?: number;
};

// ─── الدالة الرئيسية ───
/**
 * يبحث عن أفضل طاولة متاحة لحجز جديد بناءً على:
 *   1. السعة (لا تقل عن عدد الأشخاص، ولا تزيد بأكثر من CAPACITY_BUFFER)
 *   2. عدم التعارض الزمني مع أي حجز قائم
 *   3. الأولوية: الأصغر سعةً، ثم الأقل حجوزات
 *   4. الطاولة يجب أن تكون نشطة (isActive)
 *
 * @returns الطاولة المثلى، أو null إن لم توجد طاولة مناسبة
 */
export function findBestTable(
  tables: TableWithReservations[],
  request: AssignmentRequest
): TableWithReservations | null {
  const duration = request.durationMinutes ?? DEFAULT_DURATION_MINUTES;

  // حوّل الأوقات إلى أرقام (milliseconds) للحساب السريع
  const newStart = request.reservationDate.getTime();
  const newEnd = newStart + duration * 60_000;

  const candidates = tables
    // القاعدة 4: الطاولة نشطة
    .filter((table) => table.isActive)
    // القاعدة 1: السعة مناسبة
    .filter(
      (table) =>
        table.capacity >= request.guestsCount &&
        table.capacity <= request.guestsCount + CAPACITY_BUFFER
    )
    // القاعدة 2: لا يوجد تعارض زمني
    .filter((table) => !hasOverlappingReservation(table, newStart, newEnd));

  if (candidates.length === 0) return null;

  // القاعدة 3: الترتيب
  //   أولاً: الأصغر سعةً (استغلال أمثل للطاولات)
  //   ثانياً: الأقل حجوزات (توزيع عادل)
  candidates.sort((a, b) => {
    if (a.capacity !== b.capacity) return a.capacity - b.capacity;
    return a.reservations.length - b.reservations.length;
  });

  return candidates[0];
}

// ─── دالة مساعدة (Private) ───
/**
 * هل توجد حجوزات متعارضة زمنياً مع النافذة الجديدة؟
 *
 * منطق التعارض:
 *   يوجد تعارض لو (بداية القديم < نهاية الجديد) AND (نهاية القديم > بداية الجديد)
 */
function hasOverlappingReservation(
  table: TableWithReservations,
  newStart: number,
  newEnd: number
): boolean {
  return table.reservations.some((reservation) => {
    const existingStart = reservation.reservationDate.getTime();
    const existingEnd = existingStart + reservation.durationMinutes * 60_000;
    return existingStart < newEnd && existingEnd > newStart;
  });
}