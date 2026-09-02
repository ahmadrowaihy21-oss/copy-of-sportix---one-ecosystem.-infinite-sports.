import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const db = vi.hoisted(() => ({
  applyPartnerMembershipDecision: vi.fn(),
  createPartnerNdaApprovalLink: vi.fn(),
  consumePartnerVerificationRecord: vi.fn(),
  createPartnerSession: vi.fn(),
  createPartnerVerificationRecord: vi.fn(),
  createPendingPartnerAccount: vi.fn(),
  createContactMessage: vi.fn(),
  getActivePartnerSession: vi.fn(),
  getLatestPartnerVerificationRecord: vi.fn(),
  getPartnerNdaApplicationForAdminResend: vi.fn(),
  getPartnerAccountByEmail: vi.fn(),
  incrementPartnerVerificationAttempts: vi.fn(),
  listContactMessages: vi.fn(),
  listPartnerMembershipRequests: vi.fn(),
  markContactEmailAccepted: vi.fn(),
  markContactEmailFailed: vi.fn(),
  markPartnerEmailVerifiedActive: vi.fn(),
  recordPartnerNdaAdminNotification: vi.fn(),
  refreshPendingPartnerAccount: vi.fn(),
  revokePartnerSession: vi.fn(),
  updatePartnerLastLogin: vi.fn(),
  updatePartnerProfileImage: vi.fn(),
  updateContactMessageStatus: vi.fn(),
}));
const mail = vi.hoisted(() => ({ sendPartnerNdaAccessRequestEmail: vi.fn(), sendPartnerNdaApprovalEmail: vi.fn(), sendPartnerPasswordResetEmail: vi.fn(), sendPartnerVerificationEmail: vi.fn() }));

vi.mock("./db", () => db);
vi.mock("./partnerEmail", () => mail);

import { appRouter } from "./routers";

function caller(role: "admin" | "user" | null) {
  const user = role ? { id: 41, openId: "sportix-admin", name: "SPORTIX Owner", email: "owner@sportixpartners.com", loginMethod: null, role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() } : null;
  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.5" } } as TrpcContext["req"],
    res: { cookie: vi.fn(), clearCookie: vi.fn() } as TrpcContext["res"],
  };
  return appRouter.createCaller(ctx);
}

describe("SPORTIX membership administration", () => {
  it("rejects membership list access for non-admin callers", async () => {
    await expect(caller(null).membership.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller("user").membership.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("refuses manual approvals so access can only be granted through a signed-NDA link", async () => {
    await expect(caller("admin").membership.decide({ accountId: 17, decision: "approve", note: "Verified partner profile." })).rejects.toMatchObject({ code: "BAD_REQUEST", message: "Approve access through the signed-NDA approval link only." });
    expect(db.applyPartnerMembershipDecision).not.toHaveBeenCalled();
  });

  it("allows an administrator to resend a fresh secure NDA alert for a pending applicant", async () => {
    db.getPartnerNdaApplicationForAdminResend.mockResolvedValue({ application: { id: 75, ndaStatus: "pending", accountStatus: "pending_approval", accessStatus: "not_granted" }, account: { fullName: "Applicant Example", companyName: "Example Co", jobTitle: "Sports Director", email: "applicant@example.com", mobileNumber: "+966501234567" } });
    db.createPartnerNdaApprovalLink.mockResolvedValue({ id: 22 });
    mail.sendPartnerNdaAccessRequestEmail.mockResolvedValue({ id: "resend_nda_admin_alert" });

    await expect(caller("admin").membership.resendNdaAlert({ accountId: 17 })).resolves.toEqual({ success: true });
    expect(db.createPartnerNdaApprovalLink).toHaveBeenCalledWith(expect.objectContaining({ applicationId: 75, tokenHash: expect.any(String), expiresAt: expect.any(Date) }));
    expect(mail.sendPartnerNdaAccessRequestEmail).toHaveBeenCalledWith(expect.objectContaining({ viewNdaUrl: expect.stringMatching(/^https:\/\/www\.sportixpartners\.com\/admin\/nda-review\?t=/), approveUrl: expect.stringMatching(/^https:\/\/www\.sportixpartners\.com\/admin\/nda-approve\?t=/) }));
    expect(db.recordPartnerNdaAdminNotification).toHaveBeenCalledWith(75, "resend_nda_admin_alert");
  });
});
