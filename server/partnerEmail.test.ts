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

  it("sends the admin all required applicant details and secure NDA review actions", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_partner_key");
    vi.stubEnv("CONTACT_SENDER_EMAIL", "contact@sportixpartners.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "nda_request_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendPartnerNdaAccessRequestEmail } = await import("./partnerEmail");
    await expect(sendPartnerNdaAccessRequestEmail({ adminEmail: "admin@sportixpartners.com", fullName: "Applicant Example", companyName: "Example Co", jobTitle: "Sports Director", email: "applicant@example.com", mobileNumber: "+966501234567", viewNdaUrl: "https://www.sportixpartners.com/admin/nda-review?t=token", approveUrl: "https://www.sportixpartners.com/admin/nda-approve?t=token" })).resolves.toEqual({ id: "nda_request_123" });
    const request = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string);
    expect(request.subject).toBe("New SPORTIX Access Request");
    expect(request.html).toContain("VIEW NDA");
    expect(request.html).toContain("APPROVE NDA &amp; GRANT ACCESS");
    expect(request.html).toContain("Applicant Example");
    expect(request.html).toContain("NDA Status");
  });

  it("sends the approved applicant a YALLA HAYYIHOM login action", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_partner_key");
    vi.stubEnv("CONTACT_SENDER_EMAIL", "contact@sportixpartners.com");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "nda_approved_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { sendPartnerNdaApprovalEmail } = await import("./partnerEmail");
    await expect(sendPartnerNdaApprovalEmail({ email: "applicant@example.com", fullName: "Applicant Example", loginUrl: "https://www.sportixpartners.com/partner-access" })).resolves.toEqual({ id: "nda_approved_123" });
    const request = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string);
    expect(request.subject).toBe("Your sportix Access Has Been Approved");
    expect(request.html).toContain("YALLA HAYYIHOM");
    expect(request.html).toContain("LOG IN");
  });
});
