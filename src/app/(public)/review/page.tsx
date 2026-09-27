import type { Metadata } from "next";
import { ReviewForm } from "@/components/review/ReviewForm";

export const metadata: Metadata = {
  title: "قيّم تجربتك",
  description:
    "شاركنا تجربتك في مطعم Lumière — رأيك يساعدنا على تقديم خدمة أفضل.",
  openGraph: {
    title: "قيّم تجربتك | Lumière",
    description: "شاركنا تجربتك في مطعم Lumière.",
    type: "website",
  },
};

export default function ReviewPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <span className="text-accent text-sm font-medium tracking-widest">
          YOUR FEEDBACK
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-4">
          قيّم تجربتك
        </h1>
        <p className="text-muted max-w-xl mx-auto">
          رأيك يهمنا — شاركنا تجربتك في Lumière وساعدنا على تقديم تجربة أفضل.
        </p>
      </div>

      <ReviewForm />
    </div>
  );
}