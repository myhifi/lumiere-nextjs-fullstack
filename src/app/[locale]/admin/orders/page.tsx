// src/app/[locale]/admin/orders/page.tsx
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { OrderRow } from "@/components/admin/OrderRow";
import { EmptyState } from "@/components/ui/EmptyState";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrdersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Admin.orders");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { menuItem: { select: { name: true, nameEn: true } } },
      },
    },
  });

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted text-sm lg:text-base">
          {t("count", { count: orders.length })}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title={t("emptyAll")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}