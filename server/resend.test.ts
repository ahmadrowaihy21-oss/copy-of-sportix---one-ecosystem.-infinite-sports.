import { afterEach, describe, expect, it, vi } from "vitest";

describe("SPORTIX Resend contact delivery", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("sends a server-side HTML and text notification and returns Resend's acceptance ID", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_contact_key");
    vi.stubEnv("CONTACT_SENDER_EMAIL", "contact@sportixpartners.com");
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "sportixpartners@gmail.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email_accepted_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { sendSportixContactEmail } = await import("./resend");
    await expect(sendSportixContactEmail({
      contactId: 42,
      fullName: "Ahmad Rowaihy",
      contactEmail: "ahmad@example.com",
      mobileNumber: "+966501234567",
      companyName: "SPORTIX",
      jobTitle: "Founder",
      subject: "Strategic partnership",
      message: "I would like to discuss a strategic sports partnership.",
      language: "en",
    })).resolves.toEqual({ id: "email_accepted_123" });

    expect(fetchMock).toHaveBeenCalledWith("https://api.resend.com/emails", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ "Idempotency-Key": "sportix-contact-42", "User-Agent": "sportix-contact-service/1.0" }),
    }));
    const requestBody = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string);
    expect(requestBody.from).toBe("SPORTIX Contact <contact@sportixpartners.com>");
    expect(requestBody.reply_to).toBe("ahmad@example.com");
    expect(requestBody.text).toContain("Mobile: +966501234567");
    expect(requestBody.html).toContain("New website inquiry");
    expect(requestBody.html).toContain("ahmad@example.com");
  });

  it("preserves a configured display-name sender without nested angle brackets", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_contact_key");
    vi.stubEnv("CONTACT_SENDER_EMAIL", "SPORTIX <contact@sportixpartners.com>");
    vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "sportixpartners@gmail.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "email_accepted_456" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { sendSportixContactEmail } = await import("./resend");
    await sendSportixContactEmail({
      contactId: 43,
      fullName: "Test User",
      contactEmail: "test@example.com",
      mobileNumber: "+966501234567",
      companyName: "SPORTIX",
      jobTitle: "Tester",
      subject: "Contact sender test",
      message: "This is a valid contact sender formatting test.",
      language: "en",
    });

    const requestBody = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string);
    expect(requestBody.from).toBe("SPORTIX <contact@sportixpartners.com>");
  });
});
