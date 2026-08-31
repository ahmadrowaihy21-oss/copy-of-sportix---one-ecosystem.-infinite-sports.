import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const db = vi.hoisted(() => ({
  applyPartnerMembershipDecision: vi.fn(),
  consumePartnerVerificationRecord: vi.fn(),
  createPartnerSession: vi.fn(),
  createPartnerVerificationRecord: vi.fn(),
  createPendingPartnerAccount: vi.fn(),
  createContactMessage: vi.fn(),
  getActivePartnerSession: vi.fn(),
  getLatestPartnerVerificationRecord: vi.fn(),
  getPartnerAccountByEmail: vi.fn(),
  incrementPartnerVerificationAttempts: vi.fn(),
  listContactMessages: vi.fn(),
  listPartnerMembershipRequests: vi.fn(),
  markContactEmailAccepted: vi.fn(),
  markContactEmailFailed: vi.fn(),
  markPartnerEmailVerifiedActive: vi.fn(),
  refreshPendingPartnerAccount: vi.fn(),
  revokePartnerSession: vi.fn(),
  updatePartnerLastLogin: vi.fn(),
  updatePartnerProfileImage: vi.fn(),
  updateContactMessageStatus: vi.fn(),
}));

vi.mock("./db", () => db);
vi.mock("./partnerEmail", () => ({ sendPartnerVerificationEmail: vi.fn() }));

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

  it("records a protected approval decision with the authenticated administrator", async () => {
    db.applyPartnerMembershipDecision.mockResolvedValue({ previousStatus: "active", nextStatus: "approved" });
    await expect(caller("admin").membership.decide({ accountId: 17, decision: "approve", note: "Verified partner profile." })).resolves.toMatchObject({ success: true, nextStatus: "approved" });
    expect(db.applyPartnerMembershipDecision).toHaveBeenCalledWith({ accountId: 17, nextStatus: "approved", actorUserId: 41, note: "Verified partner profile." });
  });
});
