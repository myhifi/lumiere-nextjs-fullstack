"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";

type Result =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult({ kind: "submitting" });

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false, // نتعامل مع التحويل يدوياً
    });

    // signIn من next-auth/react يعيد undefined عند النجاح
    // ويعيد { error: "..." } عند الفشل
    if (!response || response.error) {
      setResult({
        kind: "error",
        message: "البريد الإلكتروني أو كلمة السر غير صحيحة",
      });
      return;
    }

    // نجاح — تحويل إلى callbackUrl
    router.push(callbackUrl);
    router.refresh(); // لتحديث Server Components بالجلسة الجديدة
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-8 shadow-sm"
    >
      <div className="space-y-5">
        <FormField label="البريد الإلكتروني" required>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@lumiere.com"
            dir="ltr"
            className={inputClasses}
          />
        </FormField>

        <FormField label="كلمة السر" required>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            dir="ltr"
            className={inputClasses}
          />
        </FormField>
      </div>

      {result.kind === "error" && (
        <div className="mt-5 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={result.kind === "submitting"}
        className="mt-6 w-full bg-accent hover:bg-accent-dark text-white font-medium py-3 px-8 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {result.kind === "submitting" ? "جاري التحقق..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}