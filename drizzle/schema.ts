import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Public partnership and business-contact requests submitted from the SPORTIX website. */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  mobileNumber: varchar("mobileNumber", { length: 32 }),
  companyName: varchar("companyName", { length: 200 }).notNull(),
  jobTitle: varchar("jobTitle", { length: 160 }).notNull(),
  subject: varchar("subject", { length: 220 }).notNull(),
  message: text("message").notNull(),
  language: varchar("language", { length: 8 }).default("en").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "responded"]).default("new").notNull(),
  emailDeliveryStatus: mysqlEnum("emailDeliveryStatus", ["pending", "accepted", "failed", "delivered"]).default("pending").notNull(),
  resendEmailId: varchar("resendEmailId", { length: 128 }),
  emailError: text("emailError"),
  senderEmail: varchar("senderEmail", { length: 320 }),
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  requestIp: varchar("requestIp", { length: 64 }),
  emailAcceptedAt: timestamp("emailAcceptedAt"),
  emailDeliveredAt: timestamp("emailDeliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/** Email/password accounts used by the SPORTIX Partners authentication gateway. */
export const partnerAccounts = mysqlTable("partner_accounts", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  mobileNumber: varchar("mobileNumber", { length: 32 }),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 200 }),
  jobTitle: varchar("jobTitle", { length: 160 }),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female"]),
  weeklySportFrequency: mysqlEnum("weeklySportFrequency", ["0", "1-2", "3-4", "5+"]),
  currentSports: text("currentSports"),
  aspirationalSport: varchar("aspirationalSport", { length: 160 }),
  sportsChallenges: text("sportsChallenges"),
  sportsSolutionIdea: text("sportsSolutionIdea"),
  profileImageKey: varchar("profileImageKey", { length: 512 }),
  profileImageUrl: varchar("profileImageUrl", { length: 700 }),
  status: mysqlEnum("status", ["pending", "active", "disabled", "email_unverified", "nda_pending", "company_authority_pending", "company_nda_pending", "pending_approval", "pending_admin_approval", "approved", "rejected", "suspended"]).default("email_unverified").notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  verificationMethod: varchar("verificationMethod", { length: 32 }),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "failed", "expired", "used"]).default("pending").notNull(),
  accessLevel: mysqlEnum("accessLevel", ["level_1", "level_2", "level_3"]).default("level_1").notNull(),
  level3ApprovedAt: timestamp("level3ApprovedAt"),
  moreInformationRequest: text("moreInformationRequest"),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Single-use, short-lived server-side email verification records. Only the digest is stored. */
export const partnerVerificationCodes = mysqlTable("partner_verification_codes", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  codeHash: varchar("codeHash", { length: 64 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  attempts: int("attempts").default(0).notNull(),
  requestIp: varchar("requestIp", { length: 64 }),
  resendEmailId: varchar("resendEmailId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Opaque server-side sessions. Browser cookies carry only an unguessable random token. */
export const partnerSessions = mysqlTable("partner_sessions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Immutable record of each protected membership decision for accountability and troubleshooting. */
export const partnerMembershipAudits = mysqlTable("partner_membership_audits", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull(),
  previousStatus: varchar("previousStatus", { length: 32 }).notNull(),
  nextStatus: varchar("nextStatus", { length: 32 }).notNull(),
  actorUserId: int("actorUserId"),
  note: varchar("note", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Immutable approved NDA versions. A version's snapshot and SHA-256 hash are frozen once it is used. */
export const ndaDocuments = mysqlTable("nda_documents", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 32 }).notNull().unique(),
  documentId: varchar("documentId", { length: 96 }).notNull().unique(),
  effectiveDate: varchar("effectiveDate", { length: 16 }).notNull(),
  jurisdiction: varchar("jurisdiction", { length: 160 }).notNull(),
  controllingLanguage: varchar("controllingLanguage", { length: 32 }).notNull(),
  agreedCompensation: varchar("agreedCompensation", { length: 64 }).notNull(),
  contentSnapshot: text("contentSnapshot").notNull(),
  contentHash: varchar("contentHash", { length: 64 }).notNull(),
  sourceStorageKey: varchar("sourceStorageKey", { length: 512 }).notNull(),
  sourceStorageUrl: varchar("sourceStorageUrl", { length: 700 }).notNull(),
  immutableLockedAt: timestamp("immutableLockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Permanent evidence of a specific user accepting a specific immutable NDA version. */
export const ndaAcceptances = mysqlTable("nda_acceptances", {
  id: int("id").autoincrement().primaryKey(),
  acceptanceId: varchar("acceptanceId", { length: 96 }).notNull().unique(),
  accountId: int("accountId").notNull(),
  ndaDocumentId: int("ndaDocumentId").notNull(),
  acceptanceStatus: mysqlEnum("acceptanceStatus", ["accepted"]).default("accepted").notNull(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  requestIp: varchar("requestIp", { length: 64 }),
  userAgent: varchar("userAgent", { length: 800 }),
  browser: varchar("browser", { length: 160 }),
  deviceInfo: varchar("deviceInfo", { length: 240 }),
  emailVerificationStatus: varchar("emailVerificationStatus", { length: 32 }).notNull(),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  authorityAnswer: mysqlEnum("authorityAnswer", ["yes", "no"]),
  authorityDeclaredAt: timestamp("authorityDeclaredAt"),
  companyNdaStorageKey: varchar("companyNdaStorageKey", { length: 512 }),
  companyNdaStorageUrl: varchar("companyNdaStorageUrl", { length: 700 }),
  companyNdaMimeType: varchar("companyNdaMimeType", { length: 96 }),
  evidenceStorageKey: varchar("evidenceStorageKey", { length: 512 }),
  evidenceStorageUrl: varchar("evidenceStorageUrl", { length: 700 }),
  evidenceHash: varchar("evidenceHash", { length: 64 }),
  adminStatus: varchar("adminStatus", { length: 32 }).notNull(),
  adminReviewerUserId: int("adminReviewerUserId"),
  adminReviewedAt: timestamp("adminReviewedAt"),
});

/** Append-only legal and security event record. Ordinary partner routes never expose write or update operations. */
export const partnerAuditLogs = mysqlTable("partner_audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId"),
  actorUserId: int("actorUserId"),
  action: varchar("action", { length: 64 }).notNull(),
  requestIp: varchar("requestIp", { length: 64 }),
  userAgent: varchar("userAgent", { length: 800 }),
  relatedRecordId: varchar("relatedRecordId", { length: 96 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PartnerAccount = typeof partnerAccounts.$inferSelect;
export type InsertPartnerAccount = typeof partnerAccounts.$inferInsert;
