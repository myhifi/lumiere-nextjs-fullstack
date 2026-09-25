import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  // 1. إخبار Next.js بعدم حزم مكتبات Prisma (لأنها تستخدم ملفات ثنائية)
  serverExternalPackages: ["@prisma/client", "prisma"],

  // 2. إجبار Next.js على نسخ ملف محرك Prisma إلى مجلد الإخراج
  outputFileTracingIncludes: {
    "/**/*": ["./src/generated/prisma/**/*"],
  },

  // 3. استخدام PrismaPlugin مع webpack
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

export default nextConfig;