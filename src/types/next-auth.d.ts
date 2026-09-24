// ═══════════════════════════════════════════════════
// 🔐 توسيع أنواع Auth.js
// ═══════════════════════════════════════════════════
// Auth.js يعرف بشكل افتراضي أن session.user يحتوي على
// name, email, image — لكن لا يعرف id ولا role.
// هنا نُعلّم TypeScript أننا أضفنا هذين الحقلين.

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  // الجلسة التي يراها العميل
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  // كائن المستخدم الذي يُعاد من authorize()
  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  // محتوى الـ JWT token
  interface JWT {
    id: string;
    role: string;
  }
}