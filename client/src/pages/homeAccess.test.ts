import { describe, expect, it } from "vitest";
import { canBypassPartnerGateway, canEnterRegisteredUserSpace } from "./homeAccess";

describe("project admin home access", () => {
  it("allows only the confirmed project-admin role to bypass the partner gateway", () => {
    expect(canBypassPartnerGateway("admin")).toBe(true);
    expect(canBypassPartnerGateway("user")).toBe(false);
    expect(canBypassPartnerGateway(null)).toBe(false);
    expect(canBypassPartnerGateway(undefined)).toBe(false);
  });
});

describe("registered user home access", () => {
  it("lets every ordinary Manus user enter without a separate approval page", () => {
    expect(canEnterRegisteredUserSpace("user")).toBe(true);
    expect(canEnterRegisteredUserSpace("admin")).toBe(false);
    expect(canEnterRegisteredUserSpace(null)).toBe(false);
    expect(canEnterRegisteredUserSpace(undefined)).toBe(false);
  });
});
