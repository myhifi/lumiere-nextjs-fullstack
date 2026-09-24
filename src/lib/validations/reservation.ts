// ═══════════════════════════════════════════════════
// 📅 مخططات التحقق لنماذج الحجز
// ═══════════════════════════════════════════════════

import { z } from "zod";
import { DEFAULT_DURATION_MINUTES } from "@/lib/services/table-assignment";

// ─── مخطط نموذج الحجز ───
export const reservationSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(2, "الاسم قصير جداً (حرفان على الأقل)")
    .max(80, "الاسم طويل جداً (80 حرفاً كحد أقصى)"),

  guestEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("البريد الإلكتروني غير صحيح"),

  guestPhone: z
    .string()
    .trim()
    .min(8, "رقم الهاتف قصير جداً")
    .max(20, "رقم الهاتف طويل جداً")
    .regex(/^[+\d\s\-()]+$/, "رقم الهاتف يحتوي على رموز غير مسموحة"),

  guestsCount: z.coerce
    .number()
    .int("عدد الأشخاص يجب أن يكون رقماً صحيحاً")
    .min(1, "على الأقل شخص واحد")
    .max(10, "لا يمكن الحجز لأكثر من 10 أشخاص"),

  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "التاريخ غير صحيح"),

  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "الوقت غير صحيح"),

  notes: z
    .string()
    .trim()
    .max(500, "الملاحظات طويلة جداً (500 حرف كحد أقصى)")
    .optional()
    .or(z.literal("")),
})
.refine(
  (data) => {
    const dt = new Date(`${data.date}T${data.time}:00`);
    return dt.getTime() > Date.now();
  },
  {
    message: "لا يمكن الحجز في وقت ماضٍ",
    path: ["date"],
  }
)
.refine(
  (data) => {
    const dt = new Date(`${data.date}T${data.time}:00`);
    const hours = dt.getHours();
    return hours >= 12 && hours <= 22;
  },
  {
    message: "الحجز متاح فقط بين 12:00 ظهراً و 10:00 مساءً",
    path: ["time"],
  }
);

// ─── النوع المُستنتج من المخطط ───
export type ReservationInput = z.infer<typeof reservationSchema>;

// ─── النوع المُحوَّل للاستخدام في طبقة الخدمة ───
export type ReservationRequest = ReservationInput & {
  durationMinutes: number;
};

// ─── دالة تحويل من بيانات النموذج إلى طلب الخدمة ───
export function toReservationRequest(
  input: ReservationInput
): ReservationRequest {
  return {
    ...input,
    durationMinutes: DEFAULT_DURATION_MINUTES,
  };
}

// ─── مساعد: تحويل تاريخ + وقت إلى كائن Date ───
export function parseReservationDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}