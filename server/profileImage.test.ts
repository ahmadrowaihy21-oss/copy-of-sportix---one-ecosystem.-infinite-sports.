import { describe, expect, it } from "vitest";
import { validateProfileImagePayload } from "./profileImage";
import { partnerSignupInput } from "./routers";

const validProfile = {
  firstName: "SPORTIX", familyName: "Profile Test", email: "profile@example.com", mobileNumber: "+966501234567", password: "ProfileTest_2026!Secure", age: 27,
};

describe("SPORTIX Partners registration profile", () => {
  it("accepts the reduced registration profile without athlete-profile questions", () => {
    expect(partnerSignupInput.parse(validProfile)).toMatchObject({ age: 27, firstName: "SPORTIX", familyName: "Profile Test" });
    expect(() => partnerSignupInput.parse({ ...validProfile, firstName: "" })).toThrow();
    expect(() => partnerSignupInput.parse({ ...validProfile, familyName: "" })).toThrow();
  });

  it("accepts only supported image signatures and rejects deceptive image payloads", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(validateProfileImagePayload({ mimeType: "image/png", base64: png.toString("base64") }).mimeType).toBe("image/png");
    expect(() => validateProfileImagePayload({ mimeType: "image/png", base64: Buffer.from("not an image").toString("base64") })).toThrow("content does not match");
    expect(() => validateProfileImagePayload({ mimeType: "image/svg+xml", base64: png.toString("base64") })).toThrow("must be a JPEG, PNG, or WebP");
  });
});
