"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createReviewSchema,
  updateReviewStatusSchema,
} from "@/lib/validations/review";
import { logAction } from "@/lib/services/audit";

// ═══════════════════════════════════════════════════
// ⭐ Server Actions: التقييمات
// ═══════════════════════════════════════════════════

// ─── نتيجة إنشاء تقييم (من العميل) ───
export type CreateReviewResult =
  | { success: true; reviewId: string }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };

// ─── نتيجة تحديث حالة (من المدير) ───
type AdminActionResult =
  | { success: true }
  | { success: false; error: string };

// ─── حماية: المدير فقط ───
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

// ═══════════════════════════════════════════════════
// 1️⃣ createReview — العميل يُرسل تقييماً (بلا تسجيل)
// ═══════════════════════════════════════════════════
export async function createReview(
  input: unknown
): Promise<CreateReviewResult> {
  // ⚠️ لا يوجد requireAdmin() — العميل مجهول

  const parsed = createReviewSchema.safeParse(input);
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
    // 🛡️ حماية: منع التقييمات المكررة من نفس البريد خلال 24 ساعة
    if (data.guestEmail && data.guestEmail !== "") {
      const recent = await prisma.review.findFirst({
        where: {
          guestEmail: data.guestEmail,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recent) {
        return {
          success: false,
          error: "لقد أرسلت تقييماً خلال آخر 24 ساعة. شكراً لك!",
        };
      }
    }

    const review = await prisma.review.create({
      data: {
        guestName: data.guestName,
        guestEmail:
          data.guestEmail && data.guestEmail !== ""
            ? data.guestEmail
            : null,
        rating: data.rating,
        comment: data.comment,
        status: "PENDING",
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return { success: true, reviewId: review.id };
  } catch (error) {
    console.error("[createReview]", error);
    return {
      success: false,
      error: "فشل إرسال التقييم. حاول مرة أخرى.",
    };
  }
}

// ═══════════════════════════════════════════════════
// 2️⃣ updateReviewStatus — المدير يوافق/يرفض
// ═══════════════════════════════════════════════════
export async function updateReviewStatus(
  reviewId: string,
  newStatus: "APPROVED" | "REJECTED"
): Promise<AdminActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  // التحقق من الحالة الجديدة
  const parsed = updateReviewStatusSchema.safeParse({ status: newStatus });
  if (!parsed.success) {
    return { success: false, error: "حالة غير صحيحة" };
  }

  try {
    const before = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { guestName: true, status: true },
    });

    if (!before) {
      return { success: false, error: "التقييم غير موجود" };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { status: newStatus },
      select: { id: true, guestName: true },
    });

    // التسجيل في Audit Log
    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "UPDATE",
      entity: "Review",
      entityId: review.id,
      entityName: review.guestName,
      severity: newStatus === "REJECTED" ? "warning" : "info",
      changes: {
        before: { status: before.status },
        after: { status: newStatus },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("[updateReviewStatus]", error);
    return { success: false, error: "فشل تحديث التقييم" };
  }
}

// ═══════════════════════════════════════════════════
// 3️⃣ deleteReview — المدير يحذف نهائياً
// ═══════════════════════════════════════════════════
export async function deleteReview(
  reviewId: string
): Promise<AdminActionResult> {
  const user = await requireAdmin();
  if (!user) return { success: false, error: "غير مصرح" };

  // ⚠️ الحذف النهائي: للمدير فقط
  if (user.role !== "ADMIN") {
    return { success: false, error: "صلاحية المدير مطلوبة للحذف" };
  }

  try {
    const deleted = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { guestName: true, rating: true, comment: true },
    });

    if (!deleted) {
      return { success: false, error: "التقييم غير موجود" };
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // التسجيل في Audit Log
    await logAction({
      userId: user.id,
      userName: getUserName(user),
      action: "DELETE",
      entity: "Review",
      entityId: reviewId,
      entityName: deleted.guestName,
      severity: "critical",
      changes: {
        before: {
          guestName: deleted.guestName,
          rating: deleted.rating,
          comment: deleted.comment,
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error("[deleteReview]", error);
    return { success: false, error: "فشل حذف التقييم" };
  }
}