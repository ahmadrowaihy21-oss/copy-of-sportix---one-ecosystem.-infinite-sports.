import { describe, expect, it } from "vitest";

describe("Resend secret readiness", () => {
  it.skipIf(!process.env.RESEND_API_KEY)("authenticates the configured Resend key", async () => {
    const response = await fetch("https://api.resend.com/domains?limit=1", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
    });
    expect(response.status).toBe(200);
  }, 20_000);
});
