import { describe, expect, it } from "vitest";
import { validateProfileImagePayload } from "./profileImage";
import { partnerSignupInput } from "./routers";

const validProfile = {
  fullName: "SPORTIX Profile Test", email: "profile@example.com", mobileNumber: "+966501234567", password: "ProfileTest_2026!Secure", age: 27, gender: "male", weeklySportFrequency: "3-4", currentSports: "Football, running", aspirationalSport: "Cycling", sportsChallenges: "Finding suitable community sessions and verified local opportunities.", sportsSolutionIdea: "A single profile that connects athletes to verified local activity and progression paths.",
};

describe("SPORTIX Partners complete athlete profile", () => {
  it("requires every mandatory athlete-profile answer on new registration", () => {
    expect(partnerSignupInput.parse(validProfile)).toMatchObject({ age: 27, gender: "male", weeklySportFrequency: "3-4" });
    expect(() => partnerSignupInput.parse({ ...validProfile, currentSports: "" })).toThrow();
    expect(() => partnerSignupInput.parse({ ...validProfile, sportsSolutionIdea: "short" })).toThrow();
  });

  it("accepts only supported image signatures and rejects deceptive image payloads", () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
    expect(validateProfileImagePayload({ mimeType: "image/png", base64: png.toString("base64") }).mimeType).toBe("image/png");
    expect(() => validateProfileImagePayload({ mimeType: "image/png", base64: Buffer.from("not an image").toString("base64") })).toThrow("content does not match");
    expect(() => validateProfileImagePayload({ mimeType: "image/svg+xml", base64: png.toString("base64") })).toThrow("must be a JPEG, PNG, or WebP");
  });
});
