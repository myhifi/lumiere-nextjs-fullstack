"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { logAction } from "@/lib/services/audit";
import { tError } from "@/lib/utils/server-errors";

// ═══════════════════════════════════════════════════
// 👥 Server Actions: Staff management
// ═══════════════════════════════════════════════════

type ActionResult =
  | { success: true; id: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

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

// ─── Create user ───
export async function createUser(input: unknown): Promise<ActionResult> {
  const admin = await requireAdminRole();
  if (!admin) return { success: false, error: await tError("adminRequired") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = createUserSchema((key) =>
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
    const duplicate = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (duplicate) {
      return {
        success: false,
        error: await tError("duplicateEmail"),
        fieldErrors: { email: [await tError("duplicateEmail")] },
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
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Update user ───
export async function updateUser(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const admin = await requireAdminRole();
  if (!admin) return { success: false, error: await tError("adminRequired") };

  const tValidation = await getTranslations("Errors.validation");
  const schema = updateUserSchema((key) =>
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
    // 🛡️ Protection 1: cannot remove ADMIN role from yourself
    if (id === admin.id && data.role !== "ADMIN") {
      return { success: false, error: await tError("selfRoleChange") };
    }

    // 🛡️ Protection 2: cannot disable yourself
    if (id === admin.id && !data.isActive) {
      return { success: false, error: await tError("selfDisable") };
    }

    // 🛡️ Protection 3: cannot demote/disable the last active admin
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
        return { success: false, error: await tError("lastAdmin") };
      }
    }

    const before = await prisma.user.findUnique({
      where: { id },
      select: { name: true, role: true, isActive: true },
    });

    if (!before) {
      return { success: false, error: await tError("notFound") };
    }

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
      severity: "warning",
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
    return { success: false, error: await tError("unexpected") };
  }
}

// ─── Delete user ───
export async function deleteUser(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const admin = await requireAdminRole();
  if (!admin) return { success: false, error: await tError("adminRequired") };

  if (id === admin.id) {
    return { success: false, error: await tError("selfDelete") };
  }

  try {
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return { success: false, error: await tError("notFound") };

    // 🛡️ Cannot delete the last active admin
    if (target.role === "ADMIN" && target.isActive) {
      const otherActiveAdmins = await prisma.user.count({
        where: { role: "ADMIN", isActive: true, NOT: { id } },
      });
      if (otherActiveAdmins === 0) {
        return { success: false, error: await tError("lastAdmin") };
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
    return { success: false, error: await tError("unexpected") };
  }
}