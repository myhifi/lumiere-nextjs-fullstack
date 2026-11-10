// ═══════════════════════════════════════════════════
// 📊 AI Context Builder
// ═══════════════════════════════════════════════════
// Produces a compact, structured JSON snapshot of
// business performance. Never sends raw rows or PII.

import "server-only";

import { prisma } from "@/lib/prisma";

const REVENUE_STATUSES = [
  "PAID",
  "PREPARING",
  "READY",
  "DELIVERED",
] as const;

const LOW_STOCK_THRESHOLD = 20;
const TOP_ITEMS_LIMIT = 5;
const RECENT_REVIEWS_LIMIT = 5;
const REVIEW_COMMENT_MAX_CHARS = 200;

export type AiContextSnapshot = {
  meta: {
    generatedAt: string;
    periodDays: number;
    currency: string;
  };
  revenue: {
    total: number;
    orderCount: number;
    averageOrderValue: number;
  };
  topItems: Array<{
    name: string;
    quantitySold: number;
    estimatedRevenue: number;
  }>;
  lowStockItems: Array<{ name: string; stock: number }>;
  reservations: {
    pending: number;
    today: number;
  };
  orders: {
    byStatus: Record<string, number>;
  };
  reviews: {
    approvedCount: number;
    averageRating: number;
    recent: Array<{ rating: number; comment: string }>;
  };
};

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function localizedName(item: { name: string; nameEn: string | null }): string {
  return item.nameEn ?? item.name;
}

/**
 * Builds the analytics snapshot for the AI.
 * All queries use `aggregate` / `groupBy` — no full-table scans.
 */
export async function buildAiContext(
  periodDays = 30
): Promise<AiContextSnapshot> {
  const now = new Date();
  const since = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const [
    revenueAgg,
    topItemsAgg,
    lowStockRaw,
    pendingReservations,
    todayReservations,
    ordersByStatusRaw,
    reviewAgg,
    recentReviewsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: { in: [...REVENUE_STATUSES] },
        createdAt: { gte: since },
      },
      _sum: { totalAmount: true },
      _count: true,
    }),

    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          status: { in: [...REVENUE_STATUSES] },
          createdAt: { gte: since },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: TOP_ITEMS_LIMIT,
    }),

    prisma.menuItem.findMany({
      where: {
        stock: { lt: LOW_STOCK_THRESHOLD },
        isAvailable: true,
      },
      orderBy: { stock: "asc" },
      take: TOP_ITEMS_LIMIT,
      select: { name: true, nameEn: true, stock: true },
    }),

    prisma.reservation.count({ where: { status: "PENDING" } }),

    prisma.reservation.count({
      where: {
        reservationDate: { gte: startOfToday, lt: startOfTomorrow },
        status: { not: "CANCELLED" },
      },
    }),

    prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: since } },
      _count: true,
    }),

    prisma.review.aggregate({
      where: { status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    }),

    prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: RECENT_REVIEWS_LIMIT,
      select: { rating: true, comment: true },
    }),
  ]);

  // Resolve top-item names + prices in one extra query
  const topItemIds = topItemsAgg.map((row) => row.menuItemId);
  const topItemDetails =
    topItemIds.length > 0
      ? await prisma.menuItem.findMany({
          where: { id: { in: topItemIds } },
          select: { id: true, name: true, nameEn: true, price: true },
        })
      : [];

  const detailsById = new Map(topItemDetails.map((item) => [item.id, item]));

  const topItems = topItemsAgg.map((row) => {
    const detail = detailsById.get(row.menuItemId);
    const quantitySold = row._sum.quantity ?? 0;
    // Note: uses current menu price, not the historical priceAtOrder.
    // Treated as an *estimate* — the prompt tells the AI this.
    const estimatedRevenue = detail ? detail.price * quantitySold : 0;

    return {
      name: detail ? localizedName(detail) : "Unknown item",
      quantitySold,
      estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
    };
  });

  const totalRevenue = revenueAgg._sum.totalAmount ?? 0;
  const orderCount = revenueAgg._count ?? 0;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  const ordersByStatus: Record<string, number> = {};
  for (const row of ordersByStatusRaw) {
    ordersByStatus[row.status] = row._count;
  }

  return {
    meta: {
      generatedAt: now.toISOString(),
      periodDays,
      currency: "AED",
    },
    revenue: {
      total: Math.round(totalRevenue * 100) / 100,
      orderCount,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    },
    topItems,
    lowStockItems: lowStockRaw.map((item) => ({
      name: localizedName(item),
      stock: item.stock,
    })),
    reservations: {
      pending: pendingReservations,
      today: todayReservations,
    },
    orders: {
      byStatus: ordersByStatus,
    },
    reviews: {
      approvedCount: reviewAgg._count ?? 0,
      averageRating:
        Math.round((reviewAgg._avg.rating ?? 0) * 10) / 10,
      recent: recentReviewsRaw.map((review) => ({
        rating: review.rating,
        comment: truncate(review.comment, REVIEW_COMMENT_MAX_CHARS),
      })),
    },
  };
}