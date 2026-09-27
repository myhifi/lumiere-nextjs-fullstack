// ═══════════════════════════════════════════════════
// ⭐ StarRating — عرض التقييم بالنجوم (للقراءة فقط)
// ═══════════════════════════════════════════════════
// Server Component — لا تفاعل، صفر JavaScript.

type StarRatingProps = {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
};

const SIZES = {
  sm: { star: 14, gap: 1, text: "text-xs" },
  md: { star: 18, gap: 2, text: "text-sm" },
  lg: { star: 24, gap: 3, text: "text-base" },
} as const;

// ─── نجمة SVG (بلا مكتبات خارجية) ───
function Star({ size, filled }: { size: number; filled: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      className={filled ? "text-accent" : "text-border"}
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

export function StarRating({
  rating,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const config = SIZES[size];
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div
      className="inline-flex items-center gap-2"
      aria-label={`التقييم: ${clampedRating} من 5`}
    >
      <div className="inline-flex items-center" style={{ gap: config.gap }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={config.star}
            filled={star <= clampedRating}
          />
        ))}
      </div>

      {showValue && (
        <span className={`${config.text} text-muted font-medium`}>
          {clampedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}