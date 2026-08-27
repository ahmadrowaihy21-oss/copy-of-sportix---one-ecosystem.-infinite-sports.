import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const startLoginMock = vi.hoisted(() => vi.fn());

vi.mock("@/const", () => ({ startLogin: startLoginMock }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ partnerAuth: { session: { invalidate: vi.fn() } } }),
    partnerAuth: {
      login: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      signUp: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      verifyEmail: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
      resendCode: { useMutation: () => ({ isPending: false, mutate: vi.fn() }) },
    },
  },
}));

import AuthGateway from "./AuthGateway";

describe("SPORTIX project administrator entry", () => {
  it("keeps Manus sign-in separate from the local partner login", () => {
    render(<AuthGateway onAuthenticated={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: /^log in/i }));
    fireEvent.click(screen.getByRole("button", { name: /project admin\? sign in with manus/i }));

    expect(startLoginMock).toHaveBeenCalledTimes(1);
  });
});
