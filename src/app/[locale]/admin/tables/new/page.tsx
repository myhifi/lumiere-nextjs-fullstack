import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TableForm } from "@/components/admin/TableForm";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function NewTablePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.tableForm");

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/tables"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          {t("backToTables")}
        </Link>
      </div>
      <h1 className="text-2xl lg:text-3xl font-bold mb-2">
        {t("newTitle")}
      </h1>
      <p className="text-muted mb-8">{t("newSubtitle")}</p>
      <TableForm />
    </div>
  );
}