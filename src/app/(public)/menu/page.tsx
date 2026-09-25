import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
import { CategoryFilter } from "@/components/menu/CategoryFilter";

export const metadata: Metadata = {
  title: "القائمة",
  description:
    "تصفح قائمة مطعم Lumière الكاملة — مقبلات، أطباق رئيسية، حلويات، ومشروبات. استخدم الفلاتر لتصفح ما يناسبك.",
  openGraph: {
    title: "القائمة | Lumière",
    description:
      "تصفح قائمة مطعم Lumière الكاملة — مقبلات، أطباق رئيسية، حلويات، ومشروبات.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type MenuPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function MenuPage({ searchParams }: MenuPageProps) {
  // في Next.js 15+: searchParams أصبح Promise
  const { category } = await searchParams;

  // جلب التصنيفات (لأزرار الفلترة) والأطباق في نفس الوقت
  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        ...(category && { category: { slug: category } }),
      },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      include: {
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="text-accent text-sm font-medium tracking-widest">
          OUR MENU
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          قائمة Lumière
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          مجموعة مختارة بعناية من أشهى الأطباق، مُعدّة بأجود المكونات
        </p>
      </div>

      {/* 🔽 أزرار التصفية */}
      <CategoryFilter categories={categories} />

      {/* شبكة الأطباق */}
      {items.length === 0 ? (
        <p className="text-center text-muted py-16">
          لا توجد أطباق في هذا التصنيف حالياً.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <MenuItemCard key={item.id} item={item} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  );
}