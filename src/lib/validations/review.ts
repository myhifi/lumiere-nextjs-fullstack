// ═══════════════════════════════════════════════════
// ⭐ Review validation schema (i18n-ready)
// ═══════════════════════════════════════════════════

import { z } from "zod";

type TranslateFn = (key: string) => string;

// ─── Factory: create schema with translated messages ───
export function createReviewSchema(t: TranslateFn) {
  return z.object({
    guestName: z
      .string()
      .trim()
      .min(2, t("reviewerNameTooShort"))
      .max(60, t("reviewerNameTooLong")),

    guestEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email(t("reviewerEmailInvalid"))
      .optional()
      .or(z.literal("")),

    rating: z.coerce
      .number()
      .int(t("ratingInvalid"))
      .min(1, t("ratingTooLow"))
      .max(5, t("ratingTooHigh")),

    comment: z
      .string()
      .trim()
      .min(10, t("commentTooShort"))
      .max(500, t("commentTooLong")),
  });
}

// ─── Update status schema (admin only, no translation needed) ───
export const updateReviewStatusSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"], {
    message: "Status must be PENDING, APPROVED, or REJECTED",
  }),
});

// ─── Inferred types ───
export type CreateReviewInput = z.infer<ReturnType<typeof createReviewSchema>>;
export type UpdateReviewStatusInput = z.infer<typeof updateReviewStatusSchema>;