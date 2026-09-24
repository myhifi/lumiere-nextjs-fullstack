// ═══════════════════════════════════════════════════
// 🔌 Prisma Client Singleton
// ═══════════════════════════════════════════════════
// الهدف: نسخة واحدة من PrismaClient لكل التطبيق
// الفائدة: تجنّب استنزاف اتصالات قاعدة البيانات
//
// ملاحظة: في PostgreSQL (عبر Neon)، نستخدم DATABASE_URL مباشرة
// من .env — لا حاجة لحساب مسار مطلق كما كنا مع SQLite.

import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}