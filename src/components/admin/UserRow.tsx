"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteUser } from "@/actions/admin-users";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: Date | null;
};

type Props = {
  user: User;
  currentUserId: string;
};

export function UserRow({ user, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isSelf = user.id === currentUserId;

  function handleDelete() {
    if (!confirm(`حذف "${user.name}" نهائياً؟`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (!result.success) setError(result.error);
    });
  }

  return (
    <div
      className={`p-4 transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{user.name}</span>
            {isSelf && (
              <span className="text-xs bg-accent-light text-accent-dark px-2 py-0.5 rounded-full">
                أنت
              </span>
            )}
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                user.role === "ADMIN"
                  ? "bg-accent text-white"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {user.role === "ADMIN" ? "مدير" : "موظف"}
            </span>
          </div>
          <div className="text-xs text-muted mt-1" dir="ltr">
            {user.email}
          </div>
          {user.lastLoginAt && (
            <div className="text-xs text-muted mt-0.5">
              آخر دخول:{" "}
              {new Date(user.lastLoginAt).toLocaleDateString("ar-EG", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full border ${
            user.isActive
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {user.isActive ? "نشط" : "معطّل"}
        </span>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/users/${user.id}/edit`}
            className="text-xs px-3 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          >
            ✎ تعديل
          </Link>

          {!isSelf && (
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
      </div>

      {error && (
        <div className="mt-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
}