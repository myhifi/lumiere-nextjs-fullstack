"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createMenuItemSchema } from "@/lib/validations/menu-item";
import { logAction } from "@/lib/services/audit";
import { tError } from "@/lib/utils/server-errors";

// ═══════════════════════════════════════════════════
// 🍽️ Server Actions: Menu items management
// ═══════════════════════════════════════════════════

type ActionResult = { success: true } | { success: false; error: string };

export type MenuItemActionResult =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

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

// ─── Toggle availability ───
export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  try {
    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable },
      select: { name: true },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "MenuItem",
      entityId: itemId,
      entityName: item.name,
      severity: isAvailable ? "info" : "warning",
      changes: { after: { isAvailable } },
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[toggleMenuItemAvailability]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Toggle featured ───
export async function toggleMenuItemFeatured(
  itemId: string,
  isFeatured: boolean
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  try {
    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: { isFeatured },
      select: { name: true },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "MenuItem",
      entityId: itemId,
      entityName: item.name,
      severity: "info",
      changes: { after: { isFeatured } },
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[toggleMenuItemFeatured]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Delete item (admin only) ───
export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  if (user.role !== "ADMIN") {
    return { success: false, error: await tError("adminRequired") };
  }

  try {
    const deleted = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { name: true, price: true, categoryId: true },
    });

    if (!deleted) {
      return { success: false, error: await tError("notFound") };
    }

    await prisma.menuItem.delete({ where: { id: itemId } });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "DELETE",
      entity: "MenuItem",
      entityId: itemId,
      entityName: deleted.name,
      severity: "critical",
      changes: {
        before: {
          name: deleted.name,
          price: deleted.price,
          categoryId: deleted.categoryId,
        },
      },
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[deleteMenuItem]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Create menu item ───
export async function createMenuItem(
  input: unknown
): Promise<MenuItemActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createMenuItemSchema((key) =>
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

  try {
    const existing = await prisma.menuItem.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return {
        success: false,
        error: await tError("duplicateSlug"),
        fieldErrors: { slug: [await tError("duplicateSlug")] },
      };
    }

    const item = await prisma.menuItem.create({
      data: {
        name: data.name,
        slug: data.slug,
        description:
          data.description && data.description !== ""
            ? data.description
            : null,
        price: data.price,
        imageUrl:
          data.imageUrl && data.imageUrl !== "" ? data.imageUrl : null,
        categoryId: data.categoryId,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
      },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "CREATE",
      entity: "MenuItem",
      entityId: item.id,
      entityName: item.name,
      severity: "info",
      changes: {
        after: {
          name: item.name,
          price: item.price,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
        },
      },
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true, id: item.id };
  } catch (error) {
    console.error("[createMenuItem]", error);
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Update menu item ───
export async function updateMenuItem(
  itemId: string,
  input: unknown
): Promise<MenuItemActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createMenuItemSchema((key) =>
    tValidation(key as Parameters<typeof tValidation>[0])
  );
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, error: await tError("invalidData"), fieldErrors };
  }

  const data = parsed.data;

  try {
    const before = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { name: true, price: true, isAvailable: true, isFeatured: true },
    });

    if (!before) {
      return { success: false, error: await tError("notFound") };
    }

    const duplicate = await prisma.menuItem.findFirst({
      where: { slug: data.slug, NOT: { id: itemId } },
    });
    if (duplicate) {
      return {
        success: false,
        error: await tError("duplicateSlug"),
        fieldErrors: { slug: [await tError("duplicateSlug")] },
      };
    }

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        slug: data.slug,
        description:
          data.description && data.description !== ""
            ? data.description
            : null,
        price: data.price,
        imageUrl:
          data.imageUrl && data.imageUrl !== "" ? data.imageUrl : null,
        categoryId: data.categoryId,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
      },
    });

    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "MenuItem",
      entityId: item.id,
      entityName: item.name,
      severity: "info",
      changes: {
        before: {
          name: before.name,
          price: before.price,
          isAvailable: before.isAvailable,
          isFeatured: before.isFeatured,
        },
        after: {
          name: item.name,
          price: item.price,
          isAvailable: item.isAvailable,
          isFeatured: item.isFeatured,
        },
      },
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true, id: item.id };
  } catch (error) {
    console.error("[updateMenuItem]", error);
    return { success: false, error: await tError("unexpected") };
  }
}