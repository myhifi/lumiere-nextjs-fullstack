import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createAnnouncementSchema(t: TranslateFn) {
  return z.object({
    title: z
      .string()
      .trim()
      .max(80, t("titleTooLong"))
      .optional(),
    message: z
      .string()
      .trim()
      .min(5, t("messageTooShort"))
      .max(500, t("messageTooLong")),
    type: z.enum(["INFO", "WARNING", "SUCCESS", "URGENT"]),
    isActive: z.boolean().default(true),
    expiresAt: z.string().datetime().optional().nullable(),
  });
}

export type CreateAnnouncementInput = z.infer<ReturnType<typeof createAnnouncementSchema>>;