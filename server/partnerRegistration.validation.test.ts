import { describe, expect, it } from "vitest";
import { partnerPasswordResetInput, partnerSignupInput } from "./routers";

const validSignup = {
  fullName: "SPORTIX Test User",
  email: "test.user@example.com",
  mobileNumber: "+966501234567",
  password: "1234567",
  companyName: undefined,
  jobTitle: undefined,
  age: 28,
  gender: "male" as const,
  weeklySportFrequency: "3-4" as const,
  currentSports: "Football and strength training",
  aspirationalSport: "Cycling",
  sportsChallenges: "Finding consistent training opportunities",
  sportsSolutionIdea: "A trusted platform for sports connections",
};

describe("SPORTIX partner registration validation", () => {
  it("requires a mobile number and accepts a seven-character password", () => {
    expect(partnerSignupInput.safeParse(validSignup).success).toBe(true);
    expect(partnerSignupInput.safeParse({ ...validSignup, mobileNumber: "" }).success).toBe(false);
    expect(partnerSignupInput.safeParse({ ...validSignup, password: "123456" }).success).toBe(false);
  });

  it("accepts the password reset OTP contract with the seven-character minimum", () => {
    const valid = { email: "test.user@example.com", code: "123456", newPassword: "1234567" };
    expect(partnerPasswordResetInput.safeParse(valid).success).toBe(true);
    expect(partnerPasswordResetInput.safeParse({ ...valid, newPassword: "123456" }).success).toBe(false);
    expect(partnerPasswordResetInput.safeParse({ ...valid, code: "12345" }).success).toBe(false);
  });
});
