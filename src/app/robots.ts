import type { MetadataRoute } from "next";

// ═══════════════════════════════════════════════════
// 🤖 Robots — يُخبر محركات البحث ما يُؤرشف
// ═══════════════════════════════════════════════════
// • Next.js يبني robots.txt تلقائياً من هذا الملف
// • /admin → محظور (صفحات إدارية)
// • /api → محظور (نقاط نهاية برمجية)

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://lumiere-nextjs-fullstack.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}