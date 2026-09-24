// ═══════════════════════════════════════════════════
// 🔐 Auth.js Route Handler
// ═══════════════════════════════════════════════════
// هذا الملف يُفعّل كل مسارات Auth.js تحت /api/auth/*
// لا يُضاف منطق هنا — كل المنطق في src/auth.ts

import { handlers } from "@/auth";

export const { GET, POST } = handlers;