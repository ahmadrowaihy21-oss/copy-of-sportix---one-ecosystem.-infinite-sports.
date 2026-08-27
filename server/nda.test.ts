import { describe, expect, it } from "vitest";
import { browserFromUserAgent, decodeCompanyNda, deviceFromUserAgent, NDA_DOCUMENT_ID, NDA_EFFECTIVE_DATE, NDA_VERSION, sha256 } from "./nda";

describe("SPORTIX NDA evidence safeguards", () => {
  it("pins the approved immutable NDA metadata and deterministic snapshot hash", () => {
    expect(NDA_VERSION).toBe("1.0");
    expect(NDA_DOCUMENT_ID).toBe("SPORTIX-NDA-AR-2026-001");
    expect(NDA_EFFECTIVE_DATE).toBe("2026-08-27");
    expect(sha256("SPORTIX NDA")).toHaveLength(64);
    expect(sha256("SPORTIX NDA")).toBe(sha256("SPORTIX NDA"));
  });

  it("records concise browser and device evidence without trusting client labels", () => {
    expect(browserFromUserAgent("Mozilla/5.0 Chrome/120.0")).toBe("Google Chrome");
    expect(deviceFromUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile")).toBe("Mobile");
  });

  it("rejects content that does not match the declared signed Company NDA file type", () => {
    expect(() => decodeCompanyNda({ mimeType: "application/pdf", base64: Buffer.from("not-a-pdf").toString("base64") })).toThrow("does not match");
    expect(decodeCompanyNda({ mimeType: "application/pdf", base64: Buffer.from("%PDF-1.7").toString("base64") }).toString()).toContain("%PDF");
  });
});
