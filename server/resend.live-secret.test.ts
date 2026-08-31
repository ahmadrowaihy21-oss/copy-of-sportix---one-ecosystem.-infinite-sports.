import { describe, expect, it } from "vitest";

describe("Resend live configuration", () => {
  it("accepts the configured API key without sending an email", async () => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    expect(apiKey, "RESEND_API_KEY must be provided for the live credential check").toBeTruthy();

    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    expect(response.status).toBe(200);
    const body = await response.json() as { object?: string; data?: unknown[] };
    expect(body.object).toBe("list");
    expect(Array.isArray(body.data)).toBe(true);
  }, 15000);
});
