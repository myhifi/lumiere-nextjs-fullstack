import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ReviewForm } from "@/components/review/ReviewForm";

type ReviewPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Review" });

  return {
    title: t("pageTitle"),
    description: t("metaDescription"),
    openGraph: {
      title: `${t("pageTitle")} | Lumière`,
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function ReviewPage() {
  const t = await getTranslations("Review");

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-accent text-sm font-medium tracking-widest">
          {t("pageKicker")}
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          {t("pageTitle")}
        </h1>
        <p className="text-muted max-w-xl mx-auto">{t("pageSubtitle")}</p>
      </div>

      <ReviewForm />
    </div>
  );
}