"use client";

// ═══════════════════════════════════════════════════
// ⚠️ Banner يظهر لحساب العرض فقط
// ═══════════════════════════════════════════════════
// يُخبر المستخدم أن تغييراته مؤقتة

export function DemoBanner() {
  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3 text-sm text-yellow-900 flex items-center gap-3">
      <span className="text-lg">⚠️</span>
      <div className="flex-1">
        <strong className="font-bold">Demo Mode</strong> — أنت تستعرض حساباً تجريبياً.{" "}
        <span className="text-yellow-700">
          جميع التغييرات (إضافة، تعديل، حذف) ستُعاد تعيينها تلقائياً كل 6 ساعات للحفاظ على تجربة العرض.
        </span>
      </div>
    </div>
  );
}