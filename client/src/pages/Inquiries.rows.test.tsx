import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/badge", () => ({ Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));

import { InquiryRows } from "./Inquiries";

const rows = [
  { id: 1, createdAt: new Date("2026-08-26T09:00:00Z"), status: "reviewed" as const, subject: "Reviewed", fullName: "A", companyName: "A Co", emailDeliveryStatus: "accepted" },
  { id: 2, createdAt: new Date("2026-08-26T11:00:00Z"), status: "new" as const, subject: "Newest", fullName: "B", companyName: "B Co", emailDeliveryStatus: "delivered" },
  { id: 3, createdAt: new Date("2026-08-26T10:00:00Z"), status: "responded" as const, subject: "Responded", fullName: "C", companyName: "C Co", emailDeliveryStatus: "delivered" },
];

describe("rendered SPORTIX inquiry rows", () => {
  it("renders the requested dashboard ordering in its visible row sequence", () => {
    const { rerender } = render(<InquiryRows inquiries={rows} order="newest" onSelect={() => undefined} />);
    expect(screen.getAllByRole("button").map(button => button.getAttribute("data-inquiry-id"))).toEqual(["2", "3", "1"]);

    rerender(<InquiryRows inquiries={rows} order="oldest" onSelect={() => undefined} />);
    expect(screen.getAllByRole("button").map(button => button.getAttribute("data-inquiry-id"))).toEqual(["1", "3", "2"]);
  });
});
