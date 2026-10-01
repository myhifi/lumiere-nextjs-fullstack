import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { TableForm } from "@/components/admin/TableForm";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function EditTablePage({ params }: PageProps) {
  const { id, locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.tableForm");

  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) notFound();

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
        {t("editTitle", { number: table.number })}
      </h1>
      <p className="text-muted mb-8">{t("editSubtitle")}</p>
      <TableForm
        initialData={{
          id: table.id,
          number: table.number,
          capacity: table.capacity,
          location: table.location ?? "",
          isActive: table.isActive,
        }}
      />
    </div>
  );
}