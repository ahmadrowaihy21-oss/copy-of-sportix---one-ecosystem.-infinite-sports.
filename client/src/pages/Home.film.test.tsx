import { describe, expect, it } from "vitest";
import { loopFilmUrl } from "./Home";

describe("SPORTIX Loop film source", () => {
  it("uses the supplied corrected strategic vision film", () => {
    expect(loopFilmUrl).toBe("/manus-storage/SPORTIX_Strategic_Vision_Film_Audio_Corrected_1_b02780c3.mp4");
  });
});
