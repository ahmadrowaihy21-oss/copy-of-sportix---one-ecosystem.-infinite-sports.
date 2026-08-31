import { describe, expect, it } from "vitest";
import { isActiveAccessStatus } from "./db";

describe("active membership status filter", () => {
  it("treats approved and active records as active access", () => {
    expect(isActiveAccessStatus("approved")).toBe(true);
    expect(isActiveAccessStatus("active")).toBe(true);
  });

  it("excludes records without active platform access", () => {
    expect(isActiveAccessStatus("email_unverified")).toBe(false);
    expect(isActiveAccessStatus("rejected")).toBe(false);
    expect(isActiveAccessStatus("suspended")).toBe(false);
  });
});
