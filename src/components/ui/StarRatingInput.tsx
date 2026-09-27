"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════
// ⭐ StarRatingInput — اختيار التقييم بالنجوم
// ═══════════════════════════════════════════════════
// Client Component — يحتاج onClick + hover.

type StarRatingInputProps = {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
};

// ─── نجمة SVG ───
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

export function StarRatingInput({
  value,
  onChange,
  size = 32,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState<number>(0);

  // القيمة المعروضة: عند hover نُظهر الـ hover، وإلا الـ value
  const displayValue = hovered || value;

  return (
    <div
      className="inline-flex items-center gap-2"
      onMouseLeave={() => setHovered(0)}
      role="radiogroup"
      aria-label="اختر تقييمك"
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`${star} من 5 نجوم`}
          aria-checked={value === star}
          role="radio"
          className="transition-transform hover:scale-110 focus:outline-none focus:scale-110"
        >
          <Star size={size} filled={star <= displayValue} />
        </button>
      ))}

      {value > 0 && (
        <span className="text-sm text-muted mr-2">
          {value} من 5
        </span>
      )}
    </div>
  );
}