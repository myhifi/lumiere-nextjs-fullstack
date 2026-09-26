"use server";

import { menuItemSchema } from "@/lib/validations/menu-item";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/services/audit";

// ═══════════════════════════════════════════════════
// 🍽️ Server Actions: إدارة الأطباق
// ═══════════════════════════════════════════════════

type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return null;
  }
  return session.user;
}

// ─── اسم المستخدم الموحّد للسجلات ───
function getUserName(user: { name?: string | null }): string {
  return user.name ?? "Unknown";
}

// ─── تبديل توفّر الطبق ───
export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

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
    return { success: false, error: "فشل تحديث الطبق" };
  }
}

// ─── تبديل تمييز الطبق ───
export async function toggleMenuItemFeatured(
  itemId: string,
  isFeatured: boolean
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

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
    return { success: false, error: "فشل تحديث الطبق" };
  }
}

// ─── حذف طبق (للمدير فقط) ───
export async function deleteMenuItem(itemId: string): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  if (user.role !== "ADMIN") {
    return { success: false, error: "صلاحية المدير مطلوبة للحذف" };
  }

  try {
    // جلب بيانات الطبق قبل الحذف (للسجل)
    const deleted = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { name: true, price: true, categoryId: true },
    });

    if (!deleted) {
      return { success: false, error: "الطبق غير موجود" };
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
    return { success: false, error: "فشل حذف الطبق" };
  }
}

// ─── نتيجة موحّدة للنماذج ───
export type MenuItemActionResult =
  | { success: true; id: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── إنشاء طبق جديد ───
export async function createMenuItem(
  input: unknown
): Promise<MenuItemActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  // 1. التحقق من البيانات
  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return {
      success: false,
      error: "تحقق من البيانات المُدخلة",
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // 2. التحقق من عدم تكرار slug
    const existing = await prisma.menuItem.findUnique({
      where: { slug: data.slug },
    });
    if (existing) {
      return {
        success: false,
        error: "المعرّف (slug) مستخدم بالفعل",
        fieldErrors: { slug: ["هذا المعرّف مستخدم بالفعل"] },
      };
    }

    // 3. الحفظ
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

    // 4. التسجيل في Audit Log
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
    return { success: false, error: "فشل إنشاء الطبق" };
  }
}

// ─── تحديث طبق موجود ───
export async function updateMenuItem(
  itemId: string,
  input: unknown
): Promise<MenuItemActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "_";
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { success: false, error: "تحقق من البيانات المُدخلة", fieldErrors };
  }

  const data = parsed.data;

  try {
    // 1. جلب البيانات القديمة (للسجل)
    const before = await prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { name: true, price: true, isAvailable: true, isFeatured: true },
    });

    if (!before) {
      return { success: false, error: "الطبق غير موجود" };
    }

    // 2. التحقق من عدم تكرار slug على طبق آخر
    const duplicate = await prisma.menuItem.findFirst({
      where: { slug: data.slug, NOT: { id: itemId } },
    });
    if (duplicate) {
      return {
        success: false,
        error: "المعرّف (slug) مستخدم في طبق آخر",
        fieldErrors: { slug: ["هذا المعرّف مستخدم في طبق آخر"] },
      };
    }

    // 3. التحديث
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

    // 4. التسجيل في Audit Log
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
    return { success: false, error: "فشل تحديث الطبق" };
  }
}