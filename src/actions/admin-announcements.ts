"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { logAction } from "@/lib/services/audit"; // Assuming this is your existing audit helper
import { createAnnouncementSchema } from "@/lib/validations/announcement";

type ActionResult = { success: true } | { success: false; error: string };

// ─── Create ───
export async function createAnnouncement(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { success: false, error: "Unauthorized" };
  }

  const tValidation = await getTranslations("Errors.validation");
  const schema = createAnnouncementSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { title, message, type, isActive, expiresAt } = parsed.data;

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: title || null,
        message,
        type,
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdById: session.user.id!,
      },
    });

    await logAction({
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      action: "CREATE",
      entity: "Announcement", // Update your AuditEntity type to include "Announcement"
      entityId: announcement.id,
      entityName: announcement.title || announcement.message.slice(0, 20),
      severity: "info",
      changes: { after: announcement },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/admin"); // Refresh the dashboard to show the new banner

    return { success: true };
  } catch (error) {
    console.error("[createAnnouncement]", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

// ─── Toggle Active Status ───
export async function toggleAnnouncement(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isActive },
    });

    await logAction({
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      action: "UPDATE",
      entity: "Announcement",
      entityId: announcement.id,
      entityName: announcement.title || announcement.message.slice(0, 20),
      severity: "info",
      changes: { before: { isActive: !isActive }, after: { isActive } },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("[toggleAnnouncement]", error);
    return { success: false, error: "Failed to toggle announcement" };
  }
}

// ─── Delete ───
export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  const session = await auth();
  // Deleting is ADMIN-only for safety
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Admin privileges required" };
  }

  try {
    const announcement = await prisma.announcement.delete({
      where: { id },
    });

    await logAction({
      userId: session.user.id,
      userName: session.user.name || "Unknown",
      action: "DELETE",
      entity: "Announcement",
      entityId: announcement.id,
      entityName: announcement.title || announcement.message.slice(0, 20),
      severity: "warning",
      changes: { before: announcement },
    });

    revalidatePath("/admin/announcements");
    revalidatePath("/admin");

    return { success: true };
  } catch (error) {
    console.error("[deleteAnnouncement]", error);
    return { success: false, error: "Failed to delete announcement" };
  }
}