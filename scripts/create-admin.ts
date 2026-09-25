// ═══════════════════════════════════════════════════
// 👤 إنشاء حسابات المسؤولين (admin + demo)
// ═══════════════════════════════════════════════════
// • admin@lumiere.com — حساب الإنتاج (سرّي، لا يُنشر)
// • demo@lumiere.com  — حساب العرض (عام للـ Portfolio)
//
// استخدام upsert: آمن للتشغيل المتكرر
// الاستخدام: npm run db:admin

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

// ─── حساب الإنتاج (لا يُنشر أبداً) ───
const ADMIN_DATA = {
  email: "admin@lumiere.com",
  password: "Admin@Lumiere2026",
  name: "مدير Lumière",
  role: "ADMIN",
  isDemo: false,
} as const;

// ─── حساب العرض (يُنشر في README للـ Portfolio) ───
const DEMO_DATA = {
  email: "demo@lumiere.com",
  password: "Demo2026!",
  name: "Demo User",
  role: "ADMIN",
  isDemo: true,
} as const;

// ─── دالة مساعدة: إنشاء/تحديث مستخدم ───
async function upsertUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
  isDemo: boolean;
}) {
  if (data.password.length < 8) {
    throw new Error(`كلمة السر قصيرة جداً للحساب: ${data.email}`);
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.upsert({
    where: { email: data.email },
    update: {
      passwordHash,
      name: data.name,
      role: data.role,
      isActive: true,
    },
    create: {
      email: data.email,
      passwordHash,
      name: data.name,
      role: data.role,
      isActive: true,
    },
  });

  return user;
}

// ─── نقطة الدخول ───
async function main() {
  console.log("\n👤 إنشاء / تحديث الحسابات...\n");

  // 1. حساب الإنتاج
  const admin = await upsertUser(ADMIN_DATA);
  console.log("✅ حساب الإنتاج (admin):");
  console.log(`   ID:        ${admin.id}`);
  console.log(`   البريد:    ${admin.email}`);
  console.log(`   الاسم:     ${admin.name}`);
  console.log(`   الدور:     ${admin.role}`);
  console.log(`   كلمة السر: ${ADMIN_DATA.password}  ← احفظها في مكان آمن`);
  console.log(`   ⚠️  لا تُنشر هذه البيانات أبداً`);

  // 2. حساب العرض
  const demo = await upsertUser(DEMO_DATA);
  console.log("\n✅ حساب العرض (demo):");
  console.log(`   ID:        ${demo.id}`);
  console.log(`   البريد:    ${demo.email}`);
  console.log(`   الاسم:     ${demo.name}`);
  console.log(`   الدور:     ${demo.role}`);
  console.log(`   كلمة السر: ${DEMO_DATA.password}  ← عام للـ Portfolio`);
  console.log(`   ℹ️  يمكن نشره في README — تغييراته ستُعاد تعيينها`);

  console.log("\n✨ اكتمل الإعداد\n");
}

main()
  .catch((error) => {
    console.error("❌ خطأ:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });