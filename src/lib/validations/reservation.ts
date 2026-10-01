// ═══════════════════════════════════════════════════
// 📅 Reservation validation schema (i18n-ready)
// ═══════════════════════════════════════════════════
// The schema is created via a factory that accepts a
// translation function `t`. This allows Server Actions
// to pass locale-specific translations at runtime.

import { z } from "zod";
import { DEFAULT_DURATION_MINUTES } from "@/lib/services/table-assignment";

// Translate function signature (subset of next-intl's t)
type TranslateFn = (key: string) => string;

// ─── Factory: create schema with translated messages ───
export function createReservationSchema(t: TranslateFn) {
  return z
    .object({
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

      guestsCount: z.coerce
        .number()
        .int(t("guestsCountNotInt"))
        .min(1, t("guestsCountMin"))
        .max(10, t("guestsCountMax")),

      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t("dateFormatInvalid")),

      time: z.string().regex(/^\d{2}:\d{2}$/, t("timeFormatInvalid")),

      notes: z
        .string()
        .trim()
        .max(500, t("notesTooLong"))
        .optional()
        .or(z.literal("")),
    })
    .refine(
      (data) => {
        const dt = new Date(`${data.date}T${data.time}:00`);
        return dt.getTime() > Date.now();
      },
      { message: t("dateInPast"), path: ["date"] }
    )
    .refine(
      (data) => {
        const dt = new Date(`${data.date}T${data.time}:00`);
        const hours = dt.getHours();
        return hours >= 12 && hours <= 22;
      },
      { message: t("outsideBusinessHours"), path: ["time"] }
    );
}

// ─── Inferred types (same across all locales) ───
export type ReservationInput = z.infer<
  ReturnType<typeof createReservationSchema>
>;

export type ReservationRequest = ReservationInput & {
  durationMinutes: number;
};

// ─── Helpers ───
export function toReservationRequest(
  input: ReservationInput
): ReservationRequest {
  return { ...input, durationMinutes: DEFAULT_DURATION_MINUTES };
}

export function parseReservationDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}