import { describe, it, expect } from "vitest";
import { buildCareerHistory } from "./characterCareerBuilder";

describe("buildCareerHistory", () => {
  it("creates entries from previousOffices", () => {
    const result = buildCareerHistory({
      previousOffices: ["Governor of Lagos (2015-2023)", "Senator, Lagos West (2007-2015)"],
      currentPosition: "Minister of Finance",
    });
    expect(result).toHaveLength(3);
    expect(result[0].position).toBe("Governor of Lagos");
    expect(result[0].current).toBe(false);
    expect(result[2].current).toBe(true);
  });

  it("generates plausible history from professionalBackground when no previousOffices", () => {
    const result = buildCareerHistory({
      professionalBackground: "Lawyer",
      age: 55,
      currentPosition: "Chief of Staff",
    });
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[result.length - 1].current).toBe(true);
  });

  it("generates different histories for different age brackets", () => {
    const young = buildCareerHistory({ professionalBackground: "Banker", age: 38 });
    const senior = buildCareerHistory({ professionalBackground: "Banker", age: 62 });
    expect(senior.length).toBeGreaterThan(young.length);
  });

  it("always returns at least one entry", () => {
    const result = buildCareerHistory({});
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("handles military background with appropriate ranks", () => {
    const result = buildCareerHistory({ professionalBackground: "Military Officer", age: 58 });
    expect(result.some(e => /General|Colonel|Brigadier/.test(e.position))).toBe(true);
  });
});
