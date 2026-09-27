import { StarRating } from "@/components/ui/StarRating";
import {
  getApprovedReviews,
  getAverageRating,
} from "@/lib/services/reviews";

// ═══════════════════════════════════════════════════
// ⭐ ReviewsSection — قسم التقييمات في الصفحة الرئيسية
// ═══════════════════════════════════════════════════
// Server Component — يجلب مباشرة من Prisma.

// ─── تنسيق التاريخ ───
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function ReviewsSection() {
  // ─── جلب البيانات بالتوازي ───
  const [reviews, stats] = await Promise.all([
    getApprovedReviews(6),
    getAverageRating(),
  ]);

  // ⚠️ لا نُظهر القسم إن لم توجد تقييمات معتمدة
  if (reviews.length === 0) return null;

  return (
    <section className="bg-accent-light/30 py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* ─── الترويسة ─── */}
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-medium tracking-widest">
            TESTIMONIALS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
            ماذا يقول عملاؤنا
          </h2>

          {/* ─── المتوسط العام ─── */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-4xl font-bold text-accent-dark">
              {stats.average.toFixed(1)}
            </span>
            <div className="text-right">
              <StarRating rating={stats.average} size="md" />
              <p className="text-xs text-muted mt-1">
                من {stats.count} تقييم
              </p>
            </div>
          </div>
        </div>

        {/* ─── شبكة التقييمات ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col"
            >
              {/* ─── النجوم ─── */}
              <div className="mb-4">
                <StarRating rating={review.rating} size="sm" />
              </div>

              {/* ─── التعليق ─── */}
              <p className="text-sm text-foreground leading-relaxed flex-1 mb-4 line-clamp-6">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* ─── الاسم + التاريخ ─── */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                <span className="font-medium text-sm">
                  {review.guestName}
                </span>
                <span className="text-xs text-muted">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}