import type { Metadata, Viewport } from "next";
import "./globals.css";

// ─── الموقع الأساسي (يُستخدم لروابط OG المطلقة) ───
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://lumiere-nextjs-fullstack.vercel.app";

// ═══════════════════════════════════════════════════
// 🌐 Metadata الشاملة — تُطبَّق على كل الصفحات
// ═══════════════════════════════════════════════════
export const metadata: Metadata = {
  // يُستخدم لبناء روابط OG و Twitter المطلقة تلقائياً
  metadataBase: new URL(SITE_URL),

  // العنوان: "الرئيسية" في الصفحة الرئيسية، "قائمة | Lumière" في غيرها
  title: {
    default: "Lumière | مطعم Lumière — تجربة طعام استثنائية",
    template: "%s | Lumière",
  },

  description:
    "مطعم Lumière — تجربة طعام استثنائية بلمسة عصرية. تصفح قائمتنا، احجز طاولتك، واستمتع بأشهى الأطباق الشرقية في أجواء أنيقة.",

  keywords: [
    "مطعم",
    "Lumière",
    "مطعم راقي",
    "حجز طاولة",
    "أطباق شرقية",
    "مقبلات",
    "أطباق رئيسية",
    "حلويات",
    "restaurant",
    "reservation",
    "fine dining",
  ],

  authors: [{ name: "Lumière" }],
  creator: "Lumière",

  // ─── بطاقة المشاركة على وسائل التواصل ───
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: SITE_URL,
    siteName: "Lumière",
    title: "Lumière | مطعم Lumière",
    description: "تجربة طعام استثنائية بلمسة عصرية — احجز طاولتك الآن.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lumière | مطعم Lumière",
    description: "تجربة طعام استثنائية بلمسة عصرية — احجز طاولتك الآن.",
  },

  // ─── توجيهات محركات البحث ───
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

// ═══════════════════════════════════════════════════
// 📱 Viewport — يُطبَّق على متصفح الموبايل
// ═══════════════════════════════════════════════════
export const viewport: Viewport = {
  themeColor: "#c9a961", // لون Lumière الذهبي في شريط المتصفح
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ═══════════════════════════════════════════════════
// 🏗️ Root Layout
// ═══════════════════════════════════════════════════
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}