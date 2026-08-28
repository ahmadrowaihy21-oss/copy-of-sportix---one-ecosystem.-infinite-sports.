import { describe, expect, it } from "vitest";
import { canBypassPartnerGateway, canEnterApprovedUserSpace } from "./homeAccess";

describe("project admin home access", () => {
  it("allows only the confirmed project-admin role to bypass the partner gateway", () => {
    expect(canBypassPartnerGateway("admin")).toBe(true);
    expect(canBypassPartnerGateway("user")).toBe(false);
    expect(canBypassPartnerGateway(null)).toBe(false);
    expect(canBypassPartnerGateway(undefined)).toBe(false);
  });
});

describe("registered user home access", () => {
  it("requires an explicit administrator approval for ordinary users", () => {
    expect(canEnterApprovedUserSpace("user", "approved")).toBe(true);
    expect(canEnterApprovedUserSpace("user", "pending")).toBe(false);
    expect(canEnterApprovedUserSpace("user", "rejected")).toBe(false);
    expect(canEnterApprovedUserSpace("admin", "approved")).toBe(false);
  });
});
