"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleAnnouncement, deleteAnnouncement } from "@/actions/admin-announcements";

type Announcement = {
  id: string;
  title: string | null;
  message: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  createdBy: { name: string };
  source: string;
};

export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  const t = useTranslations("Admin.announcements");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Type badge colors
  const typeColors: Record<string, string> = {
    INFO: "bg-blue-50 text-blue-700 border-blue-200",
    WARNING: "bg-amber-50 text-amber-700 border-amber-200",
    SUCCESS: "bg-green-50 text-green-700 border-green-200",
    URGENT: "bg-red-50 text-red-700 border-red-200",
  };

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleAnnouncement(announcement.id, !announcement.isActive);
      if (!result.success) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(t("deleteConfirm"))) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAnnouncement(announcement.id);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div className={`p-4 border-b border-border last:border-0 flex flex-wrap items-start gap-4 ${isPending ? "opacity-50" : ""}`}>
      
      {/* Content */}
      <div className="flex-1 min-w-50">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[announcement.type] || typeColors.INFO}`}>
            {t(`types.${announcement.type}`)}
          </span>
          <span className={`text-xs font-medium ${announcement.isActive ? "text-green-600" : "text-gray-400"}`}>
            {announcement.isActive ? t("active") : t("inactive")}
          </span>
          {announcement.source === "SYSTEM" && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200 font-semibold uppercase tracking-wider">
              Auto
            </span>
          )}
        </div>
        {announcement.title && <h3 className="font-bold text-sm">{announcement.title}</h3>}
        <p className="text-sm text-muted mt-1">{announcement.message}</p>
        <p className="text-xs text-muted mt-2">
          By: <span className="font-medium text-gray-700">{announcement.createdBy.name}</span> • {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(announcement.createdAt))}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
        >
          {announcement.isActive ? t("disable") : t("enable")}
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-700 hover:bg-red-500 hover:text-white transition-colors"
        >
          {t("delete")}
        </button>
      </div>

      {error && <p className="w-full text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}