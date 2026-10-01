"use client";

import { useLocale, useTranslations } from "next-intl";

type AuditLogCardProps = {
  log: {
    id: string;
    userName: string;
    action: string;
    entity: string;
    entityName: string;
    severity: string;
    changes: unknown;
    createdAt: Date;
  };
};

type Changes = {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
};

// ─── أيقونة كل إجراء (لا تحتاج ترجمة) ───
const ACTION_ICON: Record<string, { icon: string; color: string }> = {
  CREATE: { icon: "🟢", color: "text-green-700" },
  UPDATE: { icon: "🟡", color: "text-amber-700" },
  DELETE: { icon: "🔴", color: "text-red-700" },
};

// ─── ألوان الخطورة (لا تحتاج ترجمة) ───
const SEVERITY_STYLES: Record<string, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-red-50 text-red-800 border-red-200",
};

// ─── تنسيق القيم ───
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "✓" : "✗";
  if (typeof value === "string") return value;
  return String(value);
}

// ─── عرض التغييرات ───
function ChangesSummary({
  action,
  changes,
  noChangesLabel,
}: {
  action: string;
  changes: Changes;
  noChangesLabel: string;
}) {
  // CREATE: نعرض after فقط
  if (action === "CREATE" && changes.after) {
    return (
      <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
        {Object.entries(changes.after).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="text-green-700 font-bold">+</span>
            <span className="text-muted" dir="ltr">
              {key}:
            </span>
            <span className="text-foreground">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    );
  }

  // DELETE: نعرض before فقط
  if (action === "DELETE" && changes.before) {
    return (
      <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
        {Object.entries(changes.before).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <span className="text-red-700 font-bold">−</span>
            <span className="text-muted" dir="ltr">
              {key}:
            </span>
            <span className="text-foreground line-through opacity-60">
              {formatValue(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // UPDATE: نقارن before و after
  if (action === "UPDATE" && changes.after) {
    const afterKeys = Object.keys(changes.after);
    const diffs = afterKeys.filter(
      (key) => changes.before?.[key] !== changes.after?.[key]
    );

    if (diffs.length === 0) {
      return (
        <div className="mt-3 pt-3 border-t border-border text-xs text-muted">
          {noChangesLabel}
        </div>
      );
    }

    return (
      <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
        {diffs.map((key) => (
          <div key={key} className="flex gap-2 items-center flex-wrap">
            <span className="text-amber-700 font-bold">↻</span>
            <span className="text-muted" dir="ltr">
              {key}:
            </span>
            {changes.before?.[key] !== undefined && (
              <span className="text-red-700 line-through">
                {formatValue(changes.before[key])}
              </span>
            )}
            <span className="text-muted">→</span>
            <span className="text-green-700 font-medium">
              {formatValue(changes.after![key])}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ═══════════════════════════════════════════════════
// 🎯 المكون الرئيسي
// ═══════════════════════════════════════════════════
export function AuditLogCard({ log }: AuditLogCardProps) {
  const t = useTranslations("Admin.auditLog");
  const locale = useLocale();

  // ─── ترجمة الإجراء ───
  const ACTION_LABEL_KEYS: Record<string, string> = {
    CREATE: "actionCreate",
    UPDATE: "actionUpdate",
    DELETE: "actionDelete",
  };

  // ─── ترجمة الخطورة ───
  const SEVERITY_LABEL_KEYS: Record<string, string> = {
    info: "severityInfo",
    warning: "severityWarning",
    critical: "severityCritical",
  };

  // ─── ترجمة الكيان ───
  const ENTITY_LABEL_KEYS: Record<string, string> = {
    MenuItem: "entityMenuItem",
    Table: "entityTable",
    User: "entityUser",
    Reservation: "entityReservation",
    Review: "entityReview",
  };

  const actionMeta = ACTION_ICON[log.action] ?? {
    icon: "⚪",
    color: "text-muted",
  };
  const actionKey = ACTION_LABEL_KEYS[log.action];
  const actionLabel = actionKey ? t(actionKey) : log.action;

  const severityStyle =
    SEVERITY_STYLES[log.severity] ??
    "bg-gray-50 text-gray-700 border-gray-200";
  const severityKey = SEVERITY_LABEL_KEYS[log.severity];
  const severityLabel = severityKey ? t(severityKey) : log.severity;

  const entityKey = ENTITY_LABEL_KEYS[log.entity];
  const entityLabel = entityKey ? t(entityKey) : log.entity;

  // ─── تنسيق التاريخ حسب اللغة ───
  const dateLocale = locale === "ar" ? "ar-EG" : locale;
  const formattedDate = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(log.createdAt));

  const changes = (log.changes ?? null) as Changes | null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* الترويسة */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-lg">{actionMeta.icon}</span>

        <span className={`text-sm font-bold ${actionMeta.color}`}>
          {actionLabel}
        </span>

        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${severityStyle}`}
        >
          {severityLabel}
        </span>

        <span className="text-sm">
          <span className="text-muted">{entityLabel}: </span>
          <strong className="text-foreground">{log.entityName}</strong>
        </span>

        <span className="text-xs text-muted mr-auto">
          {log.userName} · {formattedDate}
        </span>
      </div>

      {/* التغييرات */}
      {changes && (
        <ChangesSummary
          action={log.action}
          changes={changes}
          noChangesLabel={t("noChanges")}
        />
      )}
    </div>
  );
}