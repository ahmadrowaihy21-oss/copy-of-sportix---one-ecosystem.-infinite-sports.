import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const startLoginMock = vi.hoisted(() => vi.fn());
const mutation = vi.hoisted(() => () => ({ isPending: false, mutate: vi.fn() }));

vi.mock("@/const", () => ({ startLogin: startLoginMock }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ partnerAuth: { session: { invalidate: vi.fn() } } }),
    partnerAuth: {
      login: { useMutation: mutation },
      signUp: { useMutation: mutation },
      verifyEmail: { useMutation: mutation },
      resendCode: { useMutation: mutation },
      requestPasswordReset: { useMutation: mutation },
      resetPassword: { useMutation: mutation },
    },
  },
}));

import AuthGateway from "./AuthGateway";

describe("SPORTIX partner registration and recovery UI", () => {
  afterEach(() => cleanup());
  it("requires mobile data and advertises the seven-character password minimum", () => {
    render(<AuthGateway onAuthenticated={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: /^sign up/i }));

    const mobile = screen.getByLabelText(/Mobile Number/i);
    expect(mobile.getAttribute("required")).not.toBeNull();
    expect(screen.getAllByLabelText(/Password/i)[0].getAttribute("minlength")).toBe("7");
    expect(screen.getByText(/MINIMUM 7 CHARACTERS/i)).toBeTruthy();
  });

  it("keeps Forgot Password reachable from the local login flow", () => {
    render(<AuthGateway onAuthenticated={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: /^log in/i }));
    fireEvent.click(screen.getByRole("button", { name: /forgot password/i }));

    expect(screen.getByRole("heading", { name: /RESET YOUR\s*PASSWORD/i })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /email address/i }).getAttribute("required")).not.toBeNull();
    expect(screen.getByRole("button", { name: /send reset code/i })).toBeTruthy();
  });
});
