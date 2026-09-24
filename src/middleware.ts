// ═══════════════════════════════════════════════════
// 🛡️ Middleware — حماية المسارات (Edge Runtime)
// ═══════════════════════════════════════════════════
// ⚠️ مهم: نستخدم NextAuth(authConfig) — وليس auth من auth.ts
// لأن auth.ts يستورد Prisma (غير مدعوم على Edge).

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";   // ← من auth.config وليس @/auth

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};