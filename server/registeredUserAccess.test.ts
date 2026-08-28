import { describe, expect, it } from "vitest";
import { canEnterRegisteredUserSpace, isRegisteredUserAccessStatus } from "./registeredUserAccess";

describe("registered user access policy", () => {
  it("grants private entry to every ordinary user regardless of legacy access status", () => {
    expect(canEnterRegisteredUserSpace("user", "approved")).toBe(true);
    expect(canEnterRegisteredUserSpace("user", "pending")).toBe(true);
    expect(canEnterRegisteredUserSpace("user", "rejected")).toBe(true);
    expect(canEnterRegisteredUserSpace("admin", "approved")).toBe(false);
  });

  it("recognises only persisted access statuses", () => {
    expect(isRegisteredUserAccessStatus("pending")).toBe(true);
    expect(isRegisteredUserAccessStatus("active")).toBe(false);
  });
});
