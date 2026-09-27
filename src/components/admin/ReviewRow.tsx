"use client";

import { useState, useTransition } from "react";
import { StarRating } from "@/components/ui/StarRating";
import {
  updateReviewStatus,
  deleteReview,
} from "@/actions/reviews";

// ═══════════════════════════════════════════════════
// ⭐ ReviewRow — صف واحد في جدول الإشراف
// ═══════════════════════════════════════════════════

type Review = {
  id: string;
  guestName: string;
  guestEmail: string | null;
  rating: number;
  comment: string;
  status: string;
  createdAt: Date;
};

type Props = {
  review: Review;
  isAdmin: boolean;
};

// ─── شارات الحالة ───
const STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "قيد المراجعة",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  APPROVED: {
    label: "معتمد",
    className: "bg-green-50 text-green-800 border-green-200",
  },
  REJECTED: {
    label: "مرفوض",
    className: "bg-red-50 text-red-800 border-red-200",
  },
};

// ─── تنسيق التاريخ ───
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function ReviewRow({ review, isAdmin }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const statusMeta = STATUS_META[review.status] ?? {
    label: review.status,
    className: "bg-gray-50 text-gray-800 border-gray-200",
  };

  function handleStatus(newStatus: "APPROVED" | "REJECTED") {
    setError(null);
    startTransition(async () => {
      const result = await updateReviewStatus(review.id, newStatus);
      if (!result.success) setError(result.error);
    });
  }

  function handleDelete() {
    if (!confirm(`حذف تقييم "${review.guestName}" نهائياً؟`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(review.id);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div
      className={`p-4 transition-opacity ${
        isPending ? "opacity-50" : "opacity-100"
      }`}
    >
      {/* ─── الترويسة: الاسم + التاريخ + النجوم + الحالة ─── */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <span className="font-medium">{review.guestName}</span>

        {review.guestEmail && (
          <span className="text-xs text-muted" dir="ltr">
            {review.guestEmail}
          </span>
        )}

        <span className="text-xs text-muted mr-auto">
          {formatDate(review.createdAt)}
        </span>

        <span
          className={`text-xs px-2.5 py-0.5 rounded-full border ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      {/* ─── النجوم ─── */}
      <div className="mb-3">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* ─── التعليق ─── */}
      <p className="text-sm text-foreground leading-relaxed bg-background/50 rounded-lg p-3">
        {review.comment}
      </p>

      {/* ─── الأزرار ─── */}
      <div className="flex flex-wrap gap-2 mt-3">
        {review.status !== "APPROVED" && (
          <button
            type="button"
            onClick={() => handleStatus("APPROVED")}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-green-600 text-green-700 hover:bg-green-600 hover:text-white transition-colors disabled:opacity-40"
          >
            ✓ اعتماد
          </button>
        )}

        {review.status !== "REJECTED" && (
          <button
            type="button"
            onClick={() => handleStatus("REJECTED")}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white transition-colors disabled:opacity-40"
          >
            ✗ رفض
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs px-3 py-1.5 rounded-full border border-red-500 text-red-700 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-40"
          >
            🗑 حذف
          </button>
        )}
      </div>

      {/* ─── خطأ ─── */}
      {error && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}