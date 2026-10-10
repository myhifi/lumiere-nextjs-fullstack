import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { getWhatsAppNumber } from "@/lib/services/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSettingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const t = await getTranslations("Admin.settings");
  const whatsappNumber = await getWhatsAppNumber();

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted text-sm lg:text-base">{t("subtitle")}</p>
      </div>

      <SettingsForm initialWhatsAppNumber={whatsappNumber} />
    </div>
  );
}