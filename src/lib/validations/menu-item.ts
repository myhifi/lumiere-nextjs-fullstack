import { z } from "zod";

// ═══════════════════════════════════════════════════
// 🍽️ مخطط التحقق من بيانات الطبق
// ═══════════════════════════════════════════════════

export const menuItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "اسم الطبق قصير جداً")
    .max(80, "اسم الطبق طويل جداً"),

  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "المعرّف قصير جداً")
    .max(80, "المعرّف طويل جداً")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "المعرّف يجب أن يكون بالحروف الإنجليزية الصغيرة والأرقام والشرطات فقط"
    ),

  description: z
    .string()
    .trim()
    .max(500, "الوصف طويل جداً")
    .optional()
    .or(z.literal("")),

  price: z.coerce
    .number()
    .positive("السعر يجب أن يكون أكبر من صفر")
    .max(10000, "السعر كبير جداً"),

  imageUrl: z
    .string()
    .trim()
    .url("رابط الصورة غير صحيح")
    .optional()
    .or(z.literal("")),

  categoryId: z.string().min(1, "يجب اختيار تصنيف"),

  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;