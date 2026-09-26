import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MenuItemCard } from "@/components/menu/MenuItemCard";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // جلب الأطباق المميزة للعرض في الصفحة الرئيسية
  const featuredItems = await prisma.menuItem.findMany({
    where: { isAvailable: true, isFeatured: true },
    take: 3,
    orderBy: { name: "asc" },
    include: {
      category: { select: { name: true, slug: true } },
    },
  });

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-20 text-center bg-linear-to-b from-accent-light/40 to-transparent">
        <span className="text-accent text-sm font-medium tracking-[0.3em] mb-4">
          WELCOME TO
        </span>
        <h1 className="text-6xl md:text-8xl font-bold text-accent mb-6 tracking-tight">
          Lumière
        </h1>
        <p className="text-xl md:text-2xl text-muted max-w-2xl mb-10 leading-relaxed">
          تجربة طعام استثنائية بلمسة عصرية
          <br />
          حيث تلتقي الأصالة بالأناقة
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/menu"
            className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors"
          >
            تصفح القائمة
          </Link>
          <Link
            href="/reserve"
            className="border-2 border-accent text-accent hover:bg-accent hover:text-white font-medium px-8 py-3 rounded-full transition-colors"
          >
            احجز طاولة
          </Link>
        </div>
      </section>

      {/* ─── Featured Dishes ─── */}
      {featuredItems.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-medium tracking-widest">
              OUR SPECIALTIES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">
              أطباقنا المميزة
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              اختيارات الشيف الخاصة لهذا الموسم
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block text-accent hover:text-accent-dark font-medium transition-colors"
            >
              عرض القائمة كاملة ←
            </Link>
          </div>
        </section>
      )}

      {/* ─── Location / Google Maps ─── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-accent text-sm font-medium tracking-widest">
            VISIT US
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">موقعنا</h2>
          <p className="text-muted max-w-xl mx-auto">
            نتشرف بزيارتك في قلب القاهرة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── معلومات الاتصال ─── */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <InfoCard
              icon="📍"
              label="العنوان"
              value="قرية الأسد - طريق القاهرة الاسكندرية الصحراوي"
            />
            <InfoCard
              icon="🕐"
              label="ساعات العمل"
              value="يومياً: ١٢:٠٠ ظهراً — ١١:٠٠ مساءً"
            />
            <InfoCard
              icon="📞"
              label="الهاتف"
              value="+20 100 123 4567"
            />
          </div>

          {/* ─── الخريطة ─── */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-border">
            <iframe
              src="https://maps.google.com/maps?q=Qaryat+El+Asad+Alexandria+Desert+Rd&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "450px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="موقع مطعم Lumière"
            />
          </div>
        </div>
      </section>

      {/* ─── CTA: Reserve ─── */}
      <section className="bg-accent-light/50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            جاهز لتجربة Lumière؟
          </h2>
          <p className="text-muted mb-8">
            احجز طاولتك الآن واستمتع بتجربة طعام لا تُنسى
          </p>
          <Link
            href="/reserve"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-medium px-10 py-4 rounded-full transition-colors"
          >
            احجز طاولتك
          </Link>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════
// 🏠 InfoCard — بطاقة معلومة اتصال (خارج HomePage)
// ═══════════════════════════════════════════════════
function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex gap-4">
      <span className="text-3xl shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-accent-dark font-medium tracking-wider uppercase mb-1">
          {label}
        </div>
        <div className="text-sm text-foreground leading-relaxed">{value}</div>
      </div>
    </div>
  );
}