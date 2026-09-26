import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════
// 📊 Analytics Service — تجميع البيانات للرسوم البيانية
// ═══════════════════════════════════════════════════

// ─── 1. توزيع الأطباق حسب التصنيف ───
export async function getCategoryDistribution() {
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: {
      name: true,
      _count: { select: { items: true } },
    },
  });

  return categories.map((cat) => ({
    name: cat.name,
    value: cat._count.items,
  }));
}

// ─── 2. توزيع الأسعار (نطاقات) ───
export async function getPriceDistribution() {
  const items = await prisma.menuItem.findMany({
    where: { isAvailable: true },
    select: { price: true },
  });

  const buckets = [
    { name: "٠ - ٥٠", min: 0, max: 50, value: 0 },
    { name: "٥١ - ١٠٠", min: 51, max: 100, value: 0 },
    { name: "١٠١ - ١٥٠", min: 101, max: 150, value: 0 },
    { name: "١٥١ - ٢٠٠", min: 151, max: 200, value: 0 },
    { name: "٢٠٠+", min: 201, max: Infinity, value: 0 },
  ];

  for (const item of items) {
    const bucket = buckets.find(
      (b) => item.price >= b.min && item.price <= b.max
    );
    if (bucket) bucket.value += 1;
  }

  return buckets.map(({ name, value }) => ({ name, value }));
}

// ─── 3. المميزة مقابل العادية ───
export async function getFeaturedDistribution() {
  const [featured, regular] = await Promise.all([
    prisma.menuItem.count({ where: { isFeatured: true, isAvailable: true } }),
    prisma.menuItem.count({ where: { isFeatured: false, isAvailable: true } }),
  ]);

  return [
    { name: "مميزة ⭐", value: featured },
    { name: "عادية", value: regular },
  ];
}