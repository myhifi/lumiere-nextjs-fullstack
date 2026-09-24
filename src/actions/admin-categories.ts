"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/category";

// ═══════════════════════════════════════════════════
// 📂 Server Actions: إدارة التصنيفات
// ═══════════════════════════════════════════════════

type ActionResult = { success: true; id: string } | {
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

// ─── إنشاء تصنيف ───
export async function createCategory(input: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "تحقق من البيانات",
      fieldErrors: parseErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const duplicate = await prisma.category.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }] },
    });
    if (duplicate) {
      const key = duplicate.slug === data.slug ? "slug" : "name";
      return {
        success: false,
        error: key === "slug" ? "المعرّف مستخدم" : "الاسم مستخدم",
        fieldErrors: {
          [key]: [
            key === "slug"
              ? "هذا المعرّف مستخدم بالفعل"
              : "هذا الاسم مستخدم بالفعل",
          ],
        },
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description:
          data.description && data.description !== "" ? data.description : null,
        displayOrder: data.displayOrder,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true, id: category.id };
  } catch (error) {
    console.error("[createCategory]", error);
    return { success: false, error: "فشل إنشاء التصنيف" };
  }
}

// ─── تحديث تصنيف ───
export async function updateCategory(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "تحقق من البيانات",
      fieldErrors: parseErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const duplicate = await prisma.category.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }], NOT: { id } },
    });
    if (duplicate) {
      const key = duplicate.slug === data.slug ? "slug" : "name";
      return {
        success: false,
        error: key === "slug" ? "المعرّف مستخدم" : "الاسم مستخدم",
        fieldErrors: {
          [key]: [
            key === "slug"
              ? "هذا المعرّف مستخدم في تصنيف آخر"
              : "هذا الاسم مستخدم في تصنيف آخر",
          ],
        },
      };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description:
          data.description && data.description !== "" ? data.description : null,
        displayOrder: data.displayOrder,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true, id: category.id };
  } catch (error) {
    console.error("[updateCategory]", error);
    return { success: false, error: "فشل تحديث التصنيف" };
  }
}

// ─── حذف تصنيف (مع حماية) ───
export async function deleteCategory(id: string): Promise<
  { success: true } | { success: false; error: string }
> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  if (user.role !== "ADMIN") {
    return { success: false, error: "صلاحية المدير مطلوبة للحذف" };
  }

  try {
    // 🛡️ حماية: منع الحذف إن كان التصنيف يحتوي على أطباق
    const itemsCount = await prisma.menuItem.count({ where: { categoryId: id } });
    if (itemsCount > 0) {
      return {
        success: false,
        error: `لا يمكن حذف التصنيف — يحتوي على ${itemsCount} طبق. انقل الأطباق لتصنيف آخر أولاً.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[deleteCategory]", error);
    return { success: false, error: "فشل حذف التصنيف" };
  }
}