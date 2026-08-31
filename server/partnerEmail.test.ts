import { afterEach, describe, expect, it, vi } from "vitest";

describe("SPORTIX Partners verification delivery", () => {
  afterEach(() => { vi.resetModules(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("sends a professional Resend verification email with a six-digit code and text alternative", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_partner_key");
    vi.stubEnv("CONTACT_SENDER_EMAIL", "contact@sportixpartners.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "partner_verification_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { sendPartnerVerificationEmail } = await import("./partnerEmail");
    await expect(sendPartnerVerificationEmail({ email: "partner@example.com", fullName: "Partner Test", code: "123456" })).resolves.toEqual({ id: "partner_verification_123" });
    const request = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string);
    expect(request.from).toBe("SPORTIX Partners <contact@sportixpartners.com>");
    expect(request.to).toEqual(["partner@example.com"]);
    expect(request.text).toContain("123456");
    expect(request.html).toContain("This code expires in 10 minutes");
    expect(request.html).toContain("SPORTIX PARTNERS");
  });

  it("does not wrap a configured display-name sender inside a second address format", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_partner_key");
    vi.stubEnv("CONTACT_SENDER_EMAIL", "SPORTIX <contact@sportixpartners.com>");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "partner_verification_456" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { sendPartnerVerificationEmail } = await import("./partnerEmail");
    await sendPartnerVerificationEmail({ email: "partner@example.com", fullName: "Partner Test", code: "654321" });
    const request = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string);
    expect(request.from).toBe("SPORTIX <contact@sportixpartners.com>");
  });
});
