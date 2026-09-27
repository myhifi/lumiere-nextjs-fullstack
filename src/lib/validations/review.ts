import { z } from "zod";

// ═══════════════════════════════════════════════════
// ⭐ مخطط التحقق من التقييمات (Zod)
// ═══════════════════════════════════════════════════

// ─── مخطط إنشاء تقييم جديد (من العميل) ───
export const createReviewSchema = z.object({
  guestName: z
    .string()
    .trim()
    .min(2, "الاسم قصير جداً (حرفان على الأقل)")
    .max(60, "الاسم طويل جداً (60 حرفاً كحد أقصى)"),

  guestEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("البريد الإلكتروني غير صحيح")
    .optional()
    .or(z.literal("")),

  rating: z.coerce
    .number()
    .int("التقييم يجب أن يكون رقماً صحيحاً")
    .min(1, "التقييم على الأقل نجمة واحدة")
    .max(5, "التقييم بحد أقصى 5 نجوم"),

  comment: z
    .string()
    .trim()
    .min(10, "التعليق قصير جداً (10 أحرف على الأقل)")
    .max(500, "التعليق طويل جداً (500 حرف كحد أقصى)"),
});

// ─── مخطط تحديث حالة التقييم (من المدير) ───
export const updateReviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    message: "الحالة يجب أن تكون PENDING أو APPROVED أو REJECTED",
  }),
});

// ─── الأنواع المُستنتَجة ───
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;