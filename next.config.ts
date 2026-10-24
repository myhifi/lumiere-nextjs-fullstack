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
  // 1. Mark pdfkit as an external package so its internal imports work
  serverExternalPackages: ["pdfkit"],

  // 2. Tell Vercel to explicitly bundle pdfkit's standard fonts and our custom fonts
  outputFileTracingIncludes: {
    '/api/orders/[id]/receipt': [
      './public/fonts/**/*', 
      './messages/**/*',
      './node_modules/pdfkit/js/data/*.afm',
      './node_modules/pdfkit/js/standard-fonts/*.cjs'
    ],
    '/api/orders/[id]/ticket': [
      './public/fonts/**/*', 
      './messages/**/*',
      './node_modules/pdfkit/js/data/*.afm',
      './node_modules/pdfkit/js/standard-fonts/*.cjs'
    ],
  },
};

export default withNextIntl(nextConfig);