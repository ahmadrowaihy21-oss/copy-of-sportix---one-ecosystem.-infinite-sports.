import { describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  createContactMessage: vi.fn(),
  listContactMessages: vi.fn(),
  markContactEmailAccepted: vi.fn(),
  markContactEmailFailed: vi.fn(),
  updateContactMessageStatus: vi.fn(),
}));
const resend = vi.hoisted(() => ({ sendSportixContactEmail: vi.fn() }));

vi.mock("./db", () => db);
vi.mock("./resend", () => resend);

import { appRouter, resetContactRateLimitForTest } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("SPORTIX contact honeypot router flow", () => {
  it("short-circuits a populated hidden field before any database or Resend work", async () => {
    resetContactRateLimitForTest();
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {}, socket: { remoteAddress: "203.0.113.20" } } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.contact.submit({
      fullName: "Spam Bot",
      contactEmail: "spam@example.com",
      mobileNumber: "+966501234567",
      companyName: "Example",
      jobTitle: "Bot",
      subject: "Ignore",
      message: "This must not produce a database row or email.",
      language: "en",
      website: "https://spam.example",
    })).resolves.toEqual({ success: true, contactId: 0, emailId: "" });

    expect(db.createContactMessage).not.toHaveBeenCalled();
    expect(resend.sendSportixContactEmail).not.toHaveBeenCalled();
  });
});
