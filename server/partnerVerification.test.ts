import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { hashPartnerVerificationCode } from "./partnerAuth";

const db = vi.hoisted(() => ({
  applyPartnerMembershipDecision: vi.fn(), consumePartnerVerificationRecord: vi.fn(), createPartnerSession: vi.fn(), createPartnerVerificationRecord: vi.fn(), createPendingPartnerAccount: vi.fn(), createContactMessage: vi.fn(), getActivePartnerSession: vi.fn(), getLatestPartnerVerificationRecord: vi.fn(), getPartnerAccountByEmail: vi.fn(), incrementPartnerVerificationAttempts: vi.fn(), listContactMessages: vi.fn(), listPartnerMembershipRequests: vi.fn(), markContactEmailAccepted: vi.fn(), markContactEmailFailed: vi.fn(), markPartnerEmailVerifiedPendingApproval: vi.fn(), markPartnerEmailVerifiedNdaPending: vi.fn(), refreshPendingPartnerAccount: vi.fn(), revokePartnerSession: vi.fn(), updatePartnerLastLogin: vi.fn(), updatePartnerMembershipStatus: vi.fn(), updateContactMessageStatus: vi.fn(), updatePartnerProfileImage: vi.fn(), requestPartnerMoreInformation: vi.fn(),
}));

vi.mock("./db", () => db);
vi.mock("./partnerEmail", () => ({ sendPartnerVerificationEmail: vi.fn() }));

import { appRouter } from "./routers";

const account = { id: 7, fullName: "Partner Test", email: "partner@example.com", mobileNumber: "+966501234567", passwordHash: "unused", companyName: null, jobTitle: null, status: "email_unverified" as const, emailVerifiedAt: null, lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() };

function caller() {
  const cookies: Array<{ name: string; value: string }> = [];
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.10" } } as TrpcContext["req"],
    res: { cookie: (name: string, value: string) => cookies.push({ name, value }), clearCookie: vi.fn() } as TrpcContext["res"],
  };
  return { api: appRouter.createCaller(ctx), cookies };
}

describe("SPORTIX Partners verification lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.getPartnerAccountByEmail.mockResolvedValue(account);
    db.consumePartnerVerificationRecord.mockResolvedValue(true);
  });

  it("rejects incorrect codes and records the failed attempt without moving the account to approval", async () => {
    db.getLatestPartnerVerificationRecord.mockResolvedValue({ id: 21, accountId: 7, codeHash: hashPartnerVerificationCode(7, "654321"), expiresAt: new Date(Date.now() + 60_000), usedAt: null, attempts: 0 });
    const { api } = caller();
    await expect(api.partnerAuth.verifyEmail({ email: account.email, code: "123456" })).rejects.toMatchObject({ message: "The verification code is incorrect." });
    expect(db.incrementPartnerVerificationAttempts).toHaveBeenCalledWith(21, 1);
    expect(db.markPartnerEmailVerifiedNdaPending).not.toHaveBeenCalled();
  });

  it("rejects expired and already-used codes", async () => {
    const { api } = caller();
    db.getLatestPartnerVerificationRecord.mockResolvedValue({ id: 22, accountId: 7, codeHash: hashPartnerVerificationCode(7, "123456"), expiresAt: new Date(Date.now() - 1), usedAt: null, attempts: 0 });
    await expect(api.partnerAuth.verifyEmail({ email: account.email, code: "123456" })).rejects.toMatchObject({ message: "This verification code is expired. Request a new code." });
    db.getLatestPartnerVerificationRecord.mockResolvedValue({ id: 23, accountId: 7, codeHash: hashPartnerVerificationCode(7, "123456"), expiresAt: new Date(Date.now() + 60_000), usedAt: new Date(), attempts: 0 });
    await expect(api.partnerAuth.verifyEmail({ email: account.email, code: "123456" })).rejects.toMatchObject({ message: "This verification code is expired. Request a new code." });
  });

  it("consumes a correct live code once and moves the account to NDA acceptance", async () => {
    db.getLatestPartnerVerificationRecord.mockResolvedValue({ id: 24, accountId: 7, codeHash: hashPartnerVerificationCode(7, "123456"), expiresAt: new Date(Date.now() + 60_000), usedAt: null, attempts: 0 });
    const { api, cookies } = caller();
    await expect(api.partnerAuth.verifyEmail({ email: account.email, code: "123456" })).resolves.toMatchObject({ success: true, account: { status: "nda_pending" } });
    expect(db.consumePartnerVerificationRecord).toHaveBeenCalledWith(24);
    expect(db.markPartnerEmailVerifiedNdaPending).toHaveBeenCalledWith(7);
    expect(db.createPartnerSession).toHaveBeenCalled();
    expect(cookies).toHaveLength(1);
  });

  it("recognizes an active partner session through its opaque cookie without exposing credential data", async () => {
    db.getActivePartnerSession.mockResolvedValue({ account: { ...account, status: "active" } });
    const { ctx } = (() => {
      const base = caller();
      return { ctx: {
        user: null,
        req: { protocol: "https", headers: { cookie: "__Host-sportix_partner_session=opaque-token" }, socket: { remoteAddress: "203.0.113.10" } },
        res: { cookie: vi.fn(), clearCookie: vi.fn() },
      } as TrpcContext };
    })();
    const result = await appRouter.createCaller(ctx).partnerAuth.session();
    expect(result).toMatchObject({ id: 7, email: account.email, status: "active" });
    expect(result).not.toHaveProperty("passwordHash");
  });
});
