// src/lib/validations/order.ts
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
      .optional()
      .refine((val) => {
        // If it's empty (Dine-In), it's valid
        if (!val) return true;
        // Otherwise, enforce the rules
        if (val.length < 8) return false;
        if (val.length > 20) return false;
        return /^[+\d\s\-()]+$/.test(val);
      }, t("guestPhoneInvalidChars")),
    
    deliveryAddress: z.string().trim().min(5).max(200).optional(),
    tableNumber: z.string().optional(),
    paymentMethod: z.enum(["CARD", "CASH"]).default("CARD"),
  });
}

export type CheckoutInput = z.infer<ReturnType<typeof createCheckoutSchema>>;