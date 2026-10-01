import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createCategorySchema(t: TranslateFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("categoryNameTooShort"))
      .max(50, t("categoryNameTooLong")),

    nameEn: z
      .string()
      .trim()
      .max(50, t("categoryNameTooLong"))
      .optional()
      .or(z.literal("")),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, t("slugTooShort"))
      .max(50, t("slugTooLong"))
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t("slugInvalidFormat")),

    description: z
      .string()
      .trim()
      .max(200, t("descriptionTooLong"))
      .optional()
      .or(z.literal("")),

    displayOrder: z.coerce
      .number()
      .int(t("displayOrderNotInt"))
      .min(0, t("displayOrderNegative"))
      .max(999, t("displayOrderTooLarge")),
  });
}

export type CategoryInput = z.infer<ReturnType<typeof createCategorySchema>>;