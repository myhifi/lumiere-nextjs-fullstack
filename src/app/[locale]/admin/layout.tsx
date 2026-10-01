import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/admin`);
  }

  const isDemoUser = session.user.email === "demo@lumiere.com";

  return (
    <AdminShell
      user={{
        name: session.user.name ?? "User",
        role: session.user.role,
      }}
      isDemoUser={isDemoUser}
    >
      {children}
    </AdminShell>
  );
}