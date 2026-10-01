import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://lumiere-nextjs-fullstack.vercel.app";

export default function robots(): MetadataRoute.Robots {
  // Disallow admin + API across all locale prefixes
  const localePrefixes = routing.locales.map((locale) => `/${locale}`);
  const disallow = localePrefixes.flatMap((prefix) => [
    `${prefix}/admin`,
    `${prefix}/admin/`,
  ]);
  disallow.push("/api/");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}