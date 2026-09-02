import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { contactMessages, InsertContactMessage, InsertPartnerAccount, InsertUser, partnerAccounts, partnerMembershipAudits, partnerNdaApplications, partnerNdaApprovalLinks, partnerPasswordResetCodes, partnerSessions, partnerVerificationCodes, users } from "../drizzle/schema";
import type { RegisteredUserAccessStatus } from "./registeredUserAccess";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function listRegisteredUsers(status?: RegisteredUserAccessStatus) {
  const db = await getDb();
  if (!db) throw new Error("Registered-user storage is temporarily unavailable");

  const conditions = [eq(users.role, "user")];
  if (status) conditions.push(eq(users.accessStatus, status));
  return db.select().from(users).where(and(...conditions)).orderBy(desc(users.createdAt)).limit(250);
}

export async function applyRegisteredUserAccessDecision(input: {
  userId: number;
  nextStatus: Exclude<RegisteredUserAccessStatus, "pending">;
  actorUserId: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Registered-user storage is temporarily unavailable");

  return db.transaction(async tx => {
    const rows = await tx.select().from(users).where(eq(users.id, input.userId)).limit(1);
    const user = rows[0];
    if (!user || user.role !== "user") throw new Error("Registered user was not found.");

    await tx.update(users).set({
      accessStatus: input.nextStatus,
      accessReviewedAt: new Date(),
      accessReviewedBy: input.actorUserId,
    }).where(eq(users.id, user.id));

    return { previousStatus: user.accessStatus, nextStatus: input.nextStatus };
  });
}

/** Persist a validated public website contact request for future email or CRM delivery. */
export async function createContactMessage(message: InsertContactMessage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Contact submission storage is temporarily unavailable");
  }

  const result = await db.insert(contactMessages).values(message);
  return { id: Number(result[0].insertId) };
}

export async function markContactEmailAccepted(contactId: number, resendEmailId: string) {
  const db = await getDb();
  if (!db) throw new Error("Contact submission storage is temporarily unavailable");

  await db
    .update(contactMessages)
    .set({
      emailDeliveryStatus: "accepted",
      resendEmailId,
      emailError: null,
      emailAcceptedAt: new Date(),
    })
    .where(eq(contactMessages.id, contactId));
}

export async function markContactEmailFailed(contactId: number, error: string) {
  const db = await getDb();
  if (!db) throw new Error("Contact submission storage is temporarily unavailable");

  await db
    .update(contactMessages)
    .set({
      emailDeliveryStatus: "failed",
      emailError: error.slice(0, 2_000),
    })
    .where(eq(contactMessages.id, contactId));
}

export async function listContactMessages(status?: "new" | "reviewed" | "responded") {
  const db = await getDb();
  if (!db) throw new Error("Contact submission storage is temporarily unavailable");

  if (status) {
    return db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.status, status))
      .orderBy(desc(contactMessages.createdAt))
      .limit(250);
  }

  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(250);
}

export async function updateContactMessageStatus(contactId: number, status: "new" | "reviewed" | "responded") {
  const db = await getDb();
  if (!db) throw new Error("Contact submission storage is temporarily unavailable");

  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, contactId));
}

export async function getPartnerAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  const rows = await db.select().from(partnerAccounts).where(eq(partnerAccounts.email, email)).limit(1);
  return rows[0];
}

export async function getPartnerAccountById(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  const rows = await db.select().from(partnerAccounts).where(eq(partnerAccounts.id, accountId)).limit(1);
  return rows[0];
}

export async function createPendingPartnerAccount(account: InsertPartnerAccount) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  const result = await db.insert(partnerAccounts).values(account);
  return { id: Number(result[0].insertId) };
}

export async function refreshPendingPartnerAccount(accountId: number, values: Partial<InsertPartnerAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set(values).where(eq(partnerAccounts.id, accountId));
}

export async function updatePartnerProfileImage(accountId: number, profileImage: { key: string; url: string }) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ profileImageKey: profileImage.key, profileImageUrl: profileImage.url }).where(eq(partnerAccounts.id, accountId));
}

export async function createOrReplacePartnerNdaApplication(input: { accountId: number; ndaFileKey: string; ndaFileName: string; ndaFileSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  return db.transaction(async tx => {
    const existing = await tx.select().from(partnerNdaApplications).where(eq(partnerNdaApplications.accountId, input.accountId)).limit(1);
    const values = { ndaFileKey: input.ndaFileKey, ndaFileName: input.ndaFileName, ndaFileSize: input.ndaFileSize, ndaStatus: "pending" as const, accountStatus: "pending_approval" as const, accessStatus: "not_granted" as const, adminNotificationEmailId: null, applicantApprovalEmailId: null, approvedAt: null, approvedBy: null };
    const application = existing[0];
    if (application) {
      await tx.update(partnerNdaApplications).set(values).where(eq(partnerNdaApplications.id, application.id));
      await tx.update(partnerNdaApprovalLinks).set({ usedAt: new Date() }).where(and(eq(partnerNdaApprovalLinks.applicationId, application.id), isNull(partnerNdaApprovalLinks.usedAt)));
      await tx.update(partnerAccounts).set({ status: "pending_approval" }).where(eq(partnerAccounts.id, input.accountId));
      await tx.update(partnerSessions).set({ revokedAt: new Date() }).where(and(eq(partnerSessions.accountId, input.accountId), isNull(partnerSessions.revokedAt)));
      return { id: application.id };
    }
    const result = await tx.insert(partnerNdaApplications).values({ accountId: input.accountId, ...values });
    const applicationId = Number(result[0].insertId);
    await tx.update(partnerAccounts).set({ status: "pending_approval" }).where(eq(partnerAccounts.id, input.accountId));
    await tx.update(partnerSessions).set({ revokedAt: new Date() }).where(and(eq(partnerSessions.accountId, input.accountId), isNull(partnerSessions.revokedAt)));
    return { id: applicationId };
  });
}

export async function createPartnerNdaApprovalLink(input: { applicationId: number; tokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("NDA approval-link storage is temporarily unavailable");
  const result = await db.insert(partnerNdaApprovalLinks).values(input);
  return { id: Number(result[0].insertId) };
}

export async function getPartnerNdaApplicationForApprovalToken(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  const rows = await db.select({ application: partnerNdaApplications, account: partnerAccounts, approvalLink: partnerNdaApprovalLinks }).from(partnerNdaApprovalLinks).innerJoin(partnerNdaApplications, eq(partnerNdaApprovalLinks.applicationId, partnerNdaApplications.id)).innerJoin(partnerAccounts, eq(partnerNdaApplications.accountId, partnerAccounts.id)).where(eq(partnerNdaApprovalLinks.tokenHash, tokenHash)).limit(1);
  return rows[0];
}

export async function recordPartnerNdaAdminNotification(applicationId: number, emailId: string) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  await db.update(partnerNdaApplications).set({ adminNotificationEmailId: emailId }).where(eq(partnerNdaApplications.id, applicationId));
}

export async function getPartnerNdaApplicationForAccountId(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  const rows = await db.select().from(partnerNdaApplications).where(eq(partnerNdaApplications.accountId, accountId)).limit(1);
  return rows[0];
}

export async function getPartnerNdaApplicationForAdminResend(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  const rows = await db.select({ application: partnerNdaApplications, account: partnerAccounts }).from(partnerNdaApplications).innerJoin(partnerAccounts, eq(partnerNdaApplications.accountId, partnerAccounts.id)).where(eq(partnerNdaApplications.accountId, accountId)).limit(1);
  return rows[0];
}

export async function recordPartnerNdaApplicantApprovalEmail(applicationId: number, emailId: string) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  await db.update(partnerNdaApplications).set({ applicantApprovalEmailId: emailId, approvalEmailStatus: "sent", approvalEmailError: null }).where(eq(partnerNdaApplications.id, applicationId));
}

export async function recordPartnerNdaApplicantApprovalEmailFailure(applicationId: number, error: string) {
  const db = await getDb();
  if (!db) throw new Error("NDA application storage is temporarily unavailable");
  await db.update(partnerNdaApplications).set({ approvalEmailStatus: "failed", approvalEmailError: error.slice(0, 500) }).where(eq(partnerNdaApplications.id, applicationId));
}

export async function approvePartnerNdaApplication(input: { tokenHash: string; actorUserId: number }) {
  const db = await getDb();
  if (!db) throw new Error("NDA approval-link storage is temporarily unavailable");
  return db.transaction(async tx => {
    const rows = await tx.select({ application: partnerNdaApplications, account: partnerAccounts, approvalLink: partnerNdaApprovalLinks }).from(partnerNdaApprovalLinks).innerJoin(partnerNdaApplications, eq(partnerNdaApprovalLinks.applicationId, partnerNdaApplications.id)).innerJoin(partnerAccounts, eq(partnerNdaApplications.accountId, partnerAccounts.id)).where(eq(partnerNdaApprovalLinks.tokenHash, input.tokenHash)).limit(1);
    const record = rows[0];
    if (!record) throw new Error("This approval request was not found.");
    if (record.approvalLink.usedAt || record.approvalLink.expiresAt.getTime() <= Date.now()) throw new Error("This approval request has expired or was already used.");
    if (record.application.ndaStatus !== "pending" || record.application.accessStatus !== "not_granted") throw new Error("This application has already been processed.");
    const now = new Date();
    const consumed = await tx.update(partnerNdaApprovalLinks).set({ usedAt: now }).where(and(eq(partnerNdaApprovalLinks.id, record.approvalLink.id), isNull(partnerNdaApprovalLinks.usedAt), gt(partnerNdaApprovalLinks.expiresAt, now)));
    if (Number(consumed[0].affectedRows) !== 1) throw new Error("This approval request has expired or was already used.");
    await tx.update(partnerNdaApplications).set({ ndaStatus: "approved", accountStatus: "approved", accessStatus: "granted", approvedAt: now, approvedBy: input.actorUserId }).where(eq(partnerNdaApplications.id, record.application.id));
    await tx.update(partnerAccounts).set({ status: "approved" }).where(eq(partnerAccounts.id, record.account.id));
    await tx.insert(partnerMembershipAudits).values({ accountId: record.account.id, previousStatus: record.account.status, nextStatus: "approved", actorUserId: input.actorUserId, note: "NDA approved and access granted" });
    return { application: record.application, account: record.account };
  });
}

export async function createPartnerVerificationRecord(record: { accountId: number; codeHash: string; expiresAt: Date; requestIp: string; resendEmailId?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Partner verification storage is temporarily unavailable");
  const result = await db.insert(partnerVerificationCodes).values(record);
  return { id: Number(result[0].insertId) };
}

export async function getLatestPartnerVerificationRecord(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner verification storage is temporarily unavailable");
  const rows = await db.select().from(partnerVerificationCodes).where(eq(partnerVerificationCodes.accountId, accountId)).orderBy(desc(partnerVerificationCodes.createdAt)).limit(1);
  return rows[0];
}

export async function incrementPartnerVerificationAttempts(verificationId: number, attempts: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner verification storage is temporarily unavailable");
  await db.update(partnerVerificationCodes).set({ attempts }).where(eq(partnerVerificationCodes.id, verificationId));
}

export async function consumePartnerVerificationRecord(verificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner verification storage is temporarily unavailable");
  const result = await db.update(partnerVerificationCodes).set({ usedAt: new Date() }).where(and(eq(partnerVerificationCodes.id, verificationId), isNull(partnerVerificationCodes.usedAt)));
  return Number(result[0].affectedRows) === 1;
}

export async function markPartnerEmailVerifiedActive(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status: "active", emailVerified: true, emailVerifiedAt: new Date(), verificationMethod: "email_code", verificationStatus: "verified" }).where(eq(partnerAccounts.id, accountId));
}

export async function markPartnerEmailVerifiedPendingNda(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status: "pending_nda", emailVerified: true, emailVerifiedAt: new Date(), verificationMethod: "email_code", verificationStatus: "verified" }).where(eq(partnerAccounts.id, accountId));
}

export async function updatePartnerMembershipStatus(accountId: number, status: PartnerMembershipStatus) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status }).where(eq(partnerAccounts.id, accountId));
}

export type PartnerMembershipStatus = "email_unverified" | "pending_nda" | "pending_approval" | "approved" | "active" | "rejected" | "suspended" | "disabled";

export function isActiveAccessStatus(status: PartnerMembershipStatus) {
  return status === "approved" || status === "active";
}

export async function listPartnerMembershipRequests(status?: PartnerMembershipStatus) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  if (status === "active") {
    return db.select().from(partnerAccounts).where(or(eq(partnerAccounts.status, "approved"), eq(partnerAccounts.status, "active"))).orderBy(desc(partnerAccounts.createdAt)).limit(250);
  }
  if (status) return db.select().from(partnerAccounts).where(eq(partnerAccounts.status, status)).orderBy(desc(partnerAccounts.createdAt)).limit(250);
  return db.select().from(partnerAccounts).orderBy(desc(partnerAccounts.createdAt)).limit(250);
}

export async function applyPartnerMembershipDecision(input: {
  accountId: number;
  nextStatus: "approved" | "rejected" | "suspended";
  accessLevel?: "level_1" | "level_2" | "level_3";
  actorUserId: number;
  note?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");

  return db.transaction(async tx => {
    const rows = await tx.select().from(partnerAccounts).where(eq(partnerAccounts.id, input.accountId)).limit(1);
    const account = rows[0];
    if (!account) throw new Error("Membership request was not found.");
    if (input.nextStatus === "approved" && !["active", "approved"].includes(account.status)) throw new Error("Only active memberships can be approved.");
    if (input.nextStatus === "rejected" && !["active", "approved"].includes(account.status)) throw new Error("Only active memberships can be rejected.");
    if (input.nextStatus === "suspended" && !["active", "approved"].includes(account.status)) throw new Error("Only approved memberships can be suspended.");

    await tx.update(partnerAccounts).set({ status: input.nextStatus, ...(input.nextStatus === "approved" ? { accessLevel: input.accessLevel || "level_1", level3ApprovedAt: input.accessLevel === "level_3" ? new Date() : null } : {}) }).where(eq(partnerAccounts.id, account.id));
    await tx.insert(partnerMembershipAudits).values({
      accountId: account.id,
      previousStatus: account.status,
      nextStatus: input.nextStatus,
      actorUserId: input.actorUserId,
      note: input.note?.trim().slice(0, 500) || null,
    });
    if (input.nextStatus !== "approved") {
      await tx.update(partnerSessions).set({ revokedAt: new Date() }).where(and(eq(partnerSessions.accountId, account.id), isNull(partnerSessions.revokedAt)));
    }
    return { previousStatus: account.status, nextStatus: input.nextStatus };
  });
}

export async function updatePartnerLastLogin(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ lastLoginAt: new Date() }).where(eq(partnerAccounts.id, accountId));
}

export async function createPartnerSession(record: { accountId: number; tokenHash: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Partner session storage is temporarily unavailable");
  await db.insert(partnerSessions).values(record);
}

export async function getActivePartnerSession(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Partner session storage is temporarily unavailable");
  const rows = await db
    .select({ account: partnerAccounts, session: partnerSessions })
    .from(partnerSessions)
    .innerJoin(partnerAccounts, eq(partnerSessions.accountId, partnerAccounts.id))
    .where(and(eq(partnerSessions.tokenHash, tokenHash), isNull(partnerSessions.revokedAt), gt(partnerSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0];
}

export async function revokePartnerSession(tokenHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Partner session storage is temporarily unavailable");
  await db.update(partnerSessions).set({ revokedAt: new Date() }).where(eq(partnerSessions.tokenHash, tokenHash));
}

export async function createPartnerPasswordResetRecord(record: { accountId: number; codeHash: string; expiresAt: Date; requestIp: string; resendEmailId?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Partner password recovery storage is temporarily unavailable");
  const result = await db.insert(partnerPasswordResetCodes).values(record);
  return { id: Number(result[0].insertId) };
}

export async function getLatestPartnerPasswordResetRecord(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner password recovery storage is temporarily unavailable");
  const rows = await db.select().from(partnerPasswordResetCodes).where(eq(partnerPasswordResetCodes.accountId, accountId)).orderBy(desc(partnerPasswordResetCodes.createdAt)).limit(1);
  return rows[0];
}

export async function incrementPartnerPasswordResetAttempts(resetId: number, attempts: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner password recovery storage is temporarily unavailable");
  await db.update(partnerPasswordResetCodes).set({ attempts }).where(eq(partnerPasswordResetCodes.id, resetId));
}

export async function consumePartnerPasswordResetRecord(resetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner password recovery storage is temporarily unavailable");
  const result = await db.update(partnerPasswordResetCodes).set({ usedAt: new Date() }).where(and(eq(partnerPasswordResetCodes.id, resetId), isNull(partnerPasswordResetCodes.usedAt)));
  return Number(result[0].affectedRows) === 1;
}

export async function updatePartnerPassword(accountId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ passwordHash }).where(eq(partnerAccounts.id, accountId));
  await db.update(partnerSessions).set({ revokedAt: new Date() }).where(and(eq(partnerSessions.accountId, accountId), isNull(partnerSessions.revokedAt)));
}
