// ═══════════════════════════════════════════════════
// 🔌 Prisma Client مع Prisma Adapter for Neon
// ═══════════════════════════════════════════════════
// نستخدم Prisma Adapter for Neon بدلاً من المحرك الثنائي:
//   • يعمل على Vercel Serverless بدون ملفات .so.node
//   • أسرع عبر HTTP/WebSocket بدل TCP
//   • لا يحتاج ملف libquery_engine-rhel-openssl-3.0.x.so.node

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Adapter يستخدم DATABASE_URL (pooler) للاتصال بـ Neon عبر WebSocket
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}