import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { AddToCartButton } from "./AddToCartButton";

type MenuItemCardProps = {
  item: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    isFeatured: boolean;
    isAvailable: boolean;
    stock: number; // NEW
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
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-accent/40 transition-all duration-300 flex flex-col">
      {/* Image (Clickable) */}
      <Link href={`/menu/${item.slug}`} className="relative aspect-4/3 bg-accent-light overflow-hidden block">
        <div className="absolute inset-0 z-0 shimmer" aria-hidden="true" />
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
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
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs text-accent-dark font-medium mb-1">
          {item.category.name}
        </span>
        <Link href={`/menu/${item.slug}`}>
          <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
            {item.name}
          </h3>
        </Link>
        {item.description && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
            {item.description}
          </p>
        )}
        
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-4">
          <span className="text-xl font-bold text-accent-dark">
            {item.price}{" "}
            <span className="text-sm font-normal">{t("currency")}</span>
          </span>
          
          {/* NEW: Add to Cart Button */}
          <AddToCartButton 
            item={item} 
            showText={false} 
            className="px-4! py-2!" 
          />
        </div>
      </div>
    </div>
  );
}