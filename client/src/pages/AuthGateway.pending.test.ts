import { describe, expect, it } from "vitest";
import { PENDING_VERIFICATION_EMAIL_KEY, readPendingVerificationEmail } from "./AuthGateway";

describe("pending SPORTIX Partners verification recovery", () => {
  it("restores only a syntactically valid pending email address", () => {
    const storage = { getItem: (key: string) => key === PENDING_VERIFICATION_EMAIL_KEY ? " Profile.Test@Example.com " : null };
    expect(readPendingVerificationEmail(storage)).toBe("profile.test@example.com");
  });

  it("does not restore invalid content or a verification code", () => {
    const storage = { getItem: () => "076895" };
    expect(readPendingVerificationEmail(storage)).toBe("");
  });
});
