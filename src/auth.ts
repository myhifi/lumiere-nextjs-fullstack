// ═══════════════════════════════════════════════════
// 🔐 Auth.js v5 — Full Configuration (Node Runtime)
// ═══════════════════════════════════════════════════
// يوسّع authConfig (Edge-safe) بـ Credentials provider.
// يُستخدم من:
//   • app/api/auth/[...nextauth]/route.ts
//   • Server Components (auth())
//   • Server Actions (signIn/signOut)

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { authConfig } from "./auth.config";

// ─── مخطط التحقق من بيانات الدخول ───
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // يرث pages، session، callbacks

  providers: [
    Credentials({
      credentials: {
        email: { label: "البريد", type: "email" },
        password: { label: "كلمة السر", type: "password" },
      },

      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;
        if (!user.isActive) return null;

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            // نتجاهل الأخطاء — تسجيل الدخول نجح
          });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
});