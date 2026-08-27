import { describe, expect, it } from "vitest";
import { headerNavigationItems } from "./Home";

describe("SPORTIX header navigation", () => {
  it("keeps topic navigation absent in English and Arabic headers", () => {
    expect(headerNavigationItems.english).toEqual([]);
    expect(headerNavigationItems.arabic).toEqual([]);
  });
});
