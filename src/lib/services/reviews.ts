import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════
// ⭐ Review Service — استعلامات التقييمات
// ═══════════════════════════════════════════════════
// استعلامات مركزية لـ:
//   • الصفحة الرئيسية (التقييمات المعتمدة)
//   • /admin/reviews (كل التقييمات مع فلترة)
//   • Dashboard Overview (إحصائيات)

// ─── الأنواع ───
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

// ─── 1. التقييمات المعتمدة (للصفحة الرئيسية) ───
export async function getApprovedReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      guestName: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  });
}

// ─── 2. التقييمات للإدارة (مع فلترة اختيارية) ───
export async function getReviewsForAdmin(status?: ReviewStatus) {
  return prisma.review.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      rating: true,
      comment: true,
      status: true,
      createdAt: true,
    },
  });
}

// ─── 3. إحصائيات التقييمات (للوحة التحكم) ───
export async function getReviewStats() {
  const [total, pending, approved, rejected, avgResult] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "REJECTED" } }),
    prisma.review.aggregate({
      where: { status: "APPROVED" },
      _avg: { rating: true },
    }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    averageRating: avgResult._avg.rating ?? 0,
  };
}

// ─── 4. متوسط التقييم العام (للصفحة الرئيسية) ───
export async function getAverageRating() {
  const result = await prisma.review.aggregate({
    where: { status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}