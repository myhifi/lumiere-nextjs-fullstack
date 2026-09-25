import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // لا حاجة لـ PrismaPlugin أو webpack بعد الآن
  // لأننا نستخدم Prisma Adapter for Neon
};

export default nextConfig;