import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { hashPartnerPassword } from "./partnerAuth";

const db = vi.hoisted(() => ({
  applyPartnerMembershipDecision: vi.fn(), applyRegisteredUserAccessDecision: vi.fn(), consumePartnerVerificationRecord: vi.fn(), createPartnerSession: vi.fn(), createPartnerVerificationRecord: vi.fn(), createPendingPartnerAccount: vi.fn(), createContactMessage: vi.fn(), getActivePartnerSession: vi.fn(), getLatestPartnerVerificationRecord: vi.fn(), getPartnerAccountByEmail: vi.fn(), incrementPartnerVerificationAttempts: vi.fn(), listContactMessages: vi.fn(), listPartnerMembershipRequests: vi.fn(), listRegisteredUsers: vi.fn(), markContactEmailAccepted: vi.fn(), markContactEmailFailed: vi.fn(), markPartnerEmailVerifiedPendingApproval: vi.fn(), refreshPendingPartnerAccount: vi.fn(), revokePartnerSession: vi.fn(), updatePartnerLastLogin: vi.fn(), updatePartnerProfileImage: vi.fn(), updateContactMessageStatus: vi.fn(),
}));
vi.mock("./db", () => db);
vi.mock("./partnerEmail", () => ({ sendPartnerVerificationEmail: vi.fn() }));

import { appRouter } from "./routers";

function caller() {
  const ctx: TrpcContext = { user: null, req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.20" } } as TrpcContext["req"], res: { cookie: vi.fn(), clearCookie: vi.fn() } as TrpcContext["res"] };
  return appRouter.createCaller(ctx);
}

function administratorCaller() {
  const ctx: TrpcContext = {
    user: {
      id: 1,
      openId: "sportix-demo-admin",
      name: "SPORTIX Project Administrator",
      email: "admin@sportix.test",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.20" } } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

describe("SPORTIX Partner membership access", () => {
  it("allows a Manus administrator to read protected membership records", async () => {
    db.listPartnerMembershipRequests.mockResolvedValue([]);

    await expect(administratorCaller().membership.list({ status: "approved" })).resolves.toEqual([]);
    expect(db.listPartnerMembershipRequests).toHaveBeenCalledWith("approved");
  });

  it("allows only a Manus administrator to manage registered-user access", async () => {
    db.listRegisteredUsers.mockResolvedValue([]);

    await expect(administratorCaller().userAccess.list({ status: "pending" })).resolves.toEqual([]);
    await expect(caller().userAccess.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.listRegisteredUsers).toHaveBeenCalledWith("pending");
  });

  it.each([
    ["rejected", "This membership request was not approved."],
    ["suspended", "This membership is suspended."],
    ["disabled", "This account is disabled."],
  ] as const)("blocks %s accounts server-side at login", async (status, message) => {
    db.getPartnerAccountByEmail.mockResolvedValue({ id: 22, fullName: "Membership Test", email: "member@example.com", mobileNumber: "+966501234500", passwordHash: await hashPartnerPassword("Membership_Test_Password"), companyName: null, jobTitle: null, status, emailVerifiedAt: new Date(), lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() });
    await expect(caller().partnerAuth.login({ email: "member@example.com", password: "Membership_Test_Password" })).rejects.toMatchObject({ code: "FORBIDDEN", message });
    expect(db.createPartnerSession).not.toHaveBeenCalled();
  });

  it("allows a verified pending membership to sign in immediately", async () => {
    db.getPartnerAccountByEmail.mockResolvedValue({ id: 23, fullName: "Immediate Partner", email: "immediate@example.com", mobileNumber: null, passwordHash: await hashPartnerPassword("Membership_Test_Password"), companyName: null, jobTitle: null, status: "pending_approval", emailVerifiedAt: new Date(), lastLoginAt: null, createdAt: new Date(), updatedAt: new Date() });
    await expect(caller().partnerAuth.login({ email: "immediate@example.com", password: "Membership_Test_Password" })).resolves.toMatchObject({ success: true, account: { status: "pending_approval" } });
    expect(db.createPartnerSession).toHaveBeenCalled();
  });
});
