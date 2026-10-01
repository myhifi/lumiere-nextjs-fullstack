// src/app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: {
    default: "Lumière | مطعم Lumière — تجربة طعام استثنائية",
    template: "%s | Lumière",
  },
  description:
    "مطعم Lumière — تجربة طعام استثنائية بلمسة عصرية. تصفح قائمتنا، احجز طاولتك، واستمتع بأشهى الأطباق الشرقية في أجواء أنيقة.",
};

export const viewport: Viewport = {
  themeColor: "#c9a961",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar")) {
    notFound();
  }

  // ⚡ إلزامي في next-intl v4
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className="h-full antialiased">
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}