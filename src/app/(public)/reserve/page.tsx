import type { Metadata } from "next";
import { ReservationForm } from "@/components/reservation/ReservationForm";

export const metadata: Metadata = {
  title: "احجز طاولة",
  description:
    "احجز طاولتك في مطعم Lumière — نظام حجز ذكي يخصص لك الطاولة المثالية تلقائياً حسب عدد الأشخاص والوقت.",
  openGraph: {
    title: "احجز طاولة | Lumière",
    description:
      "نظام حجز ذكي يخصص لك الطاولة المثالية تلقائياً حسب عدد الأشخاص والوقت.",
    type: "website",
  },
};

export default function ReservePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-accent text-sm font-medium tracking-widest">
          RESERVATION
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          احجز طاولتك
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          املأ النموذج وسيتواصل معك فريقنا لتأكيد الحجز
        </p>
      </div>

      <ReservationForm />
    </div>
  );
}