import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { GlobalAnnouncements } from "@/components/admin/GlobalAnnouncements";
import { prisma } from "@/lib/prisma";

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

  // Fetch active, non-expired announcements
  const activeAnnouncements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      user={{
        name: session.user.name ?? "User",
        role: session.user.role,
      }}
      isDemoUser={isDemoUser}
    >
    <GlobalAnnouncements announcements={activeAnnouncements} />
      {children}
    </AdminShell>
  );
}