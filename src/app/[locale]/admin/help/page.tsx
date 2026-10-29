import { getTranslations } from "next-intl/server";
import { HelpAccordion } from "@/components/admin/HelpAccordion";

export default async function HelpPage() {
  const t = await getTranslations("Help");

  const helpItems = [
    {
      id: "overview",
      title: t("sections.overview.title"),
      desc: t("sections.overview.desc"),
      examples: [t("sections.overview.ex1"), t("sections.overview.ex2"), t("sections.overview.ex3")],
    },
    {
      id: "orders",
      title: t("sections.orders.title"),
      desc: t("sections.orders.desc"),
      examples: [t("sections.orders.ex1"), t("sections.orders.ex2"), t("sections.orders.ex3")],
    },
    {
      id: "kds",
      title: t("sections.kds.title"),
      desc: t("sections.kds.desc"),
      examples: [t("sections.kds.ex1"), t("sections.kds.ex2"), t("sections.kds.ex3")],
    },
    {
      id: "announcements",
      title: t("sections.announcements.title"),
      desc: t("sections.announcements.desc"),
      examples: [t("sections.announcements.ex1"), t("sections.announcements.ex2"), t("sections.announcements.ex3")],
    },
    {
      id: "reservations",
      title: t("sections.reservations.title"),
      desc: t("sections.reservations.desc"),
      examples: [t("sections.reservations.ex1"), t("sections.reservations.ex2"), t("sections.reservations.ex3")],
    },
    {
      id: "analytics",
      title: t("sections.analytics.title"),
      desc: t("sections.analytics.desc"),
      examples: [t("sections.analytics.ex1"), t("sections.analytics.ex2"), t("sections.analytics.ex3")],
    },
    {
      id: "menu",
      title: t("sections.menu.title"),
      desc: t("sections.menu.desc"),
      examples: [t("sections.menu.ex1"), t("sections.menu.ex2"), t("sections.menu.ex3")],
    },
    {
      id: "reviews",
      title: t("sections.reviews.title"),
      desc: t("sections.reviews.desc"),
      examples: [t("sections.reviews.ex1"), t("sections.reviews.ex2"), t("sections.reviews.ex3")],
    },
    {
      id: "audit",
      title: t("sections.audit.title"),
      desc: t("sections.audit.desc"),
      examples: [t("sections.audit.ex1"), t("sections.audit.ex2"), t("sections.audit.ex3")],
    },
    {
      id: "staff",
      title: t("sections.staff.title"),
      desc: t("sections.staff.desc"),
      examples: [t("sections.staff.ex1"), t("sections.staff.ex2"), t("sections.staff.ex3")],
    },
    {
      id: "settings",
      title: t("sections.settings.title"),
      desc: t("sections.settings.desc"),
      examples: [t("sections.settings.ex1"), t("sections.settings.ex2"), t("sections.settings.ex3")],
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t("pageTitle")}</h1>
        <p className="text-muted text-sm lg:text-base">{t("pageSubtitle")}</p>
      </div>

      <HelpAccordion items={helpItems} />
    </div>
  );
}