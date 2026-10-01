import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { getReviewsForAdmin, type ReviewStatus } from "@/lib/services/reviews";
import { Link } from "@/i18n/navigation";
import { ReviewRow } from "@/components/admin/ReviewRow";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminReviewsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  const { status } = await searchParams;
  const isAdmin = session?.user?.role === "ADMIN";
  const t = await getTranslations("Admin.reviews");

  const FILTERS = [
    { value: undefined, label: t("filterAll") },
    { value: "PENDING", label: t("filterPending") },
    { value: "APPROVED", label: t("filterApproved") },
    { value: "REJECTED", label: t("filterRejected") },
  ] as const;

  // التحقق من صحة الحالة
  const validStatuses: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  const statusFilter =
    status && validStatuses.includes(status as ReviewStatus)
      ? (status as ReviewStatus)
      : undefined;

  const reviews = await getReviewsForAdmin(statusFilter);

  return (
    <div className="p-6 lg:p-8">
      {/* ─── الترويسة ─── */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          {t("title")}
        </h1>
        <p className="text-muted text-sm lg:text-base">
          {t("count", { count: reviews.length })}
          {statusFilter ? t("countFiltered") : t("countTotal")}
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
              statusFilter ? t("emptyFiltered") : t("emptyAll")
            }
            description={t("emptyDescription")}
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