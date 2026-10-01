// ═══════════════════════════════════════════════════
// 🌐 Locale Helper — Pick the correct name for the locale
// ═══════════════════════════════════════════════════

/**
 * Returns the localized version of a name.
 * - Arabic locale: always uses `name` (the original Arabic name).
 * - Non-Arabic locale: uses `nameEn` if available, else falls back to `name`.
 */
export function getLocalizedName(
  name: string,
  nameEn: string | null | undefined,
  locale: string
): string {
  // Arabic locale: always use the Arabic name
  if (locale === "ar") return name;

  // Other locales: use English name if available, else Arabic
  return nameEn ?? name;
}