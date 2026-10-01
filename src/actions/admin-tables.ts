"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createTableSchema } from "@/lib/validations/table";
import { logAction } from "@/lib/services/audit";
import { tError } from "@/lib/utils/server-errors";

// ═══════════════════════════════════════════════════
// 🪑 Server Actions: Tables management
// ═══════════════════════════════════════════════════

type ActionResult =
  | { success: true; id: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return null;
  }
  return session.user;
}

function getUserName(user: { name?: string | null }): string {
  return user.name ?? "Unknown";
}

function parseErrors(
  issues: readonly { path: readonly PropertyKey[]; message: string }[]
) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}

// ─── Create table ───
export async function createTable(input: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createTableSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: await tError("invalidData"),
      fieldErrors: parseErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const duplicate = await prisma.table.findUnique({
      where: { number: data.number },
    });
    if (duplicate) {
      return {
        success: false,
        error: await tError("duplicateNumber"),
        fieldErrors: { number: [await tError("duplicateNumber")] },
      };
    }

    const table = await prisma.table.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        location: data.location && data.location !== "" ? data.location : null,
        isActive: data.isActive,
      },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "CREATE",
      entity: "Table",
      entityId: table.id,
      entityName: `Table ${table.number}`,
      severity: "info",
      changes: {
        after: {
          number: table.number,
          capacity: table.capacity,
          location: table.location,
          isActive: table.isActive,
        },
      },
    });

    revalidatePath("/admin/tables");
    revalidatePath("/admin");
    return { success: true, id: table.id };
  } catch (error) {
    console.error("[createTable]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Update table ───
export async function updateTable(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createTableSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: await tError("invalidData"),
      fieldErrors: parseErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const before = await prisma.table.findUnique({
      where: { id },
      select: { number: true, capacity: true, location: true, isActive: true },
    });

    if (!before) {
      return { success: false, error: await tError("notFound") };
    }

    const duplicate = await prisma.table.findFirst({
      where: { number: data.number, NOT: { id } },
    });
    if (duplicate) {
      return {
        success: false,
        error: await tError("duplicateNumber"),
        fieldErrors: { number: [await tError("duplicateNumber")] },
      };
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        number: data.number,
        capacity: data.capacity,
        location: data.location && data.location !== "" ? data.location : null,
        isActive: data.isActive,
      },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "Table",
      entityId: table.id,
      entityName: `Table ${table.number}`,
      severity: "info",
      changes: {
        before: {
          number: before.number,
          capacity: before.capacity,
          location: before.location,
          isActive: before.isActive,
        },
        after: {
          number: table.number,
          capacity: table.capacity,
          location: table.location,
          isActive: table.isActive,
        },
      },
    });

    revalidatePath("/admin/tables");
    revalidatePath("/admin");
    return { success: true, id: table.id };
  } catch (error) {
    console.error("[updateTable]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Toggle active ───
export async function toggleTableActive(
  id: string,
  isActive: boolean
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  try {
    const table = await prisma.table.update({
      where: { id },
      data: { isActive },
      select: { number: true },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "Table",
      entityId: id,
      entityName: `Table ${table.number}`,
      severity: isActive ? "info" : "warning",
      changes: { after: { isActive } },
    });

    revalidatePath("/admin/tables");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[toggleTableActive]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Delete table (with strict protection) ───
export async function deleteTable(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  if (user.role !== "ADMIN") {
    return { success: false, error: await tError("adminRequired") };
  }

  try {
    // 🛡️ Prevent deleting a table with any historical reservation
    const reservationsCount = await prisma.reservation.count({
      where: { tableId: id },
    });
    if (reservationsCount > 0) {
      return {
        success: false,
        error: await tError("hasReservations", { count: reservationsCount }),
      };
    }

    const deleted = await prisma.table.findUnique({
      where: { id },
      select: { number: true, capacity: true, location: true },
    });

    if (!deleted) {
      return { success: false, error: await tError("notFound") };
    }

    await prisma.table.delete({ where: { id } });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "DELETE",
      entity: "Table",
      entityId: id,
      entityName: `Table ${deleted.number}`,
      severity: "critical",
      changes: {
        before: {
          number: deleted.number,
          capacity: deleted.capacity,
          location: deleted.location,
        },
      },
    });

    revalidatePath("/admin/tables");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[deleteTable]", error);
    return { success: false, error: await tError("unexpected") };
  }
}