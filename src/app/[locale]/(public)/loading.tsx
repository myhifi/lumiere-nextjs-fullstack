import { getTranslations } from "next-intl/server";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default async function PublicLoading() {
  const t = await getTranslations("UI");
  return <LoadingSpinner label={t("loadingDefault")} />;
}