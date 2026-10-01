import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createTableSchema(t: TranslateFn) {
  return z.object({
    number: z.coerce
      .number()
      .int(t("tableNumberNotInt"))
      .min(1, t("tableNumberMin"))
      .max(999, t("tableNumberMax")),

    capacity: z.coerce
      .number()
      .int(t("capacityNotInt"))
      .min(1, t("capacityMin"))
      .max(50, t("capacityMax")),

    location: z
      .string()
      .trim()
      .max(50, t("locationTooLong"))
      .optional()
      .or(z.literal("")),

    isActive: z.boolean().default(true),
  });
}

export type TableInput = z.infer<ReturnType<typeof createTableSchema>>;