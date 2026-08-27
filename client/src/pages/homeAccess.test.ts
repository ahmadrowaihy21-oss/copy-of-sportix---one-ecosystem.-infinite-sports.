import { describe, expect, it } from "vitest";
import { canBypassPartnerGateway } from "./homeAccess";

describe("project admin home access", () => {
  it("allows only the confirmed project-admin role to bypass the partner gateway", () => {
    expect(canBypassPartnerGateway("admin")).toBe(true);
    expect(canBypassPartnerGateway("user")).toBe(false);
    expect(canBypassPartnerGateway(null)).toBe(false);
    expect(canBypassPartnerGateway(undefined)).toBe(false);
  });
});
