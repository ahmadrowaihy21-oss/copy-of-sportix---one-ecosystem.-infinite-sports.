import { afterEach, describe, expect, it } from "vitest";
import { enforceContactRateLimit, isHoneypotSubmission, resetContactRateLimitForTest } from "./routers";

describe("SPORTIX contact anti-spam controls", () => {
  afterEach(resetContactRateLimitForTest);

  it("identifies a populated hidden website field for no-op suppression", () => {
    expect(isHoneypotSubmission("")).toBe(false);
    expect(isHoneypotSubmission("https://spam.example")).toBe(true);
  });

  it("rejects a sixth attempt from the same address inside the fifteen-minute window", () => {
    const ip = "203.0.113.10";
    const now = 1_700_000_000_000;

    for (let attempt = 0; attempt < 5; attempt += 1) enforceContactRateLimit(ip, now + attempt);

    expect(() => enforceContactRateLimit(ip, now + 5)).toThrow("Please wait before sending another message.");
  });
});
