"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

type Announcement = {
  id: string;
  title: string | null;
  message: string;
  type: string;
  createdAt: Date;
};

export function GlobalAnnouncements({ announcements }: { announcements: Announcement[] }) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // If no announcements, or all are dismissed, render nothing
  const activeAnnouncements = announcements.filter((a) => !dismissedIds.includes(a.id));
  if (activeAnnouncements.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleDismissAll = () => {
    setDismissedIds(announcements.map(a => a.id));
  };

  // UI mappings for different alert types
  const typeStyles: Record<string, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    INFO: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: <Info className="w-5 h-5 text-blue-600 shrink-0" /> },
    WARNING: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" /> },
    SUCCESS: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> },
    URGENT: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" /> },
  };

  // Limit to top 3 alerts to prevent the page from being pushed down
  const visibleAnnouncements = activeAnnouncements.slice(0, 3);

  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-sm font-bold text-gray-700">🔔 Active Alerts ({activeAnnouncements.length})</h3>
        <button 
          onClick={handleDismissAll}
          className="text-xs text-gray-500 hover:text-gray-800 underline"
        >
          Clear All
        </button>
      </div>

      <div className="max-h-55 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {visibleAnnouncements.map((announcement) => {
          const style = typeStyles[announcement.type] || typeStyles.INFO;

          return (
            <div
              key={announcement.id}
              className={`flex items-start gap-3 p-3 rounded-xl border ${style.bg} ${style.border} animate-in fade-in slide-in-from-top-2`}
            >
              {style.icon}
              <div className="flex-1">
                {announcement.title && (
                  <h4 className={`font-bold text-sm ${style.text}`}>{announcement.title}</h4>
                )}
                <p className={`text-sm ${style.text} opacity-90`}>{announcement.message}</p>
              </div>
              <button
                onClick={() => handleDismiss(announcement.id)}
                className={`p-1 rounded hover:bg-black/5 transition-colors ${style.text}`}
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          );
        })}
        
        {activeAnnouncements.length > 3 && (
          <div className="text-center pt-2">
            <span className="text-xs text-muted">
              + {activeAnnouncements.length - 3} more alerts hidden. Go to the Announcements page to view all.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}