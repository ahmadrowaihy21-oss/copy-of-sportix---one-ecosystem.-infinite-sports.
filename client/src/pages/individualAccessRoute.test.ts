import { describe, expect, it } from "vitest";
import { isAdminPath, isPartnerGatewayPath } from "./individualAccessRoute";

describe("individual access routing", () => {
  it("keeps the partner gateway explicit while sending other visitor paths to individual access", () => {
    expect(isPartnerGatewayPath("/partner-access")).toBe(true);
    expect(isPartnerGatewayPath("/")).toBe(false);
    expect(isPartnerGatewayPath("/profile")).toBe(false);
  });

  it("identifies protected administrator paths", () => {
    expect(isAdminPath("/admin/memberships")).toBe(true);
    expect(isAdminPath("/admin/inquiries")).toBe(true);
    expect(isAdminPath("/partner-access")).toBe(false);
  });
});
