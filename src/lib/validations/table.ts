import { z } from "zod";

export const tableSchema = z.object({
  number: z.coerce
    .number()
    .int("رقم الطاولة يجب أن يكون رقماً صحيحاً")
    .min(1, "رقم الطاولة يجب أن يكون أكبر من صفر")
    .max(999, "رقم الطاولة كبير جداً"),

  capacity: z.coerce
    .number()
    .int("السعة يجب أن تكون رقماً صحيحاً")
    .min(1, "السعة يجب أن تكون شخصاً واحداً على الأقل")
    .max(50, "السعة كبيرة جداً"),

  location: z
    .string()
    .trim()
    .max(50, "الموقع طويل جداً")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),
});

export type TableInput = z.infer<typeof tableSchema>;