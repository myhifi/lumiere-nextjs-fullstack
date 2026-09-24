import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MenuItemRow } from "@/components/admin/MenuItemRow";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  searchParams: Promise<{ category?: string; availability?: string }>;
};

export default async function AdminMenuPage({ searchParams }: PageProps) {
  const session = await auth();
  const { category, availability } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";

  // جلب التصنيفات لشريط التصفية
  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // جلب الأطباق مع التصفية
  const items = await prisma.menuItem.findMany({
    where: {
      ...(category && { category: { slug: category } }),
      ...(availability === "available" && { isAvailable: true }),
      ...(availability === "hidden" && { isAvailable: false }),
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    include: {
      category: { select: { name: true } },
    },
  });

  return (
    <div className="p-8">
      {/* الترويسة */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-2">🍽️ إدارة الأطباق</h1>
          <p className="text-muted">
            {items.length} طبق{category || availability ? " (بعد التصفية)" : " إجمالاً"}
          </p>
        </div>
        <Link
          href="/admin/menu/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors"
        >
          + طبق جديد
        </Link>
      </div>

      {/* التصفية حسب التصنيف */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Link
          href={buildURL({ availability })}
          className={`text-sm px-4 py-2 rounded-full border transition-colors ${
            !category
              ? "bg-accent text-white border-accent"
              : "bg-card border-border hover:border-accent hover:text-accent"
          }`}
        >
          الكل
        </Link>
        {categories.map((cat) => {
          const isActive = category === cat.slug;
          return (
            <Link
              key={cat.id}
              href={buildURL({ category: cat.slug, availability })}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-card border-border hover:border-accent hover:text-accent"
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* التصفية حسب التوفر */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href={buildURL({ category })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !availability
              ? "bg-foreground text-background border-foreground"
              : "bg-card border-border hover:border-foreground"
          }`}
        >
          كل الحالات
        </Link>
        <Link
          href={buildURL({ category, availability: "available" })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            availability === "available"
              ? "bg-green-600 text-white border-green-600"
              : "bg-card border-border hover:border-green-600 hover:text-green-700"
          }`}
        >
          ✓ متاح
        </Link>
        <Link
          href={buildURL({ category, availability: "hidden" })}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            availability === "hidden"
              ? "bg-red-600 text-white border-red-600"
              : "bg-card border-border hover:border-red-500 hover:text-red-700"
          }`}
        >
          ⊘ غير متاح
        </Link>
      </div>

      {/* القائمة */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {items.length === 0 ? (
        <EmptyState
        icon="🍽️"
        title={category || availability ? "لا توجد أطباق بهذه التصفية" : "لا توجد أطباق بعد"}
        description={
            category || availability
            ? "جرّب تغيير التصفية أو إضافة طبق جديد."
            : "أضف أول طبق ليظهر في قائمة العملاء."
        }
        action={
            <Link
            href="/admin/menu/new"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
            >
            + إضافة طبق جديد
            </Link>
        }
        />
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <MenuItemRow key={item.id} item={item} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── مساعد بناء URL مع الحفاظ على البقية ───
function buildURL(params: {
  category?: string;
  availability?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.availability) qs.set("availability", params.availability);
  const query = qs.toString();
  return `/admin/menu${query ? `?${query}` : ""}`;
}