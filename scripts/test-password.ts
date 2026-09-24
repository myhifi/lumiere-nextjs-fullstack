// ═══════════════════════════════════════════════════
// 🧪 اختبار دوال تشفير كلمة السر
// ═══════════════════════════════════════════════════

import {
  hashPassword,
  verifyPassword,
  BCRYPT_ROUNDS,
  MIN_PASSWORD_LENGTH,
} from "../src/lib/auth/password";

const line = "═".repeat(62);
console.log("\n🧪 اختبار password.ts\n" + line);

async function main() {
  // ─── 1. التشفير الأساسي ───
  console.log("\n📋 السيناريو 1: تشفير كلمة سر صحيحة");
  const password = "mySecret123";
  const start = Date.now();
  const hash = await hashPassword(password);
  const elapsed = Date.now() - start;

  console.log(`   كلمة السر:     "${password}"`);
  console.log(`   الـ Hash:       ${hash}`);
  console.log(`   الطول:         ${hash.length} حرفاً`);
  console.log(`   يستغرق:        ${elapsed}ms (${BCRYPT_ROUNDS} rounds)`);

  // ─── 2. تحقق ناجح ───
  console.log("\n📋 السيناريو 2: التحقق بكلمة سر صحيحة");
  const okMatch = await verifyPassword(password, hash);
  console.log(`   النتيجة:       ${okMatch ? "✅ مطابقة" : "❌ غير مطابقة"}`);

  // ─── 3. تحقق فاشل (كلمة سر خاطئة) ───
  console.log("\n📋 السيناريو 3: التحقق بكلمة سر خاطئة");
  const wrongMatch = await verifyPassword("wrongPassword", hash);
  console.log(`   النتيجة:       ${wrongMatch ? "❌ يجب أن تكون false!" : "✅ مرفوضة كما هو متوقع"}`);

  // ─── 4. Salt فريد ───
  console.log("\n📋 السيناريو 4: نفس كلمة السر تُنتج Hash مختلفاً (Salt)");
  const hash2 = await hashPassword(password);
  console.log(`   Hash الأول:    ${hash.slice(0, 30)}...`);
  console.log(`   Hash الثاني:   ${hash2.slice(0, 30)}...`);
  console.log(`   متطابقان؟     ${hash === hash2 ? "❌ خطأ أمني!" : "✅ مختلفان (Salt يعمل)"}`);

  // ─── 5. كلمة سر قصيرة جداً ───
  console.log("\n📋 السيناريو 5: رفض كلمة سر قصيرة");
  try {
    await hashPassword("short");
    console.log(`   ❌ يجب أن يرفض!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   ✅ مرفوضة: "${message}"`);
  }

  // ─── 6. Hash تالف ───
  console.log("\n📋 السيناريو 6: التحقق من Hash تالف");
  const badHashMatch = await verifyPassword(password, "not-a-valid-hash");
  console.log(`   النتيجة:       ${badHashMatch ? "❌ يجب أن تكون false!" : "✅ مرفوض بأمان"}`);

  console.log("\n" + line);
  console.log("✨ اكتمل الاختبار\n");
}

main().catch(console.error);