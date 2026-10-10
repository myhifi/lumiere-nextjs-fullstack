import { z } from "zod";

type TranslateFn = (key: string) => string;

export function createWhatsAppNumberSchema(t: TranslateFn) {
  return z.object({
    whatsappNumber: z
      .string()
      .trim()
      .min(1, t("whatsappNumberRequired"))
      // Allow digits, +, spaces, dashes, parens — reject letters
      .refine((val) => /^[+\d\s\-()]+$/.test(val), {
        message: t("whatsappNumberInvalidChars"),
      })
      // Must contain 10-15 digits after stripping separators
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, "");
          return digits.length >= 10 && digits.length <= 15;
        },
        { message: t("whatsappNumberInvalid") }
      ),
  });
}

export type WhatsAppNumberInput = z.infer<
  ReturnType<typeof createWhatsAppNumberSchema>
>;