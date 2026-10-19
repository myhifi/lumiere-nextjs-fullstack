import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════
// 📊 Analytics Service — تجميع البيانات للرسوم البيانية
// ═══════════════════════════════════════════════════

// ─── 1. Category distribution ───
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

// ─── 2. توزيع الأسعار (نطاقات) ───
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

// ─── 3. Featured vs regular ───
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