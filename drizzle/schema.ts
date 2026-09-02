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
  accessStatus: mysqlEnum("accessStatus", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  accessReviewedAt: timestamp("accessReviewedAt"),
  accessReviewedBy: int("accessReviewedBy"),
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
  mobileNumber: varchar("mobileNumber", { length: 32 }).notNull(),
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
  status: mysqlEnum("status", ["active", "disabled", "email_unverified", "pending_nda", "pending_approval", "approved", "rejected", "suspended"]).default("email_unverified").notNull(),
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

/** Signed NDA metadata for each access application. The PDF bytes stay in private object storage. */
export const partnerNdaApplications = mysqlTable("partner_nda_applications", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("accountId").notNull().unique(),
  ndaFileKey: varchar("ndaFileKey", { length: 512 }).notNull(),
  ndaFileName: varchar("ndaFileName", { length: 255 }).notNull(),
  ndaFileSize: int("ndaFileSize").notNull(),
  ndaStatus: mysqlEnum("ndaStatus", ["pending", "approved"]).default("pending").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["pending_approval", "approved"]).default("pending_approval").notNull(),
  accessStatus: mysqlEnum("accessStatus", ["not_granted", "granted"]).default("not_granted").notNull(),
  adminNotificationEmailId: varchar("adminNotificationEmailId", { length: 128 }),
  applicantApprovalEmailId: varchar("applicantApprovalEmailId", { length: 128 }),
  approvalEmailStatus: mysqlEnum("approvalEmailStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
  approvalEmailError: varchar("approvalEmailError", { length: 500 }),
  approvedAt: timestamp("approvedAt"),
  approvedBy: int("approvedBy"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Opaque, single-use approval actions. Only a hash is persisted. */
export const partnerNdaApprovalLinks = mysqlTable("partner_nda_approval_links", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
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

/** Password-reset OTP records. Only digests are stored; codes are short-lived and single-use. */
export const partnerPasswordResetCodes = mysqlTable("partner_password_reset_codes", {
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

export type PartnerAccount = typeof partnerAccounts.$inferSelect;
export type InsertPartnerAccount = typeof partnerAccounts.$inferInsert;
export type PartnerNdaApplication = typeof partnerNdaApplications.$inferSelect;
export type InsertPartnerNdaApplication = typeof partnerNdaApplications.$inferInsert;
