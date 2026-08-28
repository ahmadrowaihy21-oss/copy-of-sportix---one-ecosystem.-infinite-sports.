import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import IndividualAccess from "./IndividualAccess";

describe("IndividualAccess", () => {
  it("offers a founder call link, company-email re-entry, and opt-in looping audio", async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    const { container } = render(<IndividualAccess />);

    expect(screen.getByRole("link", { name: /تواصل مع المؤسس/i }).getAttribute("href")).toBe("tel:+966545022063");
    expect(screen.getByRole("link", { name: /اخرج وعاود الدخول بإيميل شركتك/i }).getAttribute("href")).toBe("/partner-access");
    const audioButton = screen.getByRole("button", { name: /تشغيل التجربة الصوتية/i });
    expect(audioButton.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelector("audio")?.hasAttribute("loop")).toBe(true);
    expect(container.querySelector("source")?.getAttribute("src")).toBe("/manus-storage/sportix-orbit-loop_65cdd0ee.mp3");

    fireEvent.click(audioButton);
    await Promise.resolve();
    expect(play).toHaveBeenCalledTimes(1);
    play.mockRestore();
  });
});
