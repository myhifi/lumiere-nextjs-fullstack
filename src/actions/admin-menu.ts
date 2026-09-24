"use server";

import { menuItemSchema } from "@/lib/validations/menu-item";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

// ─── تبديل توفّر الطبق ───
export async function toggleMenuItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  try {
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isAvailable },
    });
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
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
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { isFeatured },
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
    // حماية: لا نحذف إن كان الطبق مرتبطاً بحجوزات (لا يوجد ربط مباشر حالياً، لكن نتحقق مستقبلاً)
    await prisma.menuItem.delete({ where: { id: itemId } });
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
        description: data.description && data.description !== "" ? data.description : null,
        price: data.price,
        imageUrl: data.imageUrl && data.imageUrl !== "" ? data.imageUrl : null,
        categoryId: data.categoryId,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
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
    // التحقق من عدم تكرار slug على طبق آخر
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

    const item = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description && data.description !== "" ? data.description : null,
        price: data.price,
        imageUrl: data.imageUrl && data.imageUrl !== "" ? data.imageUrl : null,
        categoryId: data.categoryId,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
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