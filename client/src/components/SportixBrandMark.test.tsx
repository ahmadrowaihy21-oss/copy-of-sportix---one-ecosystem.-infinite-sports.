import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SportixBrandMark from "./SportixBrandMark";

describe("SPORTIX brand mark", () => {
  it("renders a stable accessible SPORTIX wordmark without depending on a missing image asset", () => {
    render(<SportixBrandMark alt="SPORTIX official mark" className="site-logo-mark" />);

    expect(screen.getByRole("img", { name: "SPORTIX official mark" }).textContent).toBe("SPORTIX");
    expect(screen.getByText("SPORTIX").className).toContain("site-logo-mark");
  });
});
