import { createHash, randomUUID } from "crypto";
import PDFDocument from "pdfkit";
import { and, desc, eq } from "drizzle-orm";
import { ndaAcceptances, ndaDocuments, partnerAccounts, partnerAuditLogs } from "../drizzle/schema";
import { getDb } from "./db";
import { storageGet, storageGetSignedUrl, storagePut } from "./storage";

export const NDA_VERSION = "1.0";
export const NDA_DOCUMENT_ID = "SPORTIX-NDA-AR-2026-001";
export const NDA_EFFECTIVE_DATE = "2026-08-27";
const NDA_SOURCE_KEY = "SPORTIX-NDA-AR-2026-001_03634657.txt";
const NDA_FONT_KEY = "NotoNaskhArabic-Regular_025a42d0.ttf";

export const sha256 = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

export function browserFromUserAgent(userAgent = "") {
  if (/edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/chrome\//i.test(userAgent)) return "Google Chrome";
  if (/safari\//i.test(userAgent)) return "Safari";
  if (/firefox\//i.test(userAgent)) return "Firefox";
  return "Unknown browser";
}

export function deviceFromUserAgent(userAgent = "") {
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  return "Desktop";
}

export async function getOrCreateNdaDocument() {
  const db = await getDb();
  if (!db) throw new Error("NDA storage is temporarily unavailable.");
  const existing = await db.select().from(ndaDocuments).where(eq(ndaDocuments.documentId, NDA_DOCUMENT_ID)).limit(1);
  if (existing[0]) return existing[0];
  const sourceUrl = await storageGetSignedUrl(NDA_SOURCE_KEY);
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error("The approved NDA source could not be loaded.");
  const contentSnapshot = await response.text();
  const source = await storageGet(NDA_SOURCE_KEY);
  const values = {
    version: NDA_VERSION, documentId: NDA_DOCUMENT_ID, effectiveDate: NDA_EFFECTIVE_DATE,
    jurisdiction: "Kingdom of Saudi Arabia", controllingLanguage: "Arabic", agreedCompensation: "SAR 3,000,000",
    contentSnapshot, contentHash: sha256(contentSnapshot), sourceStorageKey: source.key, sourceStorageUrl: source.url,
  };
  const result = await db.insert(ndaDocuments).values(values);
  return { id: Number(result[0].insertId), ...values, immutableLockedAt: new Date(), createdAt: new Date() };
}

export async function recordPartnerAudit(input: { accountId?: number; actorUserId?: number; action: string; requestIp?: string; userAgent?: string; relatedRecordId?: string; metadata?: Record<string, unknown> }) {
  const db = await getDb();
  if (!db) throw new Error("Audit storage is temporarily unavailable.");
  await db.insert(partnerAuditLogs).values({ ...input, metadata: input.metadata ? JSON.stringify(input.metadata) : null });
}

export async function getNdaAcceptance(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("NDA storage is temporarily unavailable.");
  const rows = await db.select().from(ndaAcceptances).where(eq(ndaAcceptances.accountId, accountId)).orderBy(desc(ndaAcceptances.acceptedAt)).limit(1);
  return rows[0];
}

export async function createNdaAcceptance(input: { accountId: number; requestIp: string; userAgent: string; emailVerifiedAt: Date | null }) {
  const db = await getDb();
  if (!db) throw new Error("NDA storage is temporarily unavailable.");
  const current = await getNdaAcceptance(input.accountId);
  if (current) return current;
  const nda = await getOrCreateNdaDocument();
  const acceptanceId = `SPORTIX-NDA-${randomUUID()}`;
  const values = {
    acceptanceId, accountId: input.accountId, ndaDocumentId: nda.id, requestIp: input.requestIp,
    userAgent: input.userAgent.slice(0, 800), browser: browserFromUserAgent(input.userAgent), deviceInfo: deviceFromUserAgent(input.userAgent),
    emailVerificationStatus: "verified", emailVerifiedAt: input.emailVerifiedAt, adminStatus: "nda_pending",
  };
  const result = await db.insert(ndaAcceptances).values(values);
  await recordPartnerAudit({ accountId: input.accountId, action: "nda_accepted", requestIp: input.requestIp, userAgent: input.userAgent, relatedRecordId: acceptanceId, metadata: { version: nda.version, documentId: nda.documentId, ndaHash: nda.contentHash } });
  return { id: Number(result[0].insertId), ...values, acceptedAt: new Date() };
}

export function decodeCompanyNda(file: { base64: string; mimeType: "application/pdf" | "image/jpeg" | "image/png" }) {
  const bytes = Buffer.from(file.base64, "base64");
  if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error("The signed Company NDA must be up to 8 MB.");
  const valid = file.mimeType === "application/pdf" ? bytes.subarray(0, 4).toString() === "%PDF" : file.mimeType === "image/png" ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!valid) throw new Error("The uploaded Company NDA file type does not match its content.");
  return bytes;
}

export async function saveCompanyNda(input: { acceptanceId: number; accountId: number; file: { base64: string; mimeType: "application/pdf" | "image/jpeg" | "image/png" }; requestIp: string; userAgent: string }) {
  const db = await getDb();
  if (!db) throw new Error("NDA storage is temporarily unavailable.");
  const bytes = decodeCompanyNda(input.file);
  const extension = input.file.mimeType === "application/pdf" ? "pdf" : input.file.mimeType === "image/png" ? "png" : "jpg";
  const stored = await storagePut(`partner-company-nda/${input.accountId}/signed-company-nda.${extension}`, bytes, input.file.mimeType);
  await db.update(ndaAcceptances).set({ companyNdaStorageKey: stored.key, companyNdaStorageUrl: stored.url, companyNdaMimeType: input.file.mimeType, adminStatus: "company_nda_pending" }).where(eq(ndaAcceptances.id, input.acceptanceId));
  await recordPartnerAudit({ accountId: input.accountId, action: "company_nda_uploaded", requestIp: input.requestIp, userAgent: input.userAgent, relatedRecordId: String(input.acceptanceId) });
  return stored;
}

export async function setNdaAuthority(input: { acceptanceId: number; accountId: number; authority: "yes" | "no"; requestIp: string; userAgent: string }) {
  const db = await getDb();
  if (!db) throw new Error("NDA storage is temporarily unavailable.");
  await db.update(ndaAcceptances).set({ authorityAnswer: input.authority, authorityDeclaredAt: new Date(), adminStatus: input.authority === "yes" ? "pending_admin_approval" : "company_nda_pending" }).where(eq(ndaAcceptances.id, input.acceptanceId));
  await recordPartnerAudit({ accountId: input.accountId, action: "company_authority_selected", requestIp: input.requestIp, userAgent: input.userAgent, relatedRecordId: String(input.acceptanceId), metadata: { authority: input.authority } });
}

export async function generateNdaEvidence(input: { accountId: number; acceptanceId: number }) {
  const db = await getDb();
  if (!db) throw new Error("NDA storage is temporarily unavailable.");
  const acceptance = await getNdaAcceptance(input.accountId);
  if (!acceptance || acceptance.id !== input.acceptanceId) throw new Error("NDA acceptance was not found.");
  if (acceptance.evidenceStorageUrl) return { key: acceptance.evidenceStorageKey!, url: acceptance.evidenceStorageUrl! };
  const account = (await db.select().from(partnerAccounts).where(eq(partnerAccounts.id, input.accountId)).limit(1))[0];
  const nda = (await db.select().from(ndaDocuments).where(eq(ndaDocuments.id, acceptance.ndaDocumentId)).limit(1))[0];
  if (!account || !nda) throw new Error("NDA evidence source was not found.");
  const fontUrl = await storageGetSignedUrl(NDA_FONT_KEY);
  const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
  const pdf = new PDFDocument({ size: "A4", margin: 42, autoFirstPage: true });
  const chunks: Buffer[] = []; pdf.on("data", chunk => chunks.push(Buffer.from(chunk)));
  const complete = new Promise<Buffer>((resolve, reject) => { pdf.on("end", () => resolve(Buffer.concat(chunks))); pdf.on("error", reject); });
  pdf.registerFont("NotoArabic", font); pdf.font("NotoArabic").fontSize(14).text("SPORTIX NDA — ACCEPTANCE EVIDENCE", { align: "center" });
  pdf.moveDown().fontSize(10).text(`Acceptance ID: ${acceptance.acceptanceId}\nNDA Version: ${nda.version}\nDocument ID: ${nda.documentId}\nEffective Date: ${nda.effectiveDate}\nAccepted At (UTC): ${acceptance.acceptedAt.toISOString()}\nUser: ${account.fullName}\nVerified Work Email: ${account.email}\nCompany: ${account.companyName ?? "—"}\nJob Title: ${account.jobTitle ?? "—"}\nNDA SHA-256: ${nda.contentHash}`);
  pdf.addPage().font("NotoArabic").fontSize(11).text(nda.contentSnapshot, { align: "right", lineGap: 4 }); pdf.end();
  const bytes = await complete; const stored = await storagePut(`nda-evidence/${input.accountId}/${acceptance.acceptanceId}.pdf`, bytes, "application/pdf");
  await db.update(ndaAcceptances).set({ evidenceStorageKey: stored.key, evidenceStorageUrl: stored.url, evidenceHash: sha256(bytes) }).where(eq(ndaAcceptances.id, input.acceptanceId));
  await recordPartnerAudit({ accountId: input.accountId, action: "nda_pdf_generated", relatedRecordId: acceptance.acceptanceId, metadata: { evidenceHash: sha256(bytes) } });
  return stored;
}
