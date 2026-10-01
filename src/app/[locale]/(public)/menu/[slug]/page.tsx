import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getLocalizedName } from "@/lib/utils/locale";

export const dynamic = "force-dynamic";

type MenuItemPageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

// ═══════════════════════════════════════════════════
// 🌐 Dynamic metadata per item and locale
// ═══════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: MenuItemPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "ItemDetail" });

  const item = await prisma.menuItem.findUnique({
    where: { slug },
    include: { category: { select: { name: true, nameEn: true } } },
  });

  if (!item) {
    notFound();
  }

  // Translate category name
  const categoryName = getLocalizedName(
    item.category.name,
    item.category.nameEn,
    locale
  );

  const price = `${item.price} ${t("currency")}`;
  const description =
    item.description ?? `${item.name} — ${categoryName} — ${price}`;

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
// 🍽️ Menu Item Detail Page
// ═══════════════════════════════════════════════════
export default async function MenuItemPage({ params }: MenuItemPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("ItemDetail");

  const item = await prisma.menuItem.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, nameEn: true, slug: true } },
    },
  });

  if (!item) notFound();

  // Translate category name to current locale
  const categoryName = getLocalizedName(
    item.category.name,
    item.category.nameEn,
    locale
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link
        href="/menu"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors mb-8"
      >
        <span>→</span>
        <span>{t("backToMenu")}</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Image */}
        <div className="relative aspect-square bg-accent-light rounded-3xl overflow-hidden">
          {/* Shimmer layer */}
          <div className="absolute inset-0 z-0 shimmer" aria-hidden="true" />

          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ aspectRatio: "1 / 1" }}
              className="object-cover z-10 animate-[fadeIn_0.4s_ease-out]"
              priority
            />
          ) : (
            <div className="absolute inset-0 z-10 flex items-center justify-center text-8xl text-accent/30">
              🍽️
            </div>
          )}

          {item.isFeatured && (
            <span className="absolute top-4 left-4 z-20 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
              ⭐
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm text-accent font-medium mb-2">
            {categoryName}
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
            <span className="text-base font-normal text-muted">
              {t("currency")}
            </span>
          </div>

          {/* Reserve button */}
          <Link
            href="/reserve"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors self-start"
          >
            {t("reserveTable")}
            <span>←</span>
          </Link>

          {/* Availability */}
          <p className="text-xs text-muted mt-4">
            {item.isAvailable ? t("available") : t("unavailable")}
          </p>
        </div>
      </div>
    </div>
  );
}