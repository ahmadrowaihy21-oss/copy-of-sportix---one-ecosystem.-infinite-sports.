import { describe, expect, it } from "vitest";
import { shouldShowHeaderLogout } from "./Home";

describe("SPORTIX header logout visibility", () => {
  it("shows a logout control for either a project administrator or an authenticated partner", () => {
    expect(shouldShowHeaderLogout(true, false)).toBe(true);
    expect(shouldShowHeaderLogout(false, true)).toBe(true);
    expect(shouldShowHeaderLogout(false, false)).toBe(false);
  });
});
