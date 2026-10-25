// src/components/cart/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/Form";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { useCartStore } from "@/store/useCartStore";
import { useScrollToFirstError } from "@/lib/hooks/use-scroll-to-first-error";
import { createPendingOrder } from "@/actions/checkout";
import { createStripeSession } from "@/actions/stripe";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function CheckoutForm() {
  const t = useTranslations("Checkout");
  const { items, getTotal, tableNumber } = useCartStore();
  const locale = useLocale();
  const router = useRouter();

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    deliveryAddress: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH">("CARD");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);

  useScrollToFirstError(Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

    async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const payload = {
        ...formData,
        deliveryAddress: formData.deliveryAddress || undefined,
        guestPhone: formData.guestPhone || undefined,          
        tableNumber: tableNumber || undefined,
        paymentMethod: paymentMethod,
      };
      const result = await createPendingOrder(payload, items);

      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return; // The finally block will handle setIsSubmitting(false)
      }

      if (paymentMethod === "CASH") {
        router.push(`/checkout/success?orderId=${result.orderId}&cash=true`);
        return;
      }

      const stripeResult = await createStripeSession(result.orderId, locale);

      if (!stripeResult.success || !stripeResult.url) {
        setError(stripeResult.error || "Failed to connect to Stripe");
        return;
      }

      window.location.href = stripeResult.url;
    } catch (err) {
      console.error("[Checkout Submit Error]", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-5">
      <FormField label={t("nameLabel")} required>
        <input type="text" name="guestName" value={formData.guestName} onChange={handleChange} required className={inputClasses} />
        {fieldErrors.guestName && <p className="text-xs text-red-600 mt-1">{fieldErrors.guestName[0]}</p>}
      </FormField>

      <FormField label={t("emailLabel")} required>
        <input type="email" name="guestEmail" value={formData.guestEmail} onChange={handleChange} required dir="ltr" className={inputClasses} />
        {fieldErrors.guestEmail && <p className="text-xs text-red-600 mt-1">{fieldErrors.guestEmail[0]}</p>}
      </FormField>

      {/* Hide phone for Dine-In */}
      {!tableNumber && (
        <FormField label={t("phoneLabel")} required>
          <input type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange} required dir="ltr" className={inputClasses} />
          {fieldErrors.guestPhone && <p className="text-xs text-red-600 mt-1">{fieldErrors.guestPhone[0]}</p>}
        </FormField>
      )}

      {tableNumber && (
        <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-between">
          <span className="font-medium text-accent-dark">{t("dineInOrder")}</span>
          <span className="font-bold text-lg text-accent-dark">{t("tableNumber", { table: tableNumber })}</span>
        </div>
      )}

      {!tableNumber && (
        <FormField label={t("addressLabel")} required>
          <textarea name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required rows={3} className={inputClasses} />
          {fieldErrors.deliveryAddress && <p className="text-xs text-red-600 mt-1">{fieldErrors.deliveryAddress[0]}</p>}
        </FormField>
      )}

      {/* Payment Method Toggle (Always Visible) */}
      <div className="space-y-4">
        <div className="flex gap-2 p-1 bg-background border border-border rounded-xl">
          <button
            type="button"
            onClick={() => setPaymentMethod("CARD")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${paymentMethod === "CARD" ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {t("payByCard")}
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("CASH")}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${paymentMethod === "CASH" ? "bg-white shadow-sm text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {t("payByCash")}
          </button>
        </div>
      </div>

      {error && !Object.keys(fieldErrors).length && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-4 rounded-full transition-colors disabled:opacity-50">
        {isSubmitting ? t("processing") : `${t("payNow")} - ${getTotal()} AED`}
      </button>
    </Form>
  );
}