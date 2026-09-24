// ═══════════════════════════════════════════════════
// 🔐 Password Hashing Utilities
// ═══════════════════════════════════════════════════
// يُستخدم في:
//   • إنشاء مستخدم (Seed، إضافة موظف من لوحة التحكم)
//   • تسجيل الدخول (Auth.js authorize())
//
// لا يخزّن كلمات السر أبداً كنص عادي.

import bcrypt from "bcryptjs";

// ─── ثابت: عدد جولات التشفير ───
// 10 = 2^10 = 1024 تكرار. المعيار الآمن في 2026.
export const BCRYPT_ROUNDS = 10;

// ─── ثابت: الحد الأدنى لطول كلمة السر ───
export const MIN_PASSWORD_LENGTH = 8;

/**
 * يُشفّر كلمة سر جديدة.
 *
 * @param plainPassword - كلمة السر الأصلية من المستخدم
 * @returns Hash قابل للتخزين في قاعدة البيانات
 * @throws خطأ إن كانت كلمة السر قصيرة جداً
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (plainPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `كلمة السر قصيرة جداً (الحد الأدنى ${MIN_PASSWORD_LENGTH} أحرف)`
    );
  }

  return bcrypt.hash(plainPassword, BCRYPT_ROUNDS);
}

/**
 * يتحقق من كلمة سر مقابل Hash مخزَّن.
 *
 * @param plainPassword - ما كتبه المستخدم
 * @param storedHash - ما هو مخزَّن في قاعدة البيانات
 * @returns true إن تطابقت
 * @returns false إن لم تتطابق أو كان الـ Hash تالفاً
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, storedHash);
  } catch {
    // لو كان الـ Hash تالفاً (ليس صيغة bcrypt صحيحة)، نعتبر التحقق فاشلاً
    return false;
  }
}