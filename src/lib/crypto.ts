// ═══════════════════════════════════════════════════
// 🔐 AES-256-GCM encryption for server-side secrets
// ═══════════════════════════════════════════════════
// Used exclusively for encrypting admin-provided AI API
// keys before they are persisted in the Setting table.
//
// Never import this file into a Client Component.
// The decrypted value must never reach the browser.

import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12; // 96-bit IV — recommended for GCM
const TAG_BYTES = 16; // 128-bit authentication tag

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;

  if (!raw) {
    throw new Error(
      "[crypto] ENCRYPTION_KEY is not set. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }

  const key = Buffer.from(raw, "hex");

  if (key.length !== 32) {
    throw new Error(
      "[crypto] ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)."
    );
  }

  return key;
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM.
 *
 * The returned Base64 payload contains, in order:
 *   [ 12-byte IV ][ 16-byte auth tag ][ ciphertext ]
 *
 * This keeps the ciphertext in a single `Setting.value`
 * string and guarantees integrity via the GCM tag.
 */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

/**
 * Decrypts a payload produced by `encrypt()`.
 *
 * Throws if the payload is malformed or has been tampered with.
 * Callers should treat a thrown error as "no usable key".
 */
export function decrypt(payload: string): string {
  const data = Buffer.from(payload, "base64");

  if (data.length < IV_BYTES + TAG_BYTES) {
    throw new Error("[crypto] Invalid encrypted payload.");
  }

  const iv = data.subarray(0, IV_BYTES);
  const tag = data.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const ciphertext = data.subarray(IV_BYTES + TAG_BYTES);

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}