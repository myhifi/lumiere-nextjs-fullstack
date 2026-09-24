import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email("البريد الإلكتروني غير صحيح"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `كلمة السر ${MIN_PASSWORD_LENGTH} أحرف على الأقل`)
    .max(100, "كلمة السر طويلة جداً"),
  name: z.string().trim().min(2, "الاسم قصير جداً").max(80, "الاسم طويل جداً"),
  role: z.enum(["ADMIN", "STAFF"], {
    message: "الدور يجب أن يكون ADMIN أو STAFF",
  }),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(80, "الاسم طويل جداً"),
  role: z.enum(["ADMIN", "STAFF"]),
  isActive: z.boolean(),
  // كلمة السر اختيارية في التعديل
  newPassword: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `كلمة السر ${MIN_PASSWORD_LENGTH} أحرف على الأقل`)
    .max(100, "كلمة السر طويلة جداً")
    .optional()
    .or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;