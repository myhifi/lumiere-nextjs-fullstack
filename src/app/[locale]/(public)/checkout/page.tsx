import { getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export default async function CheckoutPage() {
  const t = await getTranslations("Checkout");

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </div>
      <CheckoutForm />
    </div>
  );
}