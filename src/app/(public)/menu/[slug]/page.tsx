import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

type MenuItemPageProps = {
  params: Promise<{ slug: string }>;
};

// ═══════════════════════════════════════════════════
// 🌐 Metadata ديناميكية لكل طبق
// ═══════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: MenuItemPageProps): Promise<Metadata> {
  const { slug } = await params;

  const item = await prisma.menuItem.findUnique({
    where: { slug },
    include: { category: { select: { name: true } } },
  });

  if (!item) {
    return {
      title: "الطبق غير موجود",
      description: "الطبق الذي تبحث عنه غير متوفر في قائمتنا.",
    };
  }

  const price = `${item.price} ج.م`;
  const description =
    item.description ?? `${item.name} — ${item.category.name} — ${price}`;

  return {
    title: item.name,
    description,
    openGraph: {
      title: `${item.name} | Lumière`,
      description,
      type: "article",
    },
  };
}

// ═══════════════════════════════════════════════════
// 🍽️ صفحة الطبق
// ═══════════════════════════════════════════════════
export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { slug } = await params;

  const item = await prisma.menuItem.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  // لو ما وجدنا الطبق → Next.js يعرض صفحة 404 تلقائياً
  if (!item) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* رابط الرجوع */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-8"
      >
        <span>→</span>
        <span>العودة إلى القائمة</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* 🖼️ الصورة */}
        <div className="relative aspect-square bg-accent-light rounded-3xl overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl text-accent/30">
              🍽️
            </div>
          )}

          {item.isFeatured && (
            <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              ⭐ مميز
            </span>
          )}
        </div>

        {/* 📝 التفاصيل */}
        <div className="flex flex-col">
          <span className="text-sm text-accent font-medium mb-2">
            {item.category.name}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {item.name}
          </h1>

          {item.description && (
            <p className="text-muted leading-relaxed mb-6">
              {item.description}
            </p>
          )}

          <div className="text-3xl font-bold text-accent-dark mb-8">
            {item.price}{" "}
            <span className="text-base font-normal text-muted">ج.م</span>
          </div>

          {/* زر الحجز */}
          <Link
            href="/reserve"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors self-start"
          >
            احجز طاولة
            <span>←</span>
          </Link>

          {/* معلومة توفر */}
          <p className="text-xs text-muted mt-4">
            {item.isAvailable ? "✓ متوفر الآن" : "غير متوفر حالياً"}
          </p>
        </div>
      </div>
    </div>
  );
}