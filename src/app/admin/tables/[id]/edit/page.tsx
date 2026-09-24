import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TableForm } from "@/components/admin/TableForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditTablePage({ params }: PageProps) {
  const { id } = await params;
  const table = await prisma.table.findUnique({ where: { id } });
  if (!table) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/tables"
          className="text-sm text-muted hover:text-accent transition-colors"
        >
          ← العودة إلى الطاولات
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-2">✎ تعديل: طاولة #{table.number}</h1>
      <p className="text-muted mb-8">عدّل بيانات الطاولة</p>
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