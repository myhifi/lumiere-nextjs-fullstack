import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

// ═══════════════════════════════════════════════════
// 🌐 Dynamic metadata per locale
// ═══════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: `${t("title")} | Lumière`,
      description: t("description"),
      type: "website",
    },
  };
}

// ═══════════════════════════════════════════════════
// 📖 About Page — Story, Chef, Values, CTA
// ═══════════════════════════════════════════════════
export default async function AboutPage() {
  const t = await getTranslations("About");

  const chefPhoto =
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=900&h=1100&fit=crop&q=80";
  const interiorPhoto =
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop&q=80";

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-4 py-20 text-center bg-linear-to-b from-accent-light/40 to-transparent">
        <div className="max-w-3xl">
          <span className="text-accent text-sm font-medium tracking-[0.3em] uppercase">
            {t("Hero.kicker")}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6 tracking-tight">
            {t("Hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            {t("Hero.subtitle")}
          </p>
        </div>
      </section>

      {/* ═══ OUR STORY ═══ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <span className="text-accent text-sm font-medium tracking-widest">
            {t("Story.kicker")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-6">
            {t("Story.title")}
          </h2>
        </div>

        <div className="space-y-5 text-base md:text-lg leading-relaxed text-foreground/85">
          <p>{t("Story.paragraph1")}</p>
          <p>{t("Story.paragraph2")}</p>
          <p>{t("Story.paragraph3")}</p>
        </div>
      </section>

      {/* ═══ MEET THE CHEF ═══ */}
      <section className="bg-accent-light/30 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-medium tracking-widest">
              {t("Chef.kicker")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              {t("Chef.title")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            {/* Chef Photo */}
            <div className="relative aspect-4/5 bg-accent-light rounded-3xl overflow-hidden max-w-md mx-auto w-full">
              <div className="absolute inset-0 z-0 shimmer" aria-hidden="true" />
              <Image
                src={chefPhoto}
                alt={t("Chef.chefName")}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover z-10 animate-[fadeIn_0.4s_ease-out]"
                priority
              />
            </div>

            {/* Chef Bio */}
            <div className="flex flex-col">
              <h3 className="text-2xl md:text-3xl font-bold mb-1">
                {t("Chef.chefName")}
              </h3>
              <p className="text-accent-dark text-sm font-medium tracking-wider uppercase mb-6">
                {t("Chef.chefRole")}
              </p>
              <p className="text-foreground/85 leading-relaxed mb-4">
                {t("Chef.bio1")}
              </p>
              <p className="text-muted italic leading-relaxed">
                {t("Chef.bio2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-medium tracking-widest">
            {t("Values.kicker")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            {t("Values.title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValueCard
            icon="✦"
            title={t("Values.qualityTitle")}
            body={t("Values.qualityBody")}
          />
          <ValueCard
            icon="❖"
            title={t("Values.authenticityTitle")}
            body={t("Values.authenticityBody")}
          />
          <ValueCard
            icon="❤"
            title={t("Values.hospitalityTitle")}
            body={t("Values.hospitalityBody")}
          />
        </div>
      </section>

      {/* ═══ INTERIOR PHOTO ═══ */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="relative aspect-video rounded-3xl overflow-hidden">
          <div className="absolute inset-0 z-0 shimmer" aria-hidden="true" />
          <Image
            src={interiorPhoto}
            alt={t("Hero.title")}
            fill
            sizes="100vw"
            className="object-cover z-10 animate-[fadeIn_0.4s_ease-out]"
          />
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="bg-accent-light/50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("CTA.title")}
          </h2>
          <p className="text-muted mb-8">{t("CTA.subtitle")}</p>
          <Link
            href="/reserve"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-10 py-4 rounded-full transition-colors"
          >
            {t("CTA.button")}
          </Link>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════
// 💎 ValueCard — small reusable component
// ═══════════════════════════════════════════════════
function ValueCard({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-8 text-center">
      <div className="text-3xl text-accent mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted leading-relaxed text-sm">{body}</p>
    </div>
  );
}