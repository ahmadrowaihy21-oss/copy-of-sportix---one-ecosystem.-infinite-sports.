import { describe, expect, it } from "vitest";
import { createPartnerSessionToken, createPartnerVerificationCode, hashPartnerSessionToken, hashPartnerVerificationCode, hashPartnerPassword, verifyPartnerPassword } from "./partnerAuth";

describe("SPORTIX Partners authentication primitives", () => {
  it("hashes passwords with a fresh salt and verifies without retaining plaintext", async () => {
    const hash = await hashPartnerPassword("A secure SPORTIX partner password");
    expect(hash).toMatch(/^scrypt\$/);
    expect(hash).not.toContain("A secure SPORTIX partner password");
    await expect(verifyPartnerPassword("A secure SPORTIX partner password", hash)).resolves.toBe(true);
    await expect(verifyPartnerPassword("incorrect password", hash)).resolves.toBe(false);
  });

  it("creates six-digit codes and opaque session digests that bind to the relevant account or token", () => {
    const code = createPartnerVerificationCode();
    const token = createPartnerSessionToken();
    expect(code).toMatch(/^\d{6}$/);
    expect(hashPartnerVerificationCode(7, code)).not.toBe(hashPartnerVerificationCode(8, code));
    expect(token.length).toBeGreaterThan(30);
    expect(hashPartnerSessionToken(token)).toMatch(/^[a-f0-9]{64}$/);
  });
});
