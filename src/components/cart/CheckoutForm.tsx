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

export function CheckoutForm() {
  const t = useTranslations("Checkout");
  const { items, getTotal } = useCartStore();
  const locale = useLocale();

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    deliveryAddress: "",
  });
  
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

    // 1. Create the order in DB
    const result = await createPendingOrder(formData, items);

    if (!result.success) {
      setError(result.error);
      setFieldErrors(result.fieldErrors ?? {});
      setIsSubmitting(false);
      return;
    }

    // 2. Create Stripe Session
    const stripeResult = await createStripeSession(result.orderId, locale);

    if (!stripeResult.success || !stripeResult.url) {
      setError(stripeResult.error || "Failed to connect to Stripe");
      setIsSubmitting(false);
      return;
    }

    // 3. Redirect to Stripe Checkout
    window.location.href = stripeResult.url;
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

      <FormField label={t("phoneLabel")} required>
        <input type="tel" name="guestPhone" value={formData.guestPhone} onChange={handleChange} required dir="ltr" className={inputClasses} />
        {fieldErrors.guestPhone && <p className="text-xs text-red-600 mt-1">{fieldErrors.guestPhone[0]}</p>}
      </FormField>

      <FormField label={t("addressLabel")} required>
        <textarea name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required rows={3} className={inputClasses} />
        {fieldErrors.deliveryAddress && <p className="text-xs text-red-600 mt-1">{fieldErrors.deliveryAddress[0]}</p>}
      </FormField>

      {error && !Object.keys(fieldErrors).length && (
        <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">{error}</div>
      )}

      <button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-4 rounded-full transition-colors disabled:opacity-50">
        {isSubmitting ? t("processing") : `${t("payNow")} - ${getTotal()} EGP`}
      </button>
    </Form>
  );
}