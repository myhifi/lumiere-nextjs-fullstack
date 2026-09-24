import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم التصنيف قصير جداً")
    .max(50, "اسم التصنيف طويل جداً"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "المعرّف قصير جداً")
    .max(50, "المعرّف طويل جداً")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "المعرّف بالحروف الإنجليزية الصغيرة والأرقام والشرطات فقط"
    ),

  description: z
    .string()
    .trim()
    .max(200, "الوصف طويل جداً")
    .optional()
    .or(z.literal("")),

  displayOrder: z.coerce
    .number()
    .int("الترتيب يجب أن يكون رقماً صحيحاً")
    .min(0, "الترتيب لا يمكن أن يكون سالباً")
    .max(999, "الترتيب كبير جداً"),
});

export type CategoryInput = z.infer<typeof categorySchema>;