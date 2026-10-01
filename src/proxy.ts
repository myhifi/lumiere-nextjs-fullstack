import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {auth} from '@/auth';

// إنشاء middleware الخاص بـ next-intl
const intlMiddleware = createMiddleware(routing);

// تصدير proxy الذي يجمع بين next-intl و Auth.js
export default auth((req) => {
  // تشغيل next-intl أولاً لتحديد اللغة
  return intlMiddleware(req);
});

export const config = {
  // استثناء مسارات API والملفات الثابتة
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};