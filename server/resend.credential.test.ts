import { describe, expect, it } from "vitest";

describe("Resend credential readiness", () => {
  it.skipIf(!process.env.RESEND_API_KEY)("authenticates a lightweight domain-list request without exposing the key", async () => {
    const apiKey = process.env.RESEND_API_KEY;

    expect(apiKey).toBeTruthy();

    const response = await fetch("https://api.resend.com/domains?limit=1", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "sportix-contact-readiness/1.0",
      },
    });

    expect(response.status).toBe(200);
  }, 20_000);
});
