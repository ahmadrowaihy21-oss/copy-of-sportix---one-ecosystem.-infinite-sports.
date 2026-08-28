import { and, desc, eq, gt, isNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { contactMessages, InsertContactMessage, InsertPartnerAccount, InsertUser, partnerAccounts, partnerMembershipAudits, partnerSessions, partnerVerificationCodes, users } from "../drizzle/schema";
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

export async function markPartnerEmailVerifiedPendingApproval(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status: "pending_approval", emailVerifiedAt: new Date() }).where(eq(partnerAccounts.id, accountId));
}

export async function markPartnerEmailVerifiedNdaPending(accountId: number) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status: "nda_pending", emailVerified: true, emailVerifiedAt: new Date(), verificationMethod: "email_code", verificationStatus: "verified" }).where(eq(partnerAccounts.id, accountId));
}

export async function updatePartnerMembershipStatus(accountId: number, status: PartnerMembershipStatus) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status }).where(eq(partnerAccounts.id, accountId));
}

export async function requestPartnerMoreInformation(accountId: number, note: string) {
  const db = await getDb();
  if (!db) throw new Error("Partner account storage is temporarily unavailable");
  await db.update(partnerAccounts).set({ status: "pending_admin_approval", moreInformationRequest: note.slice(0, 2_000) }).where(eq(partnerAccounts.id, accountId));
}

export type PartnerMembershipStatus = "email_unverified" | "nda_pending" | "company_authority_pending" | "company_nda_pending" | "pending_approval" | "pending_admin_approval" | "approved" | "active" | "rejected" | "suspended" | "pending" | "disabled";

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
    if (input.nextStatus === "approved" && !["pending_approval", "pending_admin_approval"].includes(account.status)) throw new Error("Only complete pending memberships can be approved.");
    if (input.nextStatus === "rejected" && !["pending_approval", "pending_admin_approval", "company_nda_pending"].includes(account.status)) throw new Error("Only pending memberships can be rejected.");
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
