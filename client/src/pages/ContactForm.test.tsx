import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    contact: {
      submit: {
        useMutation: () => ({ mutate, isPending: false, error: null }),
      },
    },
  },
}));

import { ContactForm } from "./Home";

describe("SPORTIX inline contact form", () => {
  afterEach(cleanup);

  beforeEach(() => {
    mutate.mockReset();
  });

  it("shows clear required-field feedback before submitting an empty form", () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: /send to sportix/i }));

    expect(screen.getAllByText("This field is required.")).toHaveLength(7);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("shows the polished confirmation state after a successful submission", () => {
    mutate.mockImplementation((_payload, options) => options.onSuccess({ success: true, contactId: 42, emailId: "email_accepted_123" }));
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText("Full Name"), { target: { value: "Ahmad Rowaihy" } });
    fireEvent.change(screen.getByLabelText("Email Address"), { target: { value: "ahmad@example.com" } });
    fireEvent.change(screen.getByLabelText("Mobile Number"), { target: { value: "+966501234567" } });
    fireEvent.change(screen.getByLabelText("Company Name"), { target: { value: "SPORTIX" } });
    fireEvent.change(screen.getByLabelText("Job Title"), { target: { value: "Founder" } });
    fireEvent.change(screen.getByLabelText("Subject"), { target: { value: "Partnership" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I would like to discuss a strategic sports partnership." } });
    fireEvent.click(screen.getByRole("button", { name: /send to sportix/i }));

    expect(mutate).toHaveBeenCalledOnce();
    expect(screen.getByText("Thank you. Your message has been received by SPORTIX.")).toBeTruthy();
  });

  it("shows and clears required feedback as a visitor interacts with a field", () => {
    render(<ContactForm />);
    const fullName = screen.getByLabelText("Full Name");

    fireEvent.blur(fullName);
    const inlineError = screen.getByText("This field is required.");
    expect(inlineError).toBeTruthy();
    expect(inlineError.getAttribute("style")).toContain("color: rgb(255, 92, 104)");
    expect(fullName.closest("label")?.className).toContain("field-error");

    fireEvent.change(fullName, { target: { value: "Ahmad Rowaihy" } });
    expect(screen.queryByText("This field is required.")).toBeNull();
    expect(fullName.closest("label")?.className).not.toContain("field-error");
  });

  it("shows field-specific feedback for malformed email and mobile values", () => {
    render(<ContactForm />);
    const email = screen.getByLabelText("Email Address");
    const mobile = screen.getByLabelText("Mobile Number");

    fireEvent.change(email, { target: { value: "invalid" } });
    fireEvent.blur(email);
    fireEvent.change(mobile, { target: { value: "123" } });
    fireEvent.blur(mobile);

    expect(screen.getByText("Please enter a valid email address.")).toBeTruthy();
    expect(screen.getByText("Please enter a valid mobile number.")).toBeTruthy();
  });

  it("renders Arabic validation feedback through the same inline form flow", () => {
    render(<ContactForm isArabic />);
    fireEvent.click(screen.getByRole("button", { name: /أرسل إلى sportix/i }));

    expect(screen.getByText("الاسم الكامل")).toBeTruthy();
    expect(screen.getAllByText("هذا الحقل مطلوب.")).toHaveLength(7);
    expect(mutate).not.toHaveBeenCalled();
  });
});
