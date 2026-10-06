import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

// ═══════════════════════════════════════════════════
// 🌐 Dynamic metadata per locale
// ═══════════════════════════════════════════════════
export async function generateMetadata({
  params,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    robots: {
      // Keep login page out of search engines
      index: false,
      follow: false,
    },
  };
}

// ═══════════════════════════════════════════════════
// 🔐 Login Page
// ═══════════════════════════════════════════════════
export default async function LoginPage() {
  // Redirect already-authenticated users straight to the dashboard
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  const t = await getTranslations("Login");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent mb-2">Lumière</h1>
          <p className="text-muted text-sm">{t("subtitle")}</p>
        </div>

        <LoginForm />

        <p className="text-center text-xs text-muted mt-6">
          {t("staffOnly")}
        </p>
      </div>
    </div>
  );
}