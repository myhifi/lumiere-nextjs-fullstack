"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { logAction } from "@/lib/services/audit";

// ═══════════════════════════════════════════════════
// 👥 Server Actions: إدارة الموظفين
// ═══════════════════════════════════════════════════

type ActionResult =
  | { success: true; id: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

// المدير فقط يدير الموظفين
async function requireAdminRole() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ADMIN") return null;
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

// ─── إنشاء موظف ───
export async function createUser(input: unknown): Promise<ActionResult> {
  const admin = await requireAdminRole();
  if (!admin) return { success: false, error: "صلاحية المدير مطلوبة" };

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "تحقق من البيانات",
      fieldErrors: parseErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    const duplicate = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (duplicate) {
      return {
        success: false,
        error: "البريد مستخدم",
        fieldErrors: { email: ["هذا البريد مستخدم بالفعل"] },
      };
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: data.role,
        isActive: data.isActive,
      },
    });

    await logAction({
      userId: admin.id,
      userName: getUserName(admin),
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      entityName: user.name,
      severity: user.role === "ADMIN" ? "warning" : "info",
      changes: {
        after: {
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
      },
    });

    revalidatePath("/admin/users");
    return { success: true, id: user.id };
  } catch (error) {
    console.error("[createUser]", error);
    return { success: false, error: "فشل إنشاء الموظف" };
  }
}

// ─── تحديث موظف ───
export async function updateUser(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const admin = await requireAdminRole();
  if (!admin) return { success: false, error: "صلاحية المدير مطلوبة" };

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "تحقق من البيانات",
      fieldErrors: parseErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;

  try {
    // 🛡️ حماية 1: لا يمكن للمدير إزالة دور ADMIN من نفسه
    if (id === admin.id && data.role !== "ADMIN") {
      return { success: false, error: "لا يمكنك إزالة صلاحية المدير من نفسك" };
    }

    // 🛡️ حماية 2: لا يمكن تعطيل نفسك
    if (id === admin.id && !data.isActive) {
      return { success: false, error: "لا يمكنك تعطيل حسابك" };
    }

    // 🛡️ حماية 3: لا يمكن تعطيل/تخفيض آخر مدير نشط
    if (data.role !== "ADMIN" || !data.isActive) {
      const otherActiveAdmins = await prisma.user.count({
        where: {
          role: "ADMIN",
          isActive: true,
          NOT: { id },
        },
      });

      const target = await prisma.user.findUnique({ where: { id } });
      const isTargetCurrentlyAdmin =
        target?.role === "ADMIN" && target?.isActive;

      if (isTargetCurrentlyAdmin && otherActiveAdmins === 0) {
        return {
          success: false,
          error: "لا يمكن إزالة صلاحية المدير من آخر مدير نشط",
        };
      }
    }

    // جلب البيانات القديمة (للسجل)
    const before = await prisma.user.findUnique({
      where: { id },
      select: { name: true, role: true, isActive: true },
    });

    if (!before) {
      return { success: false, error: "المستخدم غير موجود" };
    }

    // تحديث البيانات الأساسية
    const updateData: {
      name: string;
      role: string;
      isActive: boolean;
      passwordHash?: string;
    } = {
      name: data.name,
      role: data.role,
      isActive: data.isActive,
    };

    const isPasswordChanged = !!(data.newPassword && data.newPassword !== "");

    if (isPasswordChanged) {
      updateData.passwordHash = await hashPassword(data.newPassword!);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logAction({
      userId: admin.id,
      userName: getUserName(admin),
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      entityName: user.name,
      severity: "warning", // تعديل الموظفين إجراء حساس
      changes: {
        before: {
          name: before.name,
          role: before.role,
          isActive: before.isActive,
        },
        after: {
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          ...(isPasswordChanged && { passwordChanged: true }),
        },
      },
    });

    revalidatePath("/admin/users");
    return { success: true, id: user.id };
  } catch (error) {
    console.error("[updateUser]", error);
    return { success: false, error: "فشل تحديث الموظف" };
  }
}

// ─── حذف موظف ───
export async function deleteUser(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const admin = await requireAdminRole();
  if (!admin) return { success: false, error: "صلاحية المدير مطلوبة" };

  // 🛡️ حماية: لا يمكنك حذف نفسك
  if (id === admin.id) {
    return { success: false, error: "لا يمكنك حذف حسابك الخاص" };
  }

  try {
    // جلب البيانات قبل الحذف
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { success: false, error: "المستخدم غير موجود" };

    // 🛡️ حماية: لا يمكن حذف آخر مدير نشط
    if (target.role === "ADMIN" && target.isActive) {
      const otherActiveAdmins = await prisma.user.count({
        where: { role: "ADMIN", isActive: true, NOT: { id } },
      });
      if (otherActiveAdmins === 0) {
        return { success: false, error: "لا يمكن حذف آخر مدير نشط" };
      }
    }

    await prisma.user.delete({ where: { id } });

    await logAction({
      userId: admin.id,
      userName: getUserName(admin),
      action: "DELETE",
      entity: "User",
      entityId: id,
      entityName: target.name,
      severity: "critical",
      changes: {
        before: {
          email: target.email,
          name: target.name,
          role: target.role,
        },
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("[deleteUser]", error);
    return { success: false, error: "فشل حذف الموظف" };
  }
}