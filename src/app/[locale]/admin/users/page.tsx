import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Link } from "@/i18n/navigation";
import { UserRow } from "@/components/admin/UserRow";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin");

  const currentUserId = session?.user?.id;
  const t = await getTranslations("Admin.users");

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
    },
  });

  const activeAdmins = users.filter(
    (u) => u.role === "ADMIN" && u.isActive
  ).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            {t("title")}
          </h1>
          <p className="text-muted text-sm lg:text-base">
            {t("summary", { users: users.length, admins: activeAdmins })}
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="bg-accent hover:bg-accent-dark text-white font-medium px-6 py-3 rounded-full transition-colors text-sm lg:text-base"
        >
          {t("newItem")}
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {users.length === 0 ? (
          <EmptyState
            icon="👥"
            title={t("emptyAll")}
            description={t("emptyDescription")}
            action={
              <Link
                href="/admin/users/new"
                className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
              >
                {t("addNew")}
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId ?? ""}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}