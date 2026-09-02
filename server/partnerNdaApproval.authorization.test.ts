import { afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const db = vi.hoisted(() => ({ approvePartnerNdaApplication: vi.fn() }));
const mail = vi.hoisted(() => ({ sendPartnerNdaAccessRequestEmail: vi.fn(), sendPartnerNdaApprovalEmail: vi.fn(), sendPartnerPasswordResetEmail: vi.fn(), sendPartnerVerificationEmail: vi.fn() }));
vi.mock("./db", () => db);
vi.mock("./partnerEmail", () => mail);

import { appRouter } from "./routers";

describe("SPORTIX NDA approval authorization", () => {
  afterEach(() => vi.clearAllMocks());

  function administratorCaller() {
    const ctx: TrpcContext = { user: { id: 1, openId: "sportix-admin", name: "SPORTIX Administrator", email: "admin@sportixpartners.com", loginMethod: "manus", role: "admin", accessStatus: "approved", accessReviewedAt: null, accessReviewedBy: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.1" } } as TrpcContext["req"], res: { cookie: vi.fn(), clearCookie: vi.fn() } as TrpcContext["res"] };
    return appRouter.createCaller(ctx);
  }

  it("never lets a non-admin invoke an applicant approval action", async () => {
    const ctx: TrpcContext = { user: { id: 44, openId: "ordinary-user", name: "Applicant", email: "applicant@example.com", loginMethod: "manus", role: "user", accessStatus: "pending", accessReviewedAt: null, accessReviewedBy: null, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {}, socket: { remoteAddress: "203.0.113.99" } } as TrpcContext["req"], res: { cookie: vi.fn(), clearCookie: vi.fn() } as TrpcContext["res"] };
    await expect(appRouter.createCaller(ctx).ndaApproval.approve({ token: "a".repeat(43) })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(db.approvePartnerNdaApplication).not.toHaveBeenCalled();
  });

  it.each([
    "This approval request has expired.",
    "This approval request has expired or was already used.",
  ])("rejects an approval action that cannot be used again: %s", async message => {
    db.approvePartnerNdaApplication.mockRejectedValueOnce(new Error(message));
    await expect(administratorCaller().ndaApproval.approve({ token: "a".repeat(43) })).rejects.toMatchObject({ code: "BAD_REQUEST", message });
    expect(mail.sendPartnerNdaApprovalEmail).not.toHaveBeenCalled();
  });
});
