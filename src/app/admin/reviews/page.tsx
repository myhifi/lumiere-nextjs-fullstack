import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { getReviewsForAdmin, type ReviewStatus } from "@/lib/services/reviews";
import { ReviewRow } from "@/components/admin/ReviewRow";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "إدارة التقييمات",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

// ─── فلاتر الحالة ───
const FILTERS = [
  { value: undefined, label: "الكل" },
  { value: "PENDING", label: "قيد المراجعة" },
  { value: "APPROVED", label: "معتمد" },
  { value: "REJECTED", label: "مرفوض" },
] as const;

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const session = await auth();
  const { status } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";

  // التحقق من صحة الحالة
  const validStatuses: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  const statusFilter =
    status && validStatuses.includes(status as ReviewStatus)
      ? (status as ReviewStatus)
      : undefined;

  const reviews = await getReviewsForAdmin(statusFilter);

  return (
    <div className="p-8">
      {/* ─── الترويسة ─── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">⭐ إدارة التقييمات</h1>
        <p className="text-muted">
          {reviews.length} تقييم
          {statusFilter ? " بهذه الحالة" : " إجمالاً"}
        </p>
      </div>

      {/* ─── فلاتر ─── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          const href = f.value
            ? `/admin/reviews?status=${f.value}`
            : "/admin/reviews";
          return (
            <Link
              key={f.label}
              href={href}
              className={`text-sm px-4 py-2 rounded-full border transition-colors ${
                isActive
                  ? "bg-accent text-white border-accent"
                  : "bg-card border-border hover:border-accent hover:text-accent"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* ─── القائمة ─── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {reviews.length === 0 ? (
          <EmptyState
            icon="⭐"
            title={
              statusFilter
                ? "لا توجد تقييمات بهذه الحالة"
                : "لا توجد تقييمات بعد"
            }
            description="ستظهر التقييمات الجديدة هنا فور وصولها."
          />
        ) : (
          <div className="divide-y divide-border">
            {reviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}