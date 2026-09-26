"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/services/audit";

// ═══════════════════════════════════════════════════
// 📅 Server Actions: إدارة الحجوزات
// ═══════════════════════════════════════════════════
// ⚠️ نُسجّل UPDATE و DELETE فقط — لا CREATE
// (الحجوزات تُنشأ من العميل عبر /reserve بلا userId)

type UpdateResult = { success: true } | { success: false; error: string };

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

// ─── تغيير حالة حجز ───
export async function updateReservationStatus(
  reservationId: string,
  newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
): Promise<UpdateResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  try {
    // جلب الحجز قبل التعديل (للسجل + للحماية)
    const before = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        guestName: true,
        status: true,
        reservationDate: true,
        guestsCount: true,
      },
    });

    if (!before) {
      return { success: false, error: "الحجز غير موجود" };
    }

    const reservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
      select: { id: true, guestName: true },
    });

    // ⚠️ الإلغاء = إجراء حساس → warning
    // بقية الحالات = عادية → info
    const severity = newStatus === "CANCELLED" ? "warning" : "info";

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "Reservation",
      entityId: reservation.id,
      entityName: reservation.guestName,
      severity,
      changes: {
        before: {
          status: before.status,
          reservationDate: before.reservationDate.toISOString(),
          guestsCount: before.guestsCount,
        },
        after: { status: newStatus },
      },
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[updateReservationStatus]", error);
    return { success: false, error: "فشل تحديث الحجز" };
  }
}

// ─── حذف حجز (نهائياً) ───
export async function deleteReservation(
  reservationId: string
): Promise<UpdateResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  // الحذف النهائي متاح للمدير فقط
  if (user.role !== "ADMIN") {
    return { success: false, error: "صلاحية المدير مطلوبة للحذف" };
  }

  try {
    // جلب الحجز قبل الحذف (للسجل)
    const deleted = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        guestName: true,
        guestEmail: true,
        guestPhone: true,
        reservationDate: true,
        guestsCount: true,
        status: true,
        tableId: true,
      },
    });

    if (!deleted) {
      return { success: false, error: "الحجز غير موجود" };
    }

    await prisma.reservation.delete({ where: { id: reservationId } });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "DELETE",
      entity: "Reservation",
      entityId: reservationId,
      entityName: deleted.guestName,
      severity: "critical",
      changes: {
        before: {
          guestName: deleted.guestName,
          guestEmail: deleted.guestEmail,
          guestPhone: deleted.guestPhone,
          reservationDate: deleted.reservationDate.toISOString(),
          guestsCount: deleted.guestsCount,
          status: deleted.status,
          tableId: deleted.tableId,
        },
      },
    });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[deleteReservation]", error);
    return { success: false, error: "فشل حذف الحجز" };
  }
}