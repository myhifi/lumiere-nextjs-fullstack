"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LOCAL_IMAGES } from "@/lib/constants/local-images.generated";
import { inputClasses } from "@/components/ui/FormField";

// ═══════════════════════════════════════════════════
// 🖼️ ImagePicker
// ═══════════════════════════════════════════════════
// Lets the admin choose between:
//   • a local image from public/images/ (dropdown)
//   • a custom external URL (text input)
// Both modes write the same string into the DB field.
// Mode is auto-detected from the current value so that
// loading an existing record opens the right view.

type Mode = "local" | "url";

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

function detectMode(value: string): Mode {
  return value.startsWith("/images/") ? "local" : "url";
}

function basename(path: string): string {
  const idx = path.lastIndexOf("/");
  return idx === -1 ? path : path.slice(idx + 1);
}

export function ImagePicker({ value, onChange, error }: Props) {
  const t = useTranslations("Admin.menuForm");
  const [mode, setMode] = useState<Mode>(() => detectMode(value));

  function handleModeChange(newMode: Mode) {
    if (newMode === mode) return;
    setMode(newMode);
    onChange(""); // clear value when switching modes
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {t("imageLabel")}
      </label>

      {/* ─── Mode toggle ─── */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleModeChange("local")}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            mode === "local"
              ? "bg-accent text-white border-accent"
              : "bg-card border-border hover:border-accent hover:text-accent"
          }`}
        >
          🖼️ {t("imageModeLocal")}
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("url")}
          className={`text-xs px-4 py-2 rounded-full border transition-colors ${
            mode === "url"
              ? "bg-accent text-white border-accent"
              : "bg-card border-border hover:border-accent hover:text-accent"
          }`}
        >
          🔗 {t("imageModeUrl")}
        </button>
      </div>

      {/* ─── Input for current mode ─── */}
      {mode === "local" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">{t("imageNone")}</option>
          {LOCAL_IMAGES.map((path) => (
            <option key={path} value={path}>
              {basename(path)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("imageUrlPlaceholder")}
          dir="ltr"
          className={inputClasses}
        />
      )}

      {/* ─── Preview ─── */}
      {value && (
        <div className="mt-3">
          <p className="text-xs text-muted mb-2">{t("imagePreview")}</p>
          <div className="relative w-32 h-32 rounded-lg border border-border overflow-hidden bg-accent-light">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0.2";
              }}
            />
          </div>
        </div>
      )}

      {/* ─── Error ─── */}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}