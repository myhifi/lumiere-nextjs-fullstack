"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createAnnouncement } from "@/actions/admin-announcements";
import { inputClasses } from "@/components/ui/FormField";

export function AnnouncementForm() {
  const t = useTranslations("Admin.announcements");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createAnnouncement({
        title: title || undefined,
        message,
        type,
        isActive: true,
      });

      if (!result.success) {
        setError(result.error);
      } else {
        setTitle("");
        setMessage("");
        setType("INFO");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-bold mb-4">{t("newTitle")}</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">{t("labelTitle")}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("placeholderTitle")}
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("labelMessage")} *</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t("placeholderMessage")}
          required
          rows={3}
          className={inputClasses}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">{t("labelType")}</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClasses}
        >
          <option value="INFO">{t("types.INFO")}</option>
          <option value="WARNING">{t("types.WARNING")}</option>
          <option value="SUCCESS">{t("types.SUCCESS")}</option>
          <option value="URGENT">{t("types.URGENT")}</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {isPending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}