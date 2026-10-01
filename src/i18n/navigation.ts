import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// نسخ خفيفة من روابط Next.js تدعم اللغة تلقائياً
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);