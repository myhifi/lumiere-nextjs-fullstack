import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════
// 🗺️ Sitemap — يُخبر Google بكل صفحات الموقع
// ═══════════════════════════════════════════════════
// • Next.js يبني sitemap.xml تلقائياً من هذا الملف
// • يُحدَّث عند كل بناء (مع كل نشرة)
// • يحتوي الصفحات العامة + صفحات الأطباق الديناميكية

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://lumiere-nextjs-fullstack.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── الصفحات الثابتة ───
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/menu`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/reserve`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // ─── صفحات الأطباق الديناميكية ───
  try {
    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      select: { slug: true, updatedAt: true },
    });

    const itemPages: MetadataRoute.Sitemap = items.map((item) => ({
      url: `${SITE_URL}/menu/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticPages, ...itemPages];
  } catch {
    // إن فشل الاتصال بـ DB، نُعيد الصفحات الثابتة فقط
    return staticPages;
  }
}