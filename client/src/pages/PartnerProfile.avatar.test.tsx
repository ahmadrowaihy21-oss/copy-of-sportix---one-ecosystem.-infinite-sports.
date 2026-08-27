import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    partnerAuth: {
      session: {
        useQuery: () => ({
          isLoading: false,
          data: {
            fullName: "Avatar Test Partner",
            profileImageUrl: "/manus-storage/partner-profiles/1/avatar.png",
            age: 30,
            gender: "male",
            weeklySportFrequency: "3-4",
            currentSports: "Running",
            aspirationalSport: "Swimming",
            sportsChallenges: "Discovery",
            sportsSolutionIdea: "Directory",
          },
        }),
      },
    },
  },
}));

import PartnerProfile from "./PartnerProfile";

describe("PartnerProfile avatar", () => {
  it("renders the stored profile image for a verified partner profile", () => {
    render(<PartnerProfile />);
    const avatar = screen.getByAltText("Avatar Test Partner profile");
    expect(avatar.getAttribute("src")).toBe("/manus-storage/partner-profiles/1/avatar.png");
  });
});
