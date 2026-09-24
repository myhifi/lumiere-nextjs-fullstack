"use server";

import { prisma } from "@/lib/prisma";
import {
  reservationSchema,
  parseReservationDate,
} from "@/lib/validations/reservation";
import {
  findBestTable,
  DEFAULT_DURATION_MINUTES,
} from "@/lib/services/table-assignment";
import { sendReservationConfirmation } from "@/lib/email/send";

// ═══════════════════════════════════════════════════
// 📅 Server Action: إنشاء حجز جديد
// ═══════════════════════════════════════════════════

export type CreateReservationResult =
  | {
      success: true;
      reservationId: string;
      tableNumber: number;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function createReservation(
  input: unknown
): Promise<CreateReservationResult> {
  // ─── 1. التحقق من صحة البيانات (Zod) ───
  const parsed = reservationSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: "تحقق من البيانات المُدخلة",
      fieldErrors,
    };
  }

  const data = parsed.data;
  const reservationDate = parseReservationDate(data.date, data.time);
  const duration = DEFAULT_DURATION_MINUTES;

  try {
    // ─── 2. جلب الطاولات المرشّحة (مع حجوزاتها في نافذة زمنية قريبة) ───
    // نضيّق نطاق البحث لتحسين الأداء: ±3 ساعات حول وقت الحجز
    const bufferMs = 3 * 60 * 60 * 1000;
    const windowStart = new Date(reservationDate.getTime() - bufferMs);
    const windowEnd = new Date(
      reservationDate.getTime() + duration * 60_000 + bufferMs
    );

    const tables = await prisma.table.findMany({
      where: {
        isActive: true,
        capacity: {
          gte: data.guestsCount,
          lte: data.guestsCount + 3,
        },
      },
      include: {
        reservations: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            reservationDate: {
              gte: windowStart,
              lte: windowEnd,
            },
          },
          select: {
            reservationDate: true,
            durationMinutes: true,
          },
        },
      },
    });

    // ─── 3. اتخاذ القرار (الدالة النقية) ───
    const bestTable = findBestTable(tables, {
      guestsCount: data.guestsCount,
      reservationDate,
      durationMinutes: duration,
    });

    if (!bestTable) {
      return {
        success: false,
        error:
          "لا توجد طاولة متاحة في هذا الوقت. جرّب وقتاً آخر أو تواصل معنا هاتفياً.",
      };
    }

    // ─── 4. حفظ الحجز (الأولوية القصوى) ───
    const reservation = await prisma.reservation.create({
      data: {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        guestsCount: data.guestsCount,
        reservationDate,
        durationMinutes: duration,
        status: "PENDING",
        notes: data.notes && data.notes !== "" ? data.notes : null,
        tableId: bestTable.id,
      },
    });

    // ─── 5. إرسال إيميل التأكيد (لا يُلغي الحجز إن فشل) ───
    // ملاحظة: نستخدم try/catch داخلي منفصل، لأن فشل الإيميل
    // لا يجب أن يُلغي حجزاً تم في قاعدة البيانات بنجاح.
    // نريد فصل فشل الإيميل عن فشل الحجز
    try {
      const emailResult = await sendReservationConfirmation({
        to: data.guestEmail,
        guestName: data.guestName,
        reservationId: reservation.id,
        tableNumber: bestTable.number,
        reservationDate,
        guestsCount: data.guestsCount,
      });

      if (!emailResult.success) {
        console.error(
          `[createReservation] Email failed for ${reservation.id}:`,
          emailResult.error
        );
      }
    } catch (emailError) {
      // نبتلع الخطأ عمداً — الحجز نجح، والمشكلة في الإيميل فقط
      console.error("[createReservation] Email exception:", emailError);
    }

    return {
      success: true,
      reservationId: reservation.id,
      tableNumber: bestTable.number,
    };

  } catch (error) {
    console.error("[createReservation] error:", error);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء الحجز. يرجى المحاولة لاحقاً.",
    };
  }
}