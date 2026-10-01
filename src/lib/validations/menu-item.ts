import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createMenuItemSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("itemNameTooShort"))
      .max(80, t("itemNameTooLong")),

    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, t("slugTooShort"))
      .max(80, t("slugTooLong"))
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t("slugInvalidFormat")),

    description: z
      .string()
      .trim()
      .max(500, t("itemDescriptionTooLong"))
      .optional()
      .or(z.literal("")),

    price: z.coerce
      .number()
      .positive(t("priceMustBePositive"))
      .max(10000, t("priceTooLarge")),

    imageUrl: z
      .string()
      .trim()
      .url(t("imageUrlInvalid"))
      .optional()
      .or(z.literal("")),

    categoryId: z.string().min(1, t("categoryRequired")),

    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
  });
}

export type MenuItemInput = z.infer<ReturnType<typeof createMenuItemSchema>>;