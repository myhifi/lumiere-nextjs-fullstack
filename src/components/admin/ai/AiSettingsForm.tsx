"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { updateAiSettings, testAiSettingsConnection } from "@/actions/admin-settings";
import type { AiSettings, AiProvider } from "@/lib/services/ai-settings";

type Props = {
  initialSettings: AiSettings;
};

const PROVIDERS: AiProvider[] = ["google", "openai", "deepseek"];

export function AiSettingsForm({ initialSettings }: Props) {
  const t = useTranslations("Admin.settings");
  const router = useRouter();

  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [provider, setProvider] = useState<AiProvider>(initialSettings.provider);
  const [model, setModel] = useState(initialSettings.model);
  const [apiKey, setApiKey] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "failed">("idle");
  const [saved, setSaved] = useState(false);
  
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTesting] = useTransition();

  // Auto-fill default model when provider changes
  function handleProviderChange(newProvider: AiProvider) {
    setProvider(newProvider);
    setModel(initialSettings.availableModels[newProvider][0]?.id ?? "");
    setTestStatus("idle");
  }

  function handleTest() {
    setError(null);
    setTestStatus("idle");
    startTesting(async () => {
      const result = await testAiSettingsConnection({
        provider,
        model,
        enabled,
        apiKey: apiKey.trim() || undefined,
      });
      if (result.success) {
        setTestStatus("success");
      } else {
        setTestStatus("failed");
        setError(result.error);
      }
    });
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setTestStatus("idle");

    startTransition(async () => {
      const result = await updateAiSettings({
        provider,
        model,
        enabled,
        apiKey: apiKey.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSaved(true);
      setApiKey(""); // Clear input after successful save
      router.refresh();
    });
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mt-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold">{t("aiTitle")}</h2>
        <p className="text-sm text-muted">{t("aiSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 accent-accent"
          />
          <span className="text-sm font-medium">{t("aiEnabled")}</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Provider Dropdown */}
          <FormField label={t("aiProvider")}>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as AiProvider)}
              className={inputClasses}
            >
              {PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {t(`aiProviders.${p}`)}
                </option>
              ))}
            </select>
          </FormField>

          {/* Model Dropdown */}
          <FormField label={t("aiModel")}>
            <select
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                setTestStatus("idle");
              }}
              className={inputClasses}
            >
              {initialSettings.availableModels[provider].map((availableModel) => (
                <option key={availableModel.id} value={availableModel.id}>
                  {availableModel.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* API Key */}
        <FormField label={t("aiApiKey")}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setTestStatus("idle");
            }}
            placeholder={initialSettings.hasApiKey ? t("aiApiKeyConfigured") : t("aiApiKeyPlaceholder")}
            className={inputClasses}
            dir="ltr"
          />
        </FormField>

        {/* Status Messages */}
        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}
        {testStatus === "success" && (
          <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
            {t("aiTestSuccess")}
          </div>
        )}
        {saved && (
          <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
            {t("saved")}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || isPending}
            className="text-sm font-medium text-accent hover:text-accent-dark transition-colors disabled:opacity-60"
          >
            {isTesting ? t("aiTesting") : t("aiTest")}
          </button>

          <button
            type="submit"
            disabled={isPending || isTesting}
            className="bg-accent hover:bg-accent-dark text-white font-medium px-8 py-3 rounded-full transition-colors disabled:opacity-60"
          >
            {isPending ? t("saving") : t("save")}
          </button>
        </div>
      </form>
    </div>
  );
}