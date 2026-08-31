import { afterEach, describe, expect, it, vi } from "vitest";

describe("SPORTIX live sender payload", () => {
  afterEach(() => { vi.resetModules(); vi.unstubAllGlobals(); });

  it("builds one valid Resend From value from the configured sender without sending an email", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: "verification_payload_123" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { sendPartnerVerificationEmail } = await import("./partnerEmail");
    await sendPartnerVerificationEmail({ email: "recipient@example.com", fullName: "Payload Test", code: "123456" });

    const request = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string) as { from: string };
    expect(request.from).toMatch(/^[^<>]+<[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>$/);
    expect(request.from).not.toContain("<<");
    expect(request.from).not.toContain(">>");
  });
});
