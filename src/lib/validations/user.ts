import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

type TranslateFn = (key: string) => string;

export function createUserSchema(t: TranslateFn) {
  return z.object({
    email: z.string().trim().toLowerCase().email(t("userEmailInvalid")),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, t("passwordTooShort"))
      .max(100, t("passwordTooLong")),
    name: z
      .string()
      .trim()
      .min(2, t("userNameTooShort"))
      .max(80, t("userNameTooLong")),
    role: z.enum(["ADMIN", "STAFF"], { message: t("roleInvalid") }),
    isActive: z.boolean().default(true),
  });
}

export function updateUserSchema(t: TranslateFn) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("userNameTooShort"))
      .max(80, t("userNameTooLong")),
    role: z.enum(["ADMIN", "STAFF"]),
    isActive: z.boolean(),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, t("passwordTooShort"))
      .max(100, t("passwordTooLong"))
      .optional()
      .or(z.literal("")),
  });
}

export type CreateUserInput = z.infer<ReturnType<typeof createUserSchema>>;
export type UpdateUserInput = z.infer<ReturnType<typeof updateUserSchema>>;