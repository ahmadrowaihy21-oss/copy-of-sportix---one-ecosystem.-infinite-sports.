import { describe, expect, it } from "vitest";
import { DEMO_PARTNER_EMAIL, createApprovedDemoPartner } from "./demoAccounts";

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
});
