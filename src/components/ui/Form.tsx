import { type FormHTMLAttributes, type ReactNode } from "react";

// ═══════════════════════════════════════════════════
// 📝 Form — Unified form wrapper
// ═══════════════════════════════════════════════════
// Always disables HTML5 native validation so Zod
// (or any custom validator) is the single source of truth.
// Consumers pass all standard <form> props through.

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: ReactNode;
};

export function Form({ children, ...props }: FormProps) {
  return (
    <form noValidate {...props}>
      {children}
    </form>
  );
}