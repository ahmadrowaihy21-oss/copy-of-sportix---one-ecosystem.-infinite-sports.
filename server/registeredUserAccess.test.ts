import { describe, expect, it } from "vitest";
import { canEnterRegisteredUserSpace, isRegisteredUserAccessStatus } from "./registeredUserAccess";

describe("registered user access policy", () => {
  it("only grants the private entry to approved ordinary users", () => {
    expect(canEnterRegisteredUserSpace("user", "approved")).toBe(true);
    expect(canEnterRegisteredUserSpace("user", "pending")).toBe(false);
    expect(canEnterRegisteredUserSpace("user", "rejected")).toBe(false);
    expect(canEnterRegisteredUserSpace("admin", "approved")).toBe(false);
  });

  it("recognises only persisted access statuses", () => {
    expect(isRegisteredUserAccessStatus("pending")).toBe(true);
    expect(isRegisteredUserAccessStatus("active")).toBe(false);
  });
});
