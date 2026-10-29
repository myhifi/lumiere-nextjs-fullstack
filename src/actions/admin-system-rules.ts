"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ruleSchema = z.object({
  name: z.string().min(2),
  metric: z.enum(["STOCK_LEVEL", "ORDER_TOTAL", "PENDING_RESERVATIONS"]),
  threshold: z.coerce.number().positive(),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "URGENT"]),
  isActive: z.boolean().default(true),
});

export async function createSystemRule(input: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = ruleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.systemRule.create({ data: parsed.data });
    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error) {
    console.error("[createSystemRule]", error);
    return { success: false, error: "Failed to create rule" };
  }
}

export async function deleteSystemRule(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.systemRule.delete({ where: { id } });
    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error) {
    console.error("[deleteSystemRule]", error);
    return { success: false, error: "Failed to delete rule" };
  }
}

export async function updateSystemRule(id: string, input: unknown) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = ruleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.systemRule.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/admin/announcements");
    return { success: true };
  } catch (error) {
    console.error("[updateSystemRule]", error);
    return { success: false, error: "Failed to update rule" };
  }
}