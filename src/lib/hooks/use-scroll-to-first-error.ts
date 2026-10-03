"use client";

import { useEffect } from "react";

// ═══════════════════════════════════════════════════
// 🎯 useScrollToFirstError
// ═══════════════════════════════════════════════════
// When a form's fieldErrors object changes, scroll to
// the first errored field and focus it. Standard UX
// pattern for server-validated forms.
//
// Usage:
//   useScrollToFirstError(fieldErrors);
//
// Where fieldErrors = { name: ["Too short"], price: [...] }
// Field names must match the `name` attribute of inputs.

export function useScrollToFirstError(
  fieldErrors: Record<string, string[]> | undefined
) {
  useEffect(() => {
    if (!fieldErrors) return;
    const firstKey = Object.keys(fieldErrors)[0];
    if (!firstKey) return;

    // Slight delay so React finishes rendering the error text
    // before we scroll — otherwise layout shifts can misalign.
    const timer = setTimeout(() => {
      const input = document.querySelector(`[name="${firstKey}"]`);
      if (!(input instanceof HTMLElement)) return;

      input.scrollIntoView({ behavior: "smooth", block: "center" });

      // Focus after scroll finishes, without triggering a second scroll
      setTimeout(() => {
        if (
          input instanceof HTMLInputElement ||
          input instanceof HTMLTextAreaElement ||
          input instanceof HTMLSelectElement
        ) {
          input.focus({ preventScroll: true });
        }
      }, 400);
    }, 50);

    return () => clearTimeout(timer);
  }, [fieldErrors]);
}