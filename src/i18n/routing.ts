import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // اللغات المدعومة (5 لغات)
  locales: ['ar', 'en', 'fr', 'de', 'es'],

  // اللغة الافتراضية
  defaultLocale: 'ar',

  // إظهار اللغة في الرابط دائماً
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

// اللغات التي تُكتب من اليمين لليسار (العربية فقط)
export const RTL_LOCALES: Locale[] = ['ar'];