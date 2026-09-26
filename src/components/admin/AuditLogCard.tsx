// ═══════════════════════════════════════════════════
// 📋 AuditLogCard — بطاقة سجل واحد
// ═══════════════════════════════════════════════════
// تعرض: الإجراء، severity، المستخدم، الكيان، والتغييرات.

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

const ACTION_META: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  CREATE: { icon: "🟢", label: "إنشاء", color: "text-green-700" },
  UPDATE: { icon: "🟡", label: "تعديل", color: "text-amber-700" },
  DELETE: { icon: "🔴", label: "حذف", color: "text-red-700" },
};

const SEVERITY_META: Record<string, { label: string; className: string }> = {
  info: {
    label: "عادي",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  warning: {
    label: "حساس",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  critical: {
    label: "خطير",
    className: "bg-red-50 text-red-800 border-red-200",
  },
};

const ENTITY_LABELS: Record<string, string> = {
  MenuItem: "طبق",
  Table: "طاولة",
  User: "موظف",
  Reservation: "حجز",
};

type Changes = {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
};

// ─── تنسيق التاريخ بالعربية ───
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// ─── تنسيق القيم ───
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "نعم" : "لا";
  if (typeof value === "string") return value;
  return String(value);
}

// ─── عرض التغييرات ───
function ChangesSummary({
  action,
  changes,
}: {
  action: string;
  changes: Changes;
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
          لا تغييرات مُلاحَظة
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
  const actionMeta = ACTION_META[log.action] ?? {
    icon: "⚪",
    label: log.action,
    color: "text-muted",
  };
  const severityMeta = SEVERITY_META[log.severity] ?? {
    label: log.severity,
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };
  const entityLabel = ENTITY_LABELS[log.entity] ?? log.entity;

  // Cast آمن لـ changes
  const changes = (log.changes ?? null) as Changes | null;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      {/* الترويسة */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-lg">{actionMeta.icon}</span>

        <span className={`text-sm font-bold ${actionMeta.color}`}>
          {actionMeta.label}
        </span>

        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${severityMeta.className}`}
        >
          {severityMeta.label}
        </span>

        <span className="text-sm">
          <span className="text-muted">{entityLabel}: </span>
          <strong className="text-foreground">{log.entityName}</strong>
        </span>

        <span className="text-xs text-muted mr-auto">
          {log.userName} · {formatDate(log.createdAt)}
        </span>
      </div>

      {/* التغييرات */}
      {changes && <ChangesSummary action={log.action} changes={changes} />}
    </div>
  );
}