// ═══════════════════════════════════════════════════
// 🌐 Server-side error translation helper
// ═══════════════════════════════════════════════════
// Server Actions can call getTranslations() to return
// localized error messages based on the current request.

import { getTranslations } from "next-intl/server";

export type ErrorKey =
  | "unauthorized"
  | "adminRequired"
  | "notFound"
  | "invalidData"
  | "duplicateSlug"
  | "duplicateEmail"
  | "duplicateNumber"
  | "duplicateName"
  | "hasItems"
  | "hasReservations"
  | "noTableAvailable"
  | "selfRoleChange"
  | "selfDisable"
  | "lastAdmin"
  | "selfDelete"
  | "unexpected"
  | "reviewLimit"
  | "reviewSubmitFailed"
  | "reviewNotFound"
  | "reviewUpdateFailed"
  | "reviewDeleteFailed"
  | "itemNameTooShort"
  | "itemNameTooLong"
  | "slugTooShort"
  | "slugTooLong"
  | "slugInvalidFormat"
  | "itemDescriptionTooLong"
  | "priceMustBePositive"
  | "priceTooLarge"
  | "imageUrlInvalid"
  | "categoryRequired"
  | "categoryNameTooShort"
  | "categoryNameTooLong"
  | "descriptionTooLong"
  | "displayOrderNotInt"
  | "displayOrderNegative"
  | "displayOrderTooLarge"
  | "tableNumberNotInt"
  | "tableNumberMin"
  | "tableNumberMax"
  | "capacityNotInt"
  | "capacityMin"
  | "capacityMax"
  | "locationTooLong"
  | "userEmailInvalid"
  | "passwordTooShort"
  | "passwordTooLong"
  | "userNameTooShort"
  | "userNameTooLong"
  | "roleInvalid";

/**
 * Returns a translated error message for the given key.
 * Values (like {count}) can be passed as the second argument.
 */
export async function tError(
  key: ErrorKey,
  values?: Record<string, string | number>
): Promise<string> {
  const t = await getTranslations("Errors");
  return t(key, values);
}