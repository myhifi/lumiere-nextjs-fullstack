import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

// Menu item data as it comes from Prisma
type MenuItemCardProps = {
  item: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isFeatured: boolean;
    category: { name: string };
  };
  priority?: boolean;
};

export async function MenuItemCard({
  item,
  priority = false,
}: MenuItemCardProps) {
  const t = await getTranslations("Menu");

  return (
    <Link
      href={`/menu/${item.slug}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-accent/40 transition-all duration-300 flex flex-col"
    >
      {/* Image or fallback */}
      <div className="relative aspect-4/3 bg-accent-light overflow-hidden">
        {/* Shimmer layer — behind the image */}
        <div className="absolute inset-0 z-0 shimmer" aria-hidden="true" />

        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ aspectRatio: "4 / 3" }}
            className="object-cover group-hover:scale-105 transition-transform duration-500 z-10 animate-[fadeIn_0.4s_ease-out]"
          />
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-4xl text-accent/40">
            🍽️
          </div>
        )}

        {item.isFeatured && (
          <span className="absolute top-3 left-3 z-20 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
            {t("featuredBadge")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs text-accent-dark font-medium mb-1">
          {item.category.name}
        </span>
        <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xl font-bold text-accent-dark">
            {item.price}{" "}
            <span className="text-sm font-normal">{t("currency")}</span>
          </span>
          <span className="text-xs text-muted group-hover:text-accent transition-colors">
            {t("details")}
          </span>
        </div>
      </div>
    </Link>
  );
}