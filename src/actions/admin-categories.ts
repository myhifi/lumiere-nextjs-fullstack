"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations/category";
import { tError } from "@/lib/utils/server-errors";

// ═══════════════════════════════════════════════════
// 📂 Server Actions: Categories management
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

// ─── Create category ───
export async function createCategory(input: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createCategorySchema((key) =>
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
    const duplicate = await prisma.category.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }] },
    });
    if (duplicate) {
      const key = duplicate.slug === data.slug ? "slug" : "name";
      return {
        success: false,
        error:
          key === "slug"
            ? await tError("duplicateSlug")
            : await tError("duplicateName"),
        fieldErrors: {
          [key]: [
            key === "slug"
              ? await tError("duplicateSlug")
              : await tError("duplicateName"),
          ],
        },
      };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        nameEn: data.nameEn && data.nameEn !== "" ? data.nameEn : null,
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
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Update category ───
export async function updateCategory(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createCategorySchema((key) =>
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
    const duplicate = await prisma.category.findFirst({
      where: { OR: [{ slug: data.slug }, { name: data.name }], NOT: { id } },
    });
    if (duplicate) {
      const key = duplicate.slug === data.slug ? "slug" : "name";
      return {
        success: false,
        error:
          key === "slug"
            ? await tError("duplicateSlug")
            : await tError("duplicateName"),
        fieldErrors: {
          [key]: [
            key === "slug"
              ? await tError("duplicateSlug")
              : await tError("duplicateName"),
          ],
        },
      };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        nameEn: data.nameEn && data.nameEn !== "" ? data.nameEn : null,
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
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Delete category (with protection) ───
export async function deleteCategory(id: string): Promise<
  { success: true } | { success: false; error: string }
> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: await tError("unauthorized") };

  if (user.role !== "ADMIN") {
    return { success: false, error: await tError("adminRequired") };
  }

  try {
    // 🛡️ Prevent deleting a category that has dishes
    const itemsCount = await prisma.menuItem.count({ where: { categoryId: id } });
    if (itemsCount > 0) {
      return {
        success: false,
        error: await tError("hasItems", { count: itemsCount }),
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { success: true };
  } catch (error) {
    console.error("[deleteCategory]", error);
    return { success: false, error: await tError("unexpected") };
  }
}