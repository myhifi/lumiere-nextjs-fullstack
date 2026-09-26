// ═══════════════════════════════════════════════════
// 📋 Audit Log Service — تسجيل موحّد لإجراءات الموظفين
// ═══════════════════════════════════════════════════
// دالة واحدة تُستدعى من كل Server Action.
//
// مبادئ:
//   1. لا ترمي استثناءً أبداً — فشل السجل لا يُفشل الإجراء.
//   2. تُسجّل الأخطاء في console.error للتشخيص.
//   3. تُعيد void — لا يستخدمها المتصل.

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ─── الأنواع ───
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type AuditEntity = "MenuItem" | "Table" | "User" | "Reservation";
export type AuditSeverity = "info" | "warning" | "critical";

export type LogActionParams = {
  // ─── من فعل الإجراء؟ ───
  userId?: string | null;
  userName: string;

  // ─── ماذا حدث؟ ───
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  entityName: string;

  // ─── التفاصيل ───
  severity?: AuditSeverity;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
};

/**
 * يُسجّل إجراءً في `audit_logs`.
 *
 * @example
 * await logAction({
 *   userId: user.id,
 *   userName: user.name,
 *   action: "UPDATE",
 *   entity: "MenuItem",
 *   entityId: item.id,
 *   entityName: item.name,
 *   severity: "warning",
 *   changes: {
 *     before: { price: 180 },
 *     after:  { price: 150 },
 *   },
 * });
 */
export async function logAction(params: LogActionParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        entityName: params.entityName,
        severity: params.severity ?? "info",
        changes: params.changes
          ? (params.changes as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });
  } catch (error) {
    // ⚠️ لا نرمي — فشل السجل ليس خطأً حرجاً.
    console.error("[audit] Failed to log action:", error);
    console.error("[audit] Params:", JSON.stringify(params, null, 2));
  }
}