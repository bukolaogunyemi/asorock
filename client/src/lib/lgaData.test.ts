import { describe, it, expect } from "vitest";
import { getLGACount, getLGAsForState, getAllStates, LGA_BY_STATE } from "./lgaData";

describe("lgaData", () => {
  it("total LGA count is 774", () => {
    expect(getLGACount()).toBe(774);
  });

  it("every state has at least 6 LGAs", () => {
    for (const [state, lgas] of Object.entries(LGA_BY_STATE)) {
      expect(lgas.length, `${state} has fewer than 6 LGAs`).toBeGreaterThanOrEqual(6);
    }
  });

  it("Kano has exactly 44 LGAs", () => {
    const kanoLGAs = getLGAsForState("Kano");
    expect(kanoLGAs).toHaveLength(44);
  });

  it("no duplicate LGA names within a state", () => {
    for (const [state, lgas] of Object.entries(LGA_BY_STATE)) {
      const unique = new Set(lgas);
      expect(unique.size, `Duplicate LGA names found in ${state}`).toBe(lgas.length);
    }
  });

  it("FCT has exactly 6 area councils", () => {
    const fctLGAs = getLGAsForState("FCT");
    expect(fctLGAs).toHaveLength(6);
  });

  it("getAllStates returns 37 entries (36 states + FCT)", () => {
    const states = getAllStates();
    expect(states).toHaveLength(37);
  });

  it("getLGAsForState returns empty array for unknown state", () => {
    expect(getLGAsForState("Atlantis")).toEqual([]);
  });
});
