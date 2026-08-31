import { createHash, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { ENV } from "./_core/env";

const scrypt = promisify(scryptCallback);

export const PARTNER_SESSION_COOKIE = "__Host-sportix_partner_session";
export const PARTNER_VERIFICATION_TTL_MS = 10 * 60 * 1_000;
export const PARTNER_PASSWORD_RESET_TTL_MS = 10 * 60 * 1_000;
export const PARTNER_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1_000;
export const MAX_VERIFICATION_ATTEMPTS = 5;
export const MAX_PASSWORD_RESET_ATTEMPTS = 5;

const digest = (value: string) => createHash("sha256").update(value).digest("hex");

export async function hashPartnerPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("base64url")}`;
}

export async function verifyPartnerPassword(password: string, stored: string) {
  const [algorithm, salt, expected] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !expected) return false;

  const derived = await scrypt(password, salt, 64) as Buffer;
  const expectedBuffer = Buffer.from(expected, "base64url");
  return expectedBuffer.length === derived.length && timingSafeEqual(expectedBuffer, derived);
}

export function createPartnerVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashPartnerVerificationCode(accountId: number, code: string) {
  return digest(`partner-verification:${accountId}:${code}:${ENV.cookieSecret}`);
}

export function hashPartnerPasswordResetCode(accountId: number, code: string) {
  return digest(`partner-password-reset:${accountId}:${code}:${ENV.cookieSecret}`);
}

export function createPartnerSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPartnerSessionToken(token: string) {
  return digest(`partner-session:${token}:${ENV.cookieSecret}`);
}

export function normalizePartnerEmail(value: string) {
  return value.trim().toLowerCase();
}
