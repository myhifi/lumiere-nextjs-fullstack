import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

// Build a locale-prefixed URL (matches localePrefix: "always")
function localeUrl(locale: string, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://lumiere-nextjs-fullstack.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static paths shared across all locales
  const staticPaths = ["", "/menu", "/about", "/reserve"] as const;
  const staticPages: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      staticPaths.map((path) => ({
        url: localeUrl(locale, path),
        lastModified: new Date(),
        changeFrequency: path === "" ? "daily" : "monthly",
        priority: path === "" ? 1.0 : path === "/menu" ? 0.9 : 0.8,
      }))
  );

  // Dynamic menu item pages × all locales
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      select: { slug: true, updatedAt: true },
    });

    const itemPages: MetadataRoute.Sitemap = routing.locales.flatMap(
      (locale) =>
        items.map((item) => ({
          url: localeUrl(locale, `/menu/${item.slug}`),
          lastModified: item.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }))
    );

    return [...staticPages, ...itemPages];
  } catch {
    return staticPages;
  }
}