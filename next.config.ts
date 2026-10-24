// next.config.ts
import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "flagcdn.com" }, // <-- إضافة جديدة
    ],
  },
  outputFileTracingIncludes: {
    '/api/orders/[id]/receipt': ['./public/fonts/**/*', './messages/**/*'],
    '/api/orders/[id]/ticket': ['./public/fonts/**/*', './messages/**/*'],
  },
};

export default withNextIntl(nextConfig);