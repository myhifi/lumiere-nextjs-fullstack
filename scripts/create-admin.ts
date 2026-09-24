// ═══════════════════════════════════════════════════
// 👤 إنشاء حساب المسؤول الأول
// ═══════════════════════════════════════════════════
// يُشغَّل عبر: npx tsx scripts/create-admin.ts
// يستخدم upsert: إن كان الحساب موجوداً، يُحدّثه. وإن لم يكن، يُنشئه.
// آمن للتشغيل المتكرر — لا يمسح أي بيانات.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

// ─── بيانات المسؤول الأول ───
// ⚠️ عدّل هذه القيم بكلمات سر قوية قبل النشر للإنتاج
const ADMIN_DATA = {
  email: "admin@lumiere.com",
  password: "Admin@Lumiere2026",
  name: "مدير Lumière",
  role: "ADMIN",
};

async function main() {
  console.log("\n👤 إنشاء / تحديث حساب المسؤول...\n");

  // 1. تحقق من طول كلمة السر (سترفض دالتنا إن كانت قصيرة)
  if (ADMIN_DATA.password.length < 8) {
    throw new Error("كلمة السر قصيرة جداً");
  }

  // 2. شفّر كلمة السر
  const passwordHash = await hashPassword(ADMIN_DATA.password);

  // 3. upsert — إنشاء أو تحديث
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_DATA.email },
    update: {
      passwordHash,
      name: ADMIN_DATA.name,
      role: ADMIN_DATA.role,
      isActive: true,
    },
    create: {
      email: ADMIN_DATA.email,
      passwordHash,
      name: ADMIN_DATA.name,
      role: ADMIN_DATA.role,
      isActive: true,
    },
  });

  console.log("✅ تم بنجاح:");
  console.log(`   ID:      ${admin.id}`);
  console.log(`   البريد:  ${admin.email}`);
  console.log(`   الاسم:   ${admin.name}`);
  console.log(`   الدور:   ${admin.role}`);
  console.log(`   كلمة السر: ${ADMIN_DATA.password}  ← احفظها في مكان آمن\n`);
}

main()
  .catch((error) => {
    console.error("❌ خطأ:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });