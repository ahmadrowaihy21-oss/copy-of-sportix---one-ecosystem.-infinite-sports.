import { describe, expect, it } from "vitest";
import { calculateBookingTotal, filterGoActivities, goActivities } from "./goSportixData";

describe("GO SPORTIX activities", () => {
  it("filters activities by sport and a matching discovery query", () => {
    expect(filterGoActivities(goActivities, "كرة القدم", "").map((activity) => activity.id)).toEqual(["pitch"]);
    expect(filterGoActivities(goActivities, "الكل", "وادي نمار").map((activity) => activity.id)).toEqual(["paddle"]);
    expect(filterGoActivities(goActivities, "الجري", "استعادة")).toEqual([]);
  });

  it("calculates a transparent booking total based on attendee count", () => {
    const paidActivity = goActivities.find((activity) => activity.id === "functional")!;
    const openActivity = goActivities.find((activity) => activity.id === "night-run")!;

    expect(calculateBookingTotal(paidActivity, 3)).toBe(105);
    expect(calculateBookingTotal(openActivity, 4)).toBe(0);
    expect(calculateBookingTotal(paidActivity, -1)).toBe(0);
  });
});
