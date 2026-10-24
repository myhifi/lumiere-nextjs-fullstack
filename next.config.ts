import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // 1. Prevent Webpack from bundling pdfkit and react-pdf, let Node.js handle them natively
  serverExternalPackages: ["pdfkit", "@react-pdf/renderer"],

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add Prisma plugin
      config.plugins = [...config.plugins, new PrismaPlugin()];
      
      // 2. Prevent Webpack from trying to resolve browser/native dependencies
      config.externals = [...(config.externals || []), "canvas", "jsdom"];
    }
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },

  // 3. Force Vercel File Tracer to include the entire pdfkit/js folder (including the hidden 'chunks' folder)
  outputFileTracingIncludes: {
    "/api/orders/[id]/receipt": [
      "./node_modules/pdfkit/js/**/*",
      "./public/fonts/**/*",
      "./messages/**/*",
    ],
    "/api/orders/[id]/ticket": [
      "./node_modules/pdfkit/js/**/*",
      "./public/fonts/**/*",
      "./messages/**/*",
    ],
  },
};

export default withNextIntl(nextConfig);