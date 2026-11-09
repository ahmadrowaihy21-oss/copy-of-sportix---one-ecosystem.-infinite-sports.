import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const contact = { contactId: 99, fullName: "Test", contactEmail: "visitor@example.com", mobileNumber: "+966500000000", companyName: "Test", jobTitle: "Tester", subject: "Inquiry", message: "Test message", language: "en" as const };

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("CONTACT_SENDER_EMAIL", "SPORTIX <sender@example.com>");
  vi.stubEnv("CONTACT_RECIPIENT_EMAIL", "recipient@example.com");
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules(); });

async function send(kind: string) {
  if (kind === "contact") return (await import("./resend")).sendSportixContactEmail(contact);
  const auth = await import("./partnerEmail");
  const payload = { email: "user@example.com", fullName: "Test User", code: "123456" };
  return kind === "verification" ? auth.sendPartnerVerificationEmail(payload) : auth.sendPartnerPasswordResetEmail(payload);
}

for (const kind of ["contact", "verification", "reset"]) {
  describe(`${kind} email acceptance`, () => {
    it.each([null, {}, { id: "" }, { id: "   " }])("rejects malformed provider success %j", async body => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 })));
      await expect(send(kind)).rejects.toBeInstanceOf(Error);
    });
    it("does not return success when the provider rejects or times out", async () => {
      const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ message: "Sender not verified" }), { status: 403 }))
        .mockRejectedValueOnce(new DOMException("Timed out", "TimeoutError"));
      vi.stubGlobal("fetch", fetchMock);
      await expect(send(kind)).rejects.toThrow("Sender not verified");
      await expect(send(kind)).rejects.toMatchObject({ name: "TimeoutError" });
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
    it("bounds provider requests and returns only a nonempty acceptance ID", async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "accepted" }), { status: 200 }));
      vi.stubGlobal("fetch", fetchMock);
      await expect(send(kind)).resolves.toEqual({ id: "accepted" });
      expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
    });
  });
}
