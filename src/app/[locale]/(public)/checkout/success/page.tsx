// src/app/[locale]/(public)/checkout/success/page.tsx
import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ params, searchParams }: PageProps) {
  await params;
  const { session_id } = await searchParams;
  const t = await getTranslations("CheckoutSuccess");

  if (!session_id) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">{t("noSession")}</h1>
        <Link href="/menu" className="text-accent hover:underline">
          {t("backToMenu")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <ClearCartOnMount />

      <div className="flex justify-center mb-6 text-green-500">
        <CheckCircle2 className="w-24 h-24" />
      </div>
      
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-muted mb-8">{t("message")}</p>

      <Link
        href="/menu"
        className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
      >
        {t("backToMenu")}
      </Link>
    </div>
  );
}