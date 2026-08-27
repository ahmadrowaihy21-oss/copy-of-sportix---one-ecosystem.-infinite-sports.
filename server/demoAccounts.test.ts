import { describe, expect, it } from "vitest";
import { DEMO_APPLICANT_EMAIL, DEMO_PARTNER_EMAIL, createApprovedDemoPartner, createPendingDemoApplicant } from "./demoAccounts";

describe("demo account seed data", () => {
  it("creates an email-verified approved partner with basic access", () => {
    const account = createApprovedDemoPartner("scrypt$test$hash");

    expect(account).toMatchObject({
      email: DEMO_PARTNER_EMAIL,
      passwordHash: "scrypt$test$hash",
      status: "approved",
      emailVerified: true,
      verificationStatus: "verified",
      accessLevel: "level_1",
    });
  });

  it("creates an email-verified request that can be reviewed by an administrator", () => {
    const account = createPendingDemoApplicant("scrypt$test$hash");

    expect(account).toMatchObject({
      email: DEMO_APPLICANT_EMAIL,
      status: "pending_approval",
      emailVerified: true,
      verificationStatus: "verified",
      accessLevel: "level_1",
    });
  });
});
