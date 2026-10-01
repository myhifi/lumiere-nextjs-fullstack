"use server";

import { prisma } from "@/lib/prisma";
import {
  createReservationSchema,
  parseReservationDate,
} from "@/lib/validations/reservation";
import { getLocale, getTranslations } from "next-intl/server";
import {
  findBestTable,
  DEFAULT_DURATION_MINUTES,
} from "@/lib/services/table-assignment";
import { sendReservationConfirmation } from "@/lib/email/send";
import { tError } from "@/lib/utils/server-errors";

// ═══════════════════════════════════════════════════
// 📅 Server Action: Create new reservation
// ═══════════════════════════════════════════════════

export type CreateReservationResult =
  | { success: true; reservationId: string; tableNumber: number }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function createReservation(
  input: unknown
): Promise<CreateReservationResult> {
  // Get the current request's locale (for both validation + email)
  const locale = await getLocale();

  // ─── 1. Validate input with Zod (using current locale) ───
  const tValidation = await getTranslations("Errors.validation");
  const schema = createReservationSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: await tError("invalidData"),
      fieldErrors,
    };
  }

  const data = parsed.data;
  const reservationDate = parseReservationDate(data.date, data.time);
  const duration = DEFAULT_DURATION_MINUTES;

  try {
    // ─── 2. Fetch candidate tables with nearby reservations ───
    const bufferMs = 3 * 60 * 60 * 1000;
    const windowStart = new Date(reservationDate.getTime() - bufferMs);
    const windowEnd = new Date(
      reservationDate.getTime() + duration * 60_000 + bufferMs
    );

    const tables = await prisma.table.findMany({
      where: {
        isActive: true,
        capacity: { gte: data.guestsCount, lte: data.guestsCount + 3 },
      },
      include: {
        reservations: {
          where: {
            status: { in: ["PENDING", "CONFIRMED"] },
            reservationDate: { gte: windowStart, lte: windowEnd },
          },
          select: { reservationDate: true, durationMinutes: true },
        },
      },
    });

    // ─── 3. Assign best table (pure function) ───
    const bestTable = findBestTable(tables, {
      guestsCount: data.guestsCount,
      reservationDate,
      durationMinutes: duration,
    });

    if (!bestTable) {
      return {
        success: false,
        error: await tError("noTableAvailable"),
      };
    }

    // ─── 4. Save reservation (highest priority) ───
    const reservation = await prisma.reservation.create({
      data: {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        guestsCount: data.guestsCount,
        reservationDate,
        durationMinutes: duration,
        status: "PENDING",
        notes: data.notes && data.notes !== "" ? data.notes : null,
        tableId: bestTable.id,
      },
    });

    // ─── 5. Send confirmation email (non-blocking) ───
    try {
      const emailResult = await sendReservationConfirmation(
        {
          to: data.guestEmail,
          guestName: data.guestName,
          reservationId: reservation.id,
          tableNumber: bestTable.number,
          reservationDate,
          guestsCount: data.guestsCount,
        },
        locale
      );

      if (!emailResult.success) {
        console.error(
          `[createReservation] Email failed for ${reservation.id}:`,
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error("[createReservation] Email exception:", emailError);
    }

    return {
      success: true,
      reservationId: reservation.id,
      tableNumber: bestTable.number,
    };
  } catch (error) {
    console.error("[createReservation] error:", error);
    return {
      success: false,
      error: await tError("unexpected"),
    };
  }
}