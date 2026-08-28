import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { parse as parseCookie } from "cookie";
import {
  applyPartnerMembershipDecision,
  consumePartnerVerificationRecord,
  createPartnerSession,
  createPartnerVerificationRecord,
  createPendingPartnerAccount,
  createContactMessage,
  getActivePartnerSession,
  getLatestPartnerVerificationRecord,
  getPartnerAccountByEmail,
  incrementPartnerVerificationAttempts,
  listPartnerMembershipRequests,
  listContactMessages,
  markContactEmailAccepted,
  markContactEmailFailed,
  refreshPendingPartnerAccount,
  revokePartnerSession,
  updatePartnerLastLogin,
  requestPartnerMoreInformation,
  markPartnerEmailVerifiedActive,
  updatePartnerProfileImage,
  updateContactMessageStatus,
  applyRegisteredUserAccessDecision,
  listRegisteredUsers,
} from "./db";
import { ENV } from "./_core/env";
import { MAX_VERIFICATION_ATTEMPTS, PARTNER_SESSION_COOKIE, PARTNER_SESSION_TTL_MS, PARTNER_VERIFICATION_TTL_MS, createPartnerSessionToken, createPartnerVerificationCode, hashPartnerSessionToken, hashPartnerVerificationCode, hashPartnerPassword, normalizePartnerEmail, verifyPartnerPassword } from "./partnerAuth";
import { sendPartnerVerificationEmail } from "./partnerEmail";
import { storePartnerProfileImage } from "./profileImage";
import { sendSportixContactEmail } from "./resend";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const contactInput = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(160),
  contactEmail: z.string().trim().email("Enter a valid email address").max(320),
  mobileNumber: z.string().trim().min(7, "Mobile number is required").max(32).regex(/^\+?[0-9][0-9\s().-]{5,30}$/, "Enter a valid mobile number"),
  companyName: z.string().trim().min(2, "Company name is required").max(200),
  jobTitle: z.string().trim().min(2, "Job title is required").max(160),
  subject: z.string().trim().min(3, "Subject is required").max(220),
  message: z.string().trim().min(10, "Please enter a short message").max(5000),
  language: z.enum(["en", "ar"]).default("en"),
  website: z.string().max(200).optional(),
});

const contactStatuses = z.enum(["new", "reviewed", "responded"]);
const recentContactAttempts = new Map<string, number[]>();
const recentPartnerEmailAttempts = new Map<string, number[]>();
export const partnerSignupInput = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(160),
  email: z.string().trim().email("Enter a valid email address").max(320),
  mobileNumber: z.string().trim().max(32).regex(/^$|^\+?[0-9][0-9\s().-]{5,30}$/, "Enter a valid mobile number").optional(),
  password: z.string().min(12, "Password must contain at least 12 characters").max(128),
  companyName: z.string().trim().max(200).optional(),
  jobTitle: z.string().trim().max(160).optional(),
  age: z.number().int().min(13, "You must be at least 13 years old").max(120, "Enter a valid age"),
  gender: z.enum(["male", "female"]),
  weeklySportFrequency: z.enum(["0", "1-2", "3-4", "5+"]),
  currentSports: z.string().trim().min(2, "Tell us which sports you currently practice").max(1000),
  aspirationalSport: z.string().trim().min(2, "Tell us which sport you would like to practice").max(160),
  sportsChallenges: z.string().trim().min(10, "Tell us which sports challenges should be solved").max(3000),
  sportsSolutionIdea: z.string().trim().min(10, "Tell us about your sports solution idea").max(3000),
  profileImage: z.object({ base64: z.string().min(4).max(2_900_000), mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]) }).optional(),
});
const partnerLoginInput = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) });
const partnerVerificationInput = z.object({ email: z.string().trim().email(), code: z.string().regex(/^\d{6}$/, "Enter the six-digit verification code") });

function getClientIp(forwardedFor: string | string[] | undefined, fallbackIp?: string) {
  const forwarded = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
  return forwarded?.split(",")[0]?.trim() || fallbackIp || "unknown";
}

export function isHoneypotSubmission(website?: string) {
  return Boolean(website?.trim());
}

export function enforceContactRateLimit(ip: string, now = Date.now()) {
  const windowMs = 15 * 60 * 1_000;
  const attempts = (recentContactAttempts.get(ip) ?? []).filter(timestamp => now - timestamp < windowMs);

  if (attempts.length >= 5) {
    recentContactAttempts.set(ip, attempts);
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait before sending another message." });
  }

  attempts.push(now);
  recentContactAttempts.set(ip, attempts);
}

export function resetContactRateLimitForTest() {
  recentContactAttempts.clear();
}

function enforcePartnerEmailRateLimit(email: string, now = Date.now()) {
  const windowMs = 15 * 60 * 1_000;
  const attempts = (recentPartnerEmailAttempts.get(email) ?? []).filter(timestamp => now - timestamp < windowMs);
  if (attempts.length >= 3) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait before requesting another verification code." });
  attempts.push(now);
  recentPartnerEmailAttempts.set(email, attempts);
}

function readPartnerSessionToken(cookieHeader?: string) {
  return parseCookie(cookieHeader ?? "")[PARTNER_SESSION_COOKIE];
}

function publicPartnerAccount(account: { id: number; fullName: string; email: string; status: "pending" | "active" | "disabled" | "email_unverified" | "nda_pending" | "company_authority_pending" | "company_nda_pending" | "pending_approval" | "pending_admin_approval" | "approved" | "rejected" | "suspended"; companyName: string | null; jobTitle: string | null; age?: number | null; gender?: "male" | "female" | null; weeklySportFrequency?: "0" | "1-2" | "3-4" | "5+" | null; currentSports?: string | null; aspirationalSport?: string | null; sportsChallenges?: string | null; sportsSolutionIdea?: string | null; profileImageUrl?: string | null }) {
  return { id: account.id, fullName: account.fullName, email: account.email, status: account.status, companyName: account.companyName, jobTitle: account.jobTitle, age: account.age ?? null, gender: account.gender ?? null, weeklySportFrequency: account.weeklySportFrequency ?? null, currentSports: account.currentSports ?? null, aspirationalSport: account.aspirationalSport ?? null, sportsChallenges: account.sportsChallenges ?? null, sportsSolutionIdea: account.sportsSolutionIdea ?? null, profileImageUrl: account.profileImageUrl ?? null };
}

async function issuePartnerSession(accountId: number, ctx: { req: Parameters<typeof getSessionCookieOptions>[0]; res: { cookie: (name: string, value: string, options: Record<string, unknown>) => unknown } }) {
  const token = createPartnerSessionToken();
  await createPartnerSession({ accountId, tokenHash: hashPartnerSessionToken(token), expiresAt: new Date(Date.now() + PARTNER_SESSION_TTL_MS) });
  ctx.res.cookie(PARTNER_SESSION_COOKIE, token, { ...getSessionCookieOptions(ctx.req), maxAge: PARTNER_SESSION_TTL_MS });
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  userAccess: router({
    list: adminProcedure
      .input(z.object({ status: z.enum(["pending", "approved", "rejected", "suspended"]).optional() }).optional())
      .query(({ input }) => listRegisteredUsers(input?.status)),
    decide: adminProcedure
      .input(z.object({ userId: z.number().int().positive(), decision: z.enum(["approve", "reject", "suspend"]) }))
      .mutation(async ({ input, ctx }) => {
        const nextStatus = input.decision === "approve" ? "approved" : input.decision === "reject" ? "rejected" : "suspended";
        try {
          const result = await applyRegisteredUserAccessDecision({ userId: input.userId, nextStatus, actorUserId: ctx.user.id });
          return { success: true, ...result } as const;
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "User access decision could not be applied." });
        }
      }),
  }),
  partnerAuth: router({
    session: publicProcedure.query(async ({ ctx }) => {
      const token = readPartnerSessionToken(ctx.req.headers.cookie);
      if (!token) return null;
      const session = await getActivePartnerSession(hashPartnerSessionToken(token));
      return session ? publicPartnerAccount(session.account) : null;
    }),
    signUp: publicProcedure.input(partnerSignupInput).mutation(async ({ input, ctx }) => {
      const email = normalizePartnerEmail(input.email);
      enforcePartnerEmailRateLimit(email);
      const existing = await getPartnerAccountByEmail(email);
      if (existing?.status === "active" || existing?.status === "pending_approval") throw new TRPCError({ code: "CONFLICT", message: "An account already exists for this email. Please log in or wait for membership approval." });
      const accountValues = {
        fullName: input.fullName.trim(), email, mobileNumber: input.mobileNumber?.trim() || null, passwordHash: await hashPartnerPassword(input.password),
        companyName: input.companyName?.trim() || null, jobTitle: input.jobTitle?.trim() || null,
        age: input.age, gender: input.gender, weeklySportFrequency: input.weeklySportFrequency,
        currentSports: input.currentSports.trim(), aspirationalSport: input.aspirationalSport.trim(), sportsChallenges: input.sportsChallenges.trim(), sportsSolutionIdea: input.sportsSolutionIdea.trim(),
      };
      const accountId = existing ? existing.id : (await createPendingPartnerAccount(accountValues)).id;
      if (existing) await refreshPendingPartnerAccount(accountId, accountValues);
      if (input.profileImage) {
        try {
          const image = await storePartnerProfileImage(accountId, input.profileImage);
          await updatePartnerProfileImage(accountId, image);
        } catch (error) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Profile image could not be saved." });
        }
      }
      const code = createPartnerVerificationCode();
      const emailResult = await sendPartnerVerificationEmail({ email, fullName: accountValues.fullName, code });
      await createPartnerVerificationRecord({ accountId, codeHash: hashPartnerVerificationCode(accountId, code), expiresAt: new Date(Date.now() + PARTNER_VERIFICATION_TTL_MS), requestIp: getClientIp(ctx.req.headers["x-forwarded-for"], ctx.req.socket.remoteAddress), resendEmailId: emailResult.id });
      return { success: true, email } as const;
    }),
    resendCode: publicProcedure.input(z.object({ email: z.string().trim().email() })).mutation(async ({ input, ctx }) => {
      const email = normalizePartnerEmail(input.email);
      enforcePartnerEmailRateLimit(email);
      const account = await getPartnerAccountByEmail(email);
      if (!account || account.status !== "email_unverified") throw new TRPCError({ code: "BAD_REQUEST", message: "An email verification request was not found for this account." });
      const code = createPartnerVerificationCode();
      const emailResult = await sendPartnerVerificationEmail({ email, fullName: account.fullName, code });
      await createPartnerVerificationRecord({ accountId: account.id, codeHash: hashPartnerVerificationCode(account.id, code), expiresAt: new Date(Date.now() + PARTNER_VERIFICATION_TTL_MS), requestIp: getClientIp(ctx.req.headers["x-forwarded-for"], ctx.req.socket.remoteAddress), resendEmailId: emailResult.id });
      return { success: true } as const;
    }),
    verifyEmail: publicProcedure.input(partnerVerificationInput).mutation(async ({ input, ctx }) => {
      const email = normalizePartnerEmail(input.email);
      const account = await getPartnerAccountByEmail(email);
      if (!account || account.status !== "email_unverified") throw new TRPCError({ code: "BAD_REQUEST", message: "This verification request is no longer available." });
      const record = await getLatestPartnerVerificationRecord(account.id);
      if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) throw new TRPCError({ code: "BAD_REQUEST", message: "This verification code is expired. Request a new code." });
      if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many incorrect attempts. Request a new code." });
      if (record.codeHash !== hashPartnerVerificationCode(account.id, input.code)) {
        await incrementPartnerVerificationAttempts(record.id, record.attempts + 1);
        throw new TRPCError({ code: "BAD_REQUEST", message: "The verification code is incorrect." });
      }
      if (!await consumePartnerVerificationRecord(record.id)) throw new TRPCError({ code: "BAD_REQUEST", message: "This verification code has already been used." });
      await markPartnerEmailVerifiedActive(account.id);
      await issuePartnerSession(account.id, ctx);
      return { success: true, account: publicPartnerAccount({ ...account, status: "active" }) } as const;
    }),
    login: publicProcedure.input(partnerLoginInput).mutation(async ({ input, ctx }) => {
      const account = await getPartnerAccountByEmail(normalizePartnerEmail(input.email));
      const valid = account ? await verifyPartnerPassword(input.password, account.passwordHash) : false;
      if (!account || !valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      const blockedStatuses = ["email_unverified", "rejected", "suspended", "disabled"] as const;
      if (blockedStatuses.includes(account.status as typeof blockedStatuses[number])) {
        const message = account.status === "rejected" ? "This membership request was not approved." : account.status === "suspended" ? "This membership is suspended." : account.status === "disabled" ? "This account is disabled." : "Verify your email before logging in.";
        throw new TRPCError({ code: "FORBIDDEN", message });
      }
      await updatePartnerLastLogin(account.id);
      await issuePartnerSession(account.id, ctx);
      return { success: true, account: publicPartnerAccount(account) } as const;
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const token = readPartnerSessionToken(ctx.req.headers.cookie);
      if (token) await revokePartnerSession(hashPartnerSessionToken(token));
      ctx.res.clearCookie(PARTNER_SESSION_COOKIE, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  membership: router({
    list: adminProcedure.input(z.object({ status: z.enum(["pending", "active", "disabled", "email_unverified", "nda_pending", "company_authority_pending", "company_nda_pending", "pending_approval", "pending_admin_approval", "approved", "rejected", "suspended"]).optional() }).optional()).query(({ input }) => listPartnerMembershipRequests(input?.status)),
    decide: adminProcedure.input(z.object({ accountId: z.number().int().positive(), decision: z.enum(["approve", "reject", "suspend"]), accessLevel: z.enum(["level_1", "level_2", "level_3"]).optional(), note: z.string().trim().max(500).optional() })).mutation(async ({ input, ctx }) => {
      const nextStatus = input.decision === "approve" ? "approved" : input.decision === "reject" ? "rejected" : "suspended";
      try {
        const result = await applyPartnerMembershipDecision({ accountId: input.accountId, nextStatus, accessLevel: input.accessLevel, actorUserId: ctx.user.id, note: input.note });
        return { success: true, ...result } as const;
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Membership decision could not be applied." });
      }
    }),
    requestMoreInformation: adminProcedure.input(z.object({ accountId: z.number().int().positive(), note: z.string().trim().min(4).max(2_000) })).mutation(async ({ input, ctx }) => {
      await requestPartnerMoreInformation(input.accountId, input.note);
      return { success: true } as const;
    }),
  }),
  contact: router({
    submit: publicProcedure.input(contactInput).mutation(async ({ input, ctx }) => {
      const requestIp = getClientIp(ctx.req.headers["x-forwarded-for"], ctx.req.socket.remoteAddress);

      // Honeypot submissions receive no email or database write, preventing bot amplification.
      if (isHoneypotSubmission(input.website)) {
        return { success: true, contactId: 0, emailId: "" } as const;
      }

      enforceContactRateLimit(requestIp);

      const contact = await createContactMessage({
        fullName: input.fullName,
        contactEmail: input.contactEmail,
        mobileNumber: input.mobileNumber,
        companyName: input.companyName,
        jobTitle: input.jobTitle,
        subject: input.subject,
        message: input.message,
        language: input.language,
        emailDeliveryStatus: "pending",
        senderEmail: ENV.contactSenderEmail.trim() || null,
        recipientEmail: ENV.contactRecipientEmail.trim() || null,
        requestIp,
      });

      try {
        const email = await sendSportixContactEmail({ ...input, contactId: contact.id });
        await markContactEmailAccepted(contact.id, email.id);
        return { success: true, contactId: contact.id, emailId: email.id } as const;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Resend delivery failure";
        await markContactEmailFailed(contact.id, message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Contact delivery failed. Please try again later." });
      }
    }),
    list: adminProcedure
      .input(z.object({ status: contactStatuses.optional() }).optional())
      .query(({ input }) => listContactMessages(input?.status)),
    updateStatus: adminProcedure
      .input(z.object({ id: z.number().int().positive(), status: contactStatuses }))
      .mutation(async ({ input }) => {
        await updateContactMessageStatus(input.id, input.status);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
