import { describe, expect, it } from "vitest";

describe("Resend contact-delivery credentials", () => {
  it.skipIf(!process.env.RESEND_API_KEY)("authenticates with Resend before contact notifications are enabled", async () => {
    const apiKey = process.env.RESEND_API_KEY;
    expect(apiKey, "RESEND_API_KEY must be configured").toBeTruthy();

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    expect(response.status, "Resend credentials must authenticate successfully").toBe(200);
  }, 30_000);
});
