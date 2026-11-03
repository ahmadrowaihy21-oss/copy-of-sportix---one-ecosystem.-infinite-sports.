import { describe, expect, it } from "vitest";
import { partnerPasswordResetInput, partnerSignupInput } from "./routers";

const validSignup = {
  firstName: "SPORTIX",
  familyName: "Test User",
  email: "test.user@example.com",
  mobileNumber: "+966501234567",
  password: "1234567",
  age: 28,
};

describe("SPORTIX partner registration validation", () => {
  it("requires a mobile number and accepts a seven-character password", () => {
    expect(partnerSignupInput.safeParse(validSignup).success).toBe(true);
    expect(partnerSignupInput.safeParse({ ...validSignup, mobileNumber: "" }).success).toBe(false);
    expect(partnerSignupInput.safeParse({ ...validSignup, password: "123456" }).success).toBe(false);
  });

  it("does not require the removed company or sport-profile questions", () => {
    expect(partnerSignupInput.safeParse(validSignup).success).toBe(true);
    expect(partnerSignupInput.safeParse({ ...validSignup, firstName: "" }).success).toBe(false);
    expect(partnerSignupInput.safeParse({ ...validSignup, familyName: "" }).success).toBe(false);
    expect(partnerSignupInput.safeParse({ ...validSignup, age: undefined }).success).toBe(false);
  });

  it("accepts the password reset OTP contract with the seven-character minimum", () => {
    const valid = { email: "test.user@example.com", code: "123456", newPassword: "1234567" };
    expect(partnerPasswordResetInput.safeParse(valid).success).toBe(true);
    expect(partnerPasswordResetInput.safeParse({ ...valid, newPassword: "123456" }).success).toBe(false);
    expect(partnerPasswordResetInput.safeParse({ ...valid, code: "12345" }).success).toBe(false);
  });
});
