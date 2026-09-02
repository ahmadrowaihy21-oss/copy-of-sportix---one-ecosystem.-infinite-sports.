import { createHash, randomBytes } from "node:crypto";
import { storagePut } from "./storage";
import { ENV } from "./_core/env";

export const PARTNER_NDA_MAX_BYTES = 10 * 1024 * 1024;
export const PARTNER_NDA_APPROVAL_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

export type PartnerNdaPayload = {
  base64: string;
  fileName: string;
};

const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

function sanitisePdfFileName(fileName: string) {
  const cleaned = fileName.trim().replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "-").replace(/\s+/g, " ").slice(0, 240);
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned || "signed-nda"}.pdf`;
}

export function validatePartnerNdaPayload(payload: PartnerNdaPayload) {
  const base64 = payload.base64.trim();
  if (!base64 || !base64Pattern.test(base64) || base64.length % 4 !== 0) {
    throw new Error("The signed NDA could not be read. Please upload a PDF file.");
  }

  const bytes = Buffer.from(base64, "base64");
  if (!bytes.length || bytes.length > PARTNER_NDA_MAX_BYTES) {
    throw new Error("The signed NDA must be a PDF file up to 10 MB.");
  }
  if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new Error("The signed NDA must be a valid PDF file.");
  }

  return { bytes, fileName: sanitisePdfFileName(payload.fileName) };
}

export async function storePartnerSignedNda(accountId: number, payload: PartnerNdaPayload) {
  const nda = validatePartnerNdaPayload(payload);
  const stored = await storagePut(`partner-ndas/${accountId}/signed-nda.pdf`, nda.bytes, "application/pdf");
  return { ...stored, fileName: nda.fileName, fileSize: nda.bytes.length };
}

export function createPartnerNdaApprovalToken() {
  return randomBytes(32).toString("base64url");
}

export function hashPartnerNdaApprovalToken(token: string) {
  return createHash("sha256").update(`partner-nda-approval:${token}:${ENV.cookieSecret}`).digest("hex");
}
