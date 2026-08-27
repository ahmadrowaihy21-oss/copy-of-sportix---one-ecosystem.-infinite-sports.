import { describe, expect, it } from "vitest";
import { contactInput } from "./routers";

describe("SPORTIX contact submission validation", () => {
  it("accepts a complete English business contact request", () => {
    const result = contactInput.safeParse({
      fullName: "Ahmad Rowaihy",
      contactEmail: "ahmad@example.com",
      mobileNumber: "+966501234567",
      companyName: "SPORTIX",
      jobTitle: "Founder",
      subject: "Strategic partnership",
      message: "I would like to discuss a strategic sports partnership.",
      language: "en",
      website: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects incomplete submissions and short messages", () => {
    const result = contactInput.safeParse({
      fullName: "",
      contactEmail: "not-an-email",
      mobileNumber: "123",
      companyName: "",
      jobTitle: "",
      subject: "",
      message: "short",
      language: "en",
    });

    expect(result.success).toBe(false);
  });

  it("keeps the honeypot field outside visible field validation while accepting its bounded server input", () => {
    const result = contactInput.safeParse({
      fullName: "Ahmad Rowaihy",
      contactEmail: "ahmad@example.com",
      mobileNumber: "+966501234567",
      companyName: "SPORTIX",
      jobTitle: "Founder",
      subject: "Strategic partnership",
      message: "I would like to discuss a strategic sports partnership.",
      website: "bot.example",
    });

    expect(result.success).toBe(true);
  });

  it("rejects malformed visitor email addresses and mobile numbers", () => {
    const result = contactInput.safeParse({
      fullName: "Ahmad Rowaihy",
      contactEmail: "invalid-email",
      mobileNumber: "123",
      companyName: "SPORTIX",
      jobTitle: "Founder",
      subject: "Strategic partnership",
      message: "I would like to discuss a strategic sports partnership.",
    });

    expect(result.success).toBe(false);
  });
});
