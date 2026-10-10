"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Form } from "@/components/ui/Form";
import { useScrollToFirstError } from "@/lib/hooks/use-scroll-to-first-error";
import { updateWhatsAppNumber } from "@/actions/admin-settings";
import { buildWhatsAppLink } from "@/lib/constants/contact";

type Props = {
  initialWhatsAppNumber: string;
};

export function SettingsForm({ initialWhatsAppNumber }: Props) {
  const t = useTranslations("Admin.settings");
  const router = useRouter();

  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsAppNumber);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useScrollToFirstError(
    Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined
  );

  // Live preview — strips non-digits locally for display
  const previewNumber = whatsappNumber.replace(/\D/g, "");
  const previewLink = previewNumber
    ? buildWhatsAppLink(previewNumber, t("previewMessage"))
    : "#";

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateWhatsAppNumber({ whatsappNumber });
      if (!result.success) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <Form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-2xl p-6 md:p-8"
    >
      <FormField label={t("whatsappLabel")} required>
        <input
          type="tel"
          name="whatsappNumber"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder={t("whatsappPlaceholder")}
          dir="ltr"
          className={inputClasses}
        />
        <p className="text-xs text-muted mt-1">{t("whatsappHint")}</p>
        {fieldErrors.whatsappNumber && (
          <p className="text-xs text-red-600 mt-1">
            {fieldErrors.whatsappNumber[0]}
          </p>
        )}
      </FormField>

      {/* Live preview of the generated wa.me link */}
      <div className="mt-6 p-4 rounded-lg bg-background/60 border border-border">
        <p className="text-xs text-muted mb-2">{t("previewLabel")}</p>
        <a
          href={previewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:text-accent-dark break-all"
          dir="ltr"
        >
          {previewNumber ? previewLink : "—"}
        </a>
      </div>

      {error && !Object.keys(fieldErrors).length && (
        <div className="mt-6 p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {saved && (
        <div className="mt-6 p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
          {t("saved")}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? t("saving") : t("save")}
        </button>
      </div>
    </Form>
  );
}