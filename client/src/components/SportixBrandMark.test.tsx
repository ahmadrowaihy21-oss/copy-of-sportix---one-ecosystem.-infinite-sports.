import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SportixBrandMark from "./SportixBrandMark";

describe("SPORTIX brand mark", () => {
  it("renders the accessible official SPORTIX mark from managed storage", () => {
    render(<SportixBrandMark alt="SPORTIX official mark" className="site-logo-mark" />);

    const logo = screen.getByRole("img", { name: "SPORTIX official mark" });
    expect(logo.getAttribute("src")).toBe("/manus-storage/sportix-official-logo_e33eff89.png");
    expect(logo.parentElement?.className).toContain("site-logo-mark");
  });
});
