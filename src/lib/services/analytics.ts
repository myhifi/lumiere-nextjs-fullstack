// src/lib/services/analytics.ts
import { prisma } from "@/lib/prisma";
import { getLocalizedName } from "@/lib/utils/locale";

// ═══════════════════════════════════════════════════
// 📊 Analytics Service — Menu & Financial Aggregations
// ═══════════════════════════════════════════════════

// ─── PART 1: MENU ANALYTICS (Existing) ───

// 1. Category distribution
export async function getCategoryDistribution() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      name: true,
      nameEn: true,
      _count: { select: { items: true } },
    },
  });

  return categories.map((cat) => ({
    name: cat.name,
    nameEn: cat.nameEn,
    value: cat._count.items,
  }));
}

// 2. Price distribution (buckets)
export async function getPriceDistribution() {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    select: { price: true },
  });

  const buckets = [
    { name: "0 – 50", min: 0, max: 50, value: 0 },
    { name: "51 – 100", min: 51, max: 100, value: 0 },
    { name: "101 – 150", min: 101, max: 150, value: 0 },
    { name: "151 – 200", min: 151, max: 200, value: 0 },
    { name: "200+", min: 201, max: Infinity, value: 0 },
  ];

  for (const item of items) {
    const bucket = buckets.find(
      (b) => item.price >= b.min && item.price <= b.max
    );
    if (bucket) bucket.value += 1;
  }

  return buckets.map(({ name, value }) => ({ name, value }));
}

// 3. Featured vs regular
export async function getFeaturedDistribution() {
  const [featured, regular] = await Promise.all([
    prisma.menuItem.count({ where: { isFeatured: true, isAvailable: true } }),
    prisma.menuItem.count({ where: { isFeatured: false, isAvailable: true } }),
  ]);

  // Return raw keys; translation happens in the component
  return [
    { name: "featured", value: featured },
    { name: "regular", value: regular },
  ];
}

// ─── PART 2: FINANCIAL & ORDER ANALYTICS (New) ───

// 4. Financial KPIs (Revenue, Orders, AOV)
export async function getFinancialMetrics() {
  const result = await prisma.order.aggregate({
    where: {
      status: { in: ["PAID", "PREPARING", "READY", "DELIVERED"] },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const totalRevenue = result._sum.totalAmount ?? 0;
  const totalOrders = result._count.id ?? 0;
  
  // Average Order Value (AOV)
  const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return { totalRevenue, totalOrders, aov };
}

// 5. Revenue Timeline (Last 14 Days)
export async function getRevenueTimeline() {
  // Use raw SQL to group by DATE_TRUNC (Prisma doesn't support this natively yet)
  const result = await prisma.$queryRaw<{ date: Date; revenue: number }[]>`
    SELECT 
      DATE_TRUNC('day', "createdAt") as date,
      SUM("totalAmount") as revenue
    FROM "orders"
    WHERE 
      "status" IN ('PAID', 'PREPARING', 'READY', 'DELIVERED')
      AND "createdAt" >= NOW() - INTERVAL '14 days'
    GROUP BY DATE_TRUNC('day', "createdAt")
    ORDER BY date ASC;
  `;

  return result.map((row) => ({
    date: row.date.toISOString().split("T")[0], // YYYY-MM-DD
    revenue: Number(row.revenue), 
  }));
}

// 6. Top Selling Items (Top 5)
export async function getTopSellingItems() {
  const topItems = await prisma.orderItem.groupBy({
    by: ["menuItemId"],
    where: {
      order: {
        status: { in: ["PAID", "PREPARING", "READY", "DELIVERED"] },
      },
    },
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: 5,
  });

  const itemIds = topItems.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } },
    select: { id: true, name: true, nameEn: true },
  });

  return topItems.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId);
    return {
      id: item.menuItemId,
      name: menuItem?.name ?? "Unknown",
      nameEn: menuItem?.nameEn ?? null,
      totalSold: item._sum.quantity ?? 0,
    };
  });
}

// 7. CSV Generation
export async function generateOrdersCSV(locale: string = "en") { // <-- Accept locale
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["PAID", "PREPARING", "READY", "DELIVERED"] },
    },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { menuItem: { select: { name: true, nameEn: true } } } },
    },
  });

  const headers = [
    "Order ID",
    "Date",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "Status",
    "Total (AED)",
    "Items Summary",
  ];

  const rows = orders.map((order) => {
    const date = order.createdAt.toISOString();
    
    // Use localized names for the items
    const itemsSummary = order.items
      .map((i) => {
        const itemName = getLocalizedName(i.menuItem.name, i.menuItem.nameEn, locale);
        return `${i.quantity}x ${itemName}`;
      })
      .join(" | ");
      
    return [
      order.id,
      date,
      `"${order.guestName}"`, 
      order.guestEmail,
      order.guestPhone,
      `"${order.deliveryAddress}"`,
      order.status,
      order.totalAmount.toFixed(2),
      `"${itemsSummary}"`,
    ].join(",");
  });

  // Prepend the UTF-8 BOM (\uFEFF) so Excel reads Arabic correctly
  return "\uFEFF" + [headers.join(","), ...rows].join("\n");
}