import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createCheckoutSchema(t: TranslateFn) {
  return z.object({
    guestName: z
      .string()
      .trim()
      .min(2, t("guestNameTooShort"))
      .max(80, t("guestNameTooLong")),
    
    guestEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email(t("guestEmailInvalid")),
    
    guestPhone: z
      .string()
      .trim()
      .min(8, t("guestPhoneTooShort"))
      .max(20, t("guestPhoneTooLong"))
      .regex(/^[+\d\s\-()]+$/, t("guestPhoneInvalidChars")),
    
    deliveryAddress: z
      .string()
      .trim()
      .min(10, t("addressTooShort"))
      .max(200, t("addressTooLong")),
  });
}

export type CheckoutInput = z.infer<ReturnType<typeof createCheckoutSchema>>;