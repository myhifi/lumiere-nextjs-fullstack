"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════
// 🔐 Server Actions: إدارة الحجوزات (لوحة التحكم)
// ═══════════════════════════════════════════════════

type UpdateResult = { success: true } | { success: false; error: string };

// التحقق من الصلاحيات
async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return null;
  }
  return session.user;
}

// ─── تغيير حالة حجز ───
export async function updateReservationStatus(
  reservationId: string,
  newStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
): Promise<UpdateResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  try {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: newStatus },
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
    await prisma.reservation.delete({ where: { id: reservationId } });

    revalidatePath("/admin/reservations");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[deleteReservation]", error);
    return { success: false, error: "فشل حذف الحجز" };
  }
}