import { describe, expect, it } from "vitest";
import { sortInquiries } from "./Inquiries";

const rows = [
  { id: 1, createdAt: new Date("2026-08-26T09:00:00Z"), status: "reviewed" as const },
  { id: 2, createdAt: new Date("2026-08-26T11:00:00Z"), status: "new" as const },
  { id: 3, createdAt: new Date("2026-08-26T10:00:00Z"), status: "responded" as const },
];

describe("SPORTIX inquiry ordering", () => {
  it("sorts the protected dashboard rows by newest, oldest, or status without mutating source data", () => {
    expect(sortInquiries(rows, "newest").map(row => row.id)).toEqual([2, 3, 1]);
    expect(sortInquiries(rows, "oldest").map(row => row.id)).toEqual([1, 3, 2]);
    expect(sortInquiries(rows, "status").map(row => row.id)).toEqual([2, 1, 3]);
    expect(rows.map(row => row.id)).toEqual([1, 2, 3]);
  });
});
