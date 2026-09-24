// ═══════════════════════════════════════════════════
// 🔌 Prisma Client Singleton
// ═══════════════════════════════════════════════════
// الهدف: ضمان وجود نسخة واحدة فقط من PrismaClient في التطبيق
// ملاحظة: نحدد مسار قاعدة البيانات بشكل مطلق (Absolute Path) لتفادي
//          اختلاف تفسير المسار النسبي بين Prisma CLI و Next.js

import path from 'node:path'
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// بناء مسار مطلق لملف قاعدة البيانات في التطوير (SQLite)
// في الإنتاج (PostgreSQL)، لن نحتاج هذا السطر — سنستخدم DATABASE_URL مباشرة
const sqlitePath = path
  .join(process.cwd(), 'prisma', 'dev.db')
  .replace(/\\/g, '/') // Windows: نحوّل \ إلى / لصيغة URI

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: `file:${sqlitePath}`,
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}