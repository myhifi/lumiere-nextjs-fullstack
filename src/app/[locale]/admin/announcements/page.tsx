import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";
import { AnnouncementRow } from "@/components/admin/AnnouncementRow";
import { SystemRuleForm } from "@/components/admin/SystemRuleForm";
import { SystemRuleRow } from "@/components/admin/SystemRuleRow";

import { runSystemAlertEngine } from "@/lib/services/system-alerts";

// Helper to seed default rules if they don't exist
async function seedDefaultRules() {
  const count = await prisma.systemRule.count();
  if (count > 0) return;

  await prisma.systemRule.createMany({
    data: [
      { key: "default_low_stock", name: "Low Stock Default", metric: "STOCK_LEVEL", threshold: 5, type: "WARNING" },
      { key: "default_order_total", name: "High Order Default", metric: "ORDER_TOTAL", threshold: 1000, type: "SUCCESS" },
      { key: "default_pending_res", name: "Pending Reservation Default", metric: "PENDING_RESERVATIONS", threshold: 2, type: "URGENT" },
    ]
  });
}

export default async function AnnouncementsPage() {
  const t = await getTranslations("Admin.announcements");

  // Trigger the engine to check for system anomalies
  await seedDefaultRules();
  await runSystemAlertEngine();

  // Fetch all announcements, newest first
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } } },
  });

  const rules = await prisma.systemRule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted text-sm lg:text-base">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6">
          <AnnouncementForm />
          
          <div>
            <SystemRuleForm />
            
            {/* Display Existing Rules */}
            <div className="bg-card border border-border rounded-2xl mt-4 overflow-hidden shadow-sm">
              <div className="p-4 bg-gray-50 border-b border-border">
                <h3 className="font-bold text-sm">Active Auto-Rules</h3>
              </div>
              {rules.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted">No custom rules created yet.</div>
              ) : (
                rules.map((rule) => (
                  <SystemRuleRow key={rule.id} rule={rule} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {announcements.length === 0 ? (
              <div className="p-8 text-center text-muted">
                {t("empty")}
              </div>
            ) : (
              announcements.map((ann) => (
                <AnnouncementRow key={ann.id} announcement={ann} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}