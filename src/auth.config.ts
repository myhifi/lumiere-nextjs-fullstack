// ═══════════════════════════════════════════════════
// 🔐 Auth.js Config — Edge-Safe
// ═══════════════════════════════════════════════════
// هذا الملف آمن للعمل على Edge Runtime (لا Prisma، لا bcrypt).
// يُستخدم من:
//   • proxy.ts (Edge)
//   • auth.ts (يوسّعه)
//
// ⚠️ لا تستورد هنا: prisma, bcrypt, node:*

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 يوماً بالثواني
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Providers تُضاف في auth.ts (لأنها تحتاج Prisma)
  providers: [],

  callbacks: {
    // ─── jwt callback ───
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },

    // ─── session callback ───
    async session({ session, token }) {
      const t = token as { id: string; role: string };
      session.user.id = t.id;
      session.user.role = t.role;
      return session;
    },

    // ─── authorized callback (يعمل على Edge) ───
    // يُنفَّذ في proxy لمنع الوصول لـ /admin بدون تسجيل
    authorized({ auth, request }) {
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isOnAdmin) {
        return !!auth; // true = اسمح، false = حوّل لـ /login
      }
      return true; // الصفحات العامة: دائماً اسمح
    },
  },
};