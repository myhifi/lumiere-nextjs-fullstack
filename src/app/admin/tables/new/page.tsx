import Link from "next/link";
import { TableForm } from "@/components/admin/TableForm";

export default function NewTablePage() {
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
      <h1 className="text-3xl font-bold mb-2">🪑 طاولة جديدة</h1>
      <p className="text-muted mb-8">أضف طاولة جديدة إلى المطعم</p>
      <TableForm />
    </div>
  );
}