"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/services/audit";

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

export async function updateOrderStatus(
  orderId: string,
  newStatus: "PAID" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
): Promise<UpdateResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  try {
    const before = await prisma.order.findUnique({
      where: { id: orderId },
      select: { guestName: true, status: true },
    });

    if (!before) {
      return { success: false, error: "الطلب غير موجود" };
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
      select: { id: true, guestName: true },
    });

    // Log to Audit Trail
    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "Order",
      entityId: order.id,
      entityName: `Order for ${order.guestName}`,
      severity: newStatus === "CANCELLED" ? "warning" : "info",
      changes: {
        before: { status: before.status },
        after: { status: newStatus },
      },
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("[updateOrderStatus]", error);
    return { success: false, error: "فشل تحديث حالة الطلب" };
  }
}