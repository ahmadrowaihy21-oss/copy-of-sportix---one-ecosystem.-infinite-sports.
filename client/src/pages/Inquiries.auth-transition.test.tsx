import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const useAuthMock = vi.hoisted(() => vi.fn());

vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: useAuthMock }));
vi.mock("@/components/DashboardLayout", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("@/components/ui/badge", () => ({ Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span> }));
vi.mock("@/components/ui/button", () => ({ Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button> }));
vi.mock("@/components/ui/select", () => ({ Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>, SelectItem: ({ children }: { children: React.ReactNode }) => <span>{children}</span>, SelectTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>, SelectValue: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    contact: {
      list: { useQuery: () => ({ data: [], isLoading: false, refetch: vi.fn() }) },
      updateStatus: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
    },
    useUtils: () => ({ contact: { list: { invalidate: vi.fn() } } }),
  },
}));

import Inquiries from "./Inquiries";

const administrator = { id: 1, role: "admin" };

describe("Inquiries administrator authentication transition", () => {
  it("keeps Hook order stable when the administrator session finishes loading", () => {
    useAuthMock.mockReturnValue({ user: null, loading: true });
    const { rerender } = render(<Inquiries />);

    useAuthMock.mockReturnValue({ user: administrator, loading: false });
    expect(() => rerender(<Inquiries />)).not.toThrow();
    expect(screen.getByText("Contact inquiries")).toBeTruthy();
  });
});
