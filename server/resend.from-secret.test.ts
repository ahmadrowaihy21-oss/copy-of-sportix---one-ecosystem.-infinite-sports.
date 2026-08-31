import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

const senderPattern = /^(?:[^<>]+\s*)?<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$|^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

describe("Resend sender configuration", () => {
  it("uses a valid sender address and an authenticated Resend key", async () => {
    expect(ENV.contactSenderEmail.trim()).toMatch(senderPattern);
    expect(ENV.resendApiKey.trim()).not.toBe("");

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${ENV.resendApiKey.trim()}` },
    });

    expect(response.ok).toBe(true);
  }, 20_000);
});
