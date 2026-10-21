// src/lib/validations/orderTracking.ts
import { z } from "zod";

// ─── Order ID (Prisma CUID v1) ───
// Starts with 'c', followed by 24 base36 chars.
const CUID_REGEX = /^c[a-z0-9]{24}$/i;

// ─── Deliberately loose email regex ───
// Zod's email() is stricter — this only gates "does it look like email?".
// The authoritative check for query execution is `emailSchema` below.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ═══════════════════════════════════════════════════
// Zod schemas — used to validate URL params before querying
// ═══════════════════════════════════════════════════
export const orderIdSchema = z
  .string()
  .trim()
  .regex(CUID_REGEX, "Invalid order ID");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email address");

// ═══════════════════════════════════════════════════
// Classifier — turns raw user input into a typed result
// ═══════════════════════════════════════════════════
export type ClassifiedQuery =
  | { type: "id"; value: string }
  | { type: "email"; value: string }
  | { type: "invalid"; value: string };

export function classifyQuery(raw: string): ClassifiedQuery {
  const value = raw.trim();
  if (CUID_REGEX.test(value)) return { type: "id", value };
  if (LOOKS_LIKE_EMAIL.test(value)) {
    return { type: "email", value: value.toLowerCase() };
  }
  return { type: "invalid", value };
}