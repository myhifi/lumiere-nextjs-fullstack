import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReservationForm } from "@/components/reservation/ReservationForm";

type ReservePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ReservePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Reserve" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    openGraph: {
      title: `${t("title")} | Lumière`,
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function ReservePage() {
  const t = await getTranslations("Reserve");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-accent text-sm font-medium tracking-widest">
          {t("kicker")}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          {t("title")}
        </h1>
        <p className="text-muted max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      <ReservationForm />
    </div>
  );
}