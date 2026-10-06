"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Form } from "@/components/ui/Form";

type Result =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string };

export function LoginForm() {
  const t = useTranslations("Login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setResult({ kind: "submitting" });

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!response || response.error) {
      setResult({
        kind: "error",
        message: t("errorInvalidCredentials"),
      });
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-8 shadow-sm"
    >
      <div className="space-y-5">
        <FormField label={t("emailLabel")} required>
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

        <FormField label={t("passwordLabel")} required>
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
        {result.kind === "submitting" ? t("submitting") : t("submitButton")}
      </button>
    </Form>
  );
}