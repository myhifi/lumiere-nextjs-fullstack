import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'en', 'fr', 'de', 'es', 'it', 'zh'],
  defaultLocale: 'ar',
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

// اللغات التي تُكتب من اليمين لليسار (العربية فقط)
export const RTL_LOCALES: Locale[] = ['ar'];