import { describe, expect, it } from "vitest";
import { createPartnerNdaApprovalToken, hashPartnerNdaApprovalToken, validatePartnerNdaPayload } from "./partnerNda";

describe("SPORTIX signed NDA security", () => {
  it("accepts a PDF signature and normalises its filename", () => {
    const result = validatePartnerNdaPayload({ base64: Buffer.from("%PDF-1.7\nSPORTIX").toString("base64"), fileName: " Signed NDA \\ Final ".trim() });
    expect(result.bytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");
    expect(result.fileName).toBe("Signed NDA - Final.pdf");
  });

  it("rejects non-PDF or invalid document data before storage", () => {
    expect(() => validatePartnerNdaPayload({ base64: Buffer.from("not a pdf").toString("base64"), fileName: "nda.pdf" })).toThrow("valid PDF");
    expect(() => validatePartnerNdaPayload({ base64: "not-base64", fileName: "nda.pdf" })).toThrow("could not be read");
  });

  it("issues high-entropy approval tokens and retains only a deterministic digest", () => {
    const first = createPartnerNdaApprovalToken();
    const second = createPartnerNdaApprovalToken();
    expect(first).not.toBe(second);
    expect(first).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(hashPartnerNdaApprovalToken(first)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashPartnerNdaApprovalToken(first)).toBe(hashPartnerNdaApprovalToken(first));
  });
});
