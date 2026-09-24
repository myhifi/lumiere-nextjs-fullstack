import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lumière | مطعم Lumière",
  description: "مطعم Lumière — تجربة طعام استثنائية",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}