import { describe, it, expect } from "vitest";
import { computeLegacyScore, computePrestigeTier, checkMilestones, MILESTONE_DEFS } from "./legacyScore";
import type { LegacyMilestoneRecord } from "./gameTypes";

describe("computeLegacyScore", () => {
  it("returns 0 for empty milestones", () => {
    expect(computeLegacyScore([])).toBe(0);
  });

  it("sums milestone impacts", () => {
    const milestones: LegacyMilestoneRecord[] = [
      { title: "A", date: "1 Jan", pillar: "Legislation", impact: 5, description: "test", day: 10 },
      { title: "B", date: "2 Jan", pillar: "Economic", impact: 10, description: "test", day: 20 },
    ];
    expect(computeLegacyScore(milestones)).toBe(15);
  });
});

describe("computePrestigeTier", () => {
  it("returns Low when combined < 60", () => {
    expect(computePrestigeTier(30, []).tier).toBe("Low");
  });

  it("returns Moderate when combined 60-100", () => {
    expect(computePrestigeTier(70, []).tier).toBe("Moderate");
  });

  it("returns High when combined 101-150", () => {
    const milestones: LegacyMilestoneRecord[] = [
      { title: "A", date: "1 Jan", pillar: "Political", impact: 25, description: "test", day: 10 },
      { title: "B", date: "2 Jan", pillar: "Political", impact: 15, description: "test", day: 20 },
    ];
    expect(computePrestigeTier(65, milestones).tier).toBe("High");
  });

  it("returns Legendary when combined > 150", () => {
    const milestones: LegacyMilestoneRecord[] = [
      { title: "A", date: "1 Jan", pillar: "Political", impact: 100, description: "test", day: 10 },
    ];
    expect(computePrestigeTier(60, milestones).tier).toBe("Legendary");
  });
});

describe("MILESTONE_DEFS", () => {
  it("has at least 10 milestone definitions", () => {
    expect(MILESTONE_DEFS.length).toBeGreaterThanOrEqual(10);
  });
});
