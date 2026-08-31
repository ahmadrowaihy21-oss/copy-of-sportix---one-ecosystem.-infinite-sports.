import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

const mailboxPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

describe("SPORTIX contact recipient configuration", () => {
  it("uses a valid recipient mailbox with an authenticated Resend configuration", async () => {
    expect(ENV.contactRecipientEmail.trim()).toMatch(mailboxPattern);
    expect(ENV.resendApiKey.trim()).not.toBe("");

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${ENV.resendApiKey.trim()}` },
    });

    expect(response.ok).toBe(true);
  }, 20_000);
});
