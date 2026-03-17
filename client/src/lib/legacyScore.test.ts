import { describe, it, expect } from "vitest";
import { computeLegacyScore, computePrestigeTier, checkMilestones, MILESTONE_DEFS, computeSectorLegacyDelta } from "./legacyScore";
import type { LegacyMilestoneRecord } from "./gameTypes";
import type { AllSectorHealthInputs } from "./legacyScore";

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

// ── computeSectorLegacyDelta tests ─────────────────────────────────────────────

const allHealthy: AllSectorHealthInputs = {
  economy: { health: 80 },
  infrastructure: { health: 80 },
  health: { health: 80 },
  education: { health: 80 },
  agriculture: { health: 80 },
  youth: { health: 80 },
  interior: { health: 80 },
  environment: { health: 80 },
};

const allPoor: AllSectorHealthInputs = {
  economy: { health: 20 },
  infrastructure: { health: 20 },
  health: { health: 20 },
  education: { health: 20 },
  agriculture: { health: 20 },
  youth: { health: 20 },
  interior: { health: 20 },
  environment: { health: 20 },
};

const allNeutral: AllSectorHealthInputs = {
  economy: { health: 55 },
  infrastructure: { health: 55 },
  health: { health: 55 },
  education: { health: 55 },
  agriculture: { health: 55 },
  youth: { health: 55 },
  interior: { health: 55 },
  environment: { health: 55 },
};

describe("computeSectorLegacyDelta", () => {
  it("returns a positive delta when all sectors are healthy (>70)", () => {
    const delta = computeSectorLegacyDelta(allHealthy);
    expect(delta).toBeGreaterThan(0);
  });

  it("returns a negative delta when all sectors are poor (<40)", () => {
    const delta = computeSectorLegacyDelta(allPoor);
    expect(delta).toBeLessThan(0);
  });

  it("returns near-zero delta when all sectors are in the neutral range (40-70)", () => {
    const delta = computeSectorLegacyDelta(allNeutral);
    expect(delta).toBeGreaterThanOrEqual(-3);
    expect(delta).toBeLessThanOrEqual(3);
  });

  it("clamps output to [-15, +10]", () => {
    const extremeGood: AllSectorHealthInputs = {
      economy: { health: 100 },
      infrastructure: { health: 100 },
      health: { health: 100 },
      education: { health: 100 },
      agriculture: { health: 100 },
      youth: { health: 100 },
      interior: { health: 100 },
      environment: { health: 100 },
    };
    const extremeBad: AllSectorHealthInputs = {
      economy: { health: 0 },
      infrastructure: { health: 0 },
      health: { health: 0 },
      education: { health: 0 },
      agriculture: { health: 0 },
      youth: { health: 0 },
      interior: { health: 0 },
      environment: { health: 0 },
    };
    expect(computeSectorLegacyDelta(extremeGood)).toBeLessThanOrEqual(10);
    expect(computeSectorLegacyDelta(extremeBad)).toBeGreaterThanOrEqual(-15);
  });

  it("weights Economy higher than Environment (20% vs 7%)", () => {
    const highEconomy: AllSectorHealthInputs = {
      ...allNeutral,
      economy: { health: 85 },
      environment: { health: 55 },
    };
    const highEnvironment: AllSectorHealthInputs = {
      ...allNeutral,
      economy: { health: 55 },
      environment: { health: 85 },
    };
    const econDelta = computeSectorLegacyDelta(highEconomy);
    const envDelta = computeSectorLegacyDelta(highEnvironment);
    expect(econDelta).toBeGreaterThan(envDelta);
  });
});

describe("computeLegacyScore with sector delta", () => {
  it("returns plain milestone sum when no sectors provided", () => {
    const milestones: LegacyMilestoneRecord[] = [
      { title: "A", date: "1 Jan", pillar: "Economic", impact: 20, description: "test", day: 5 },
    ];
    expect(computeLegacyScore(milestones)).toBe(20);
  });

  it("blends milestone score (40%) and sector delta (60%) when sectors provided", () => {
    const milestones: LegacyMilestoneRecord[] = [
      { title: "A", date: "1 Jan", pillar: "Economic", impact: 10, description: "test", day: 5 },
    ];
    const sectorDelta = computeSectorLegacyDelta(allHealthy);
    const blended = computeLegacyScore(milestones, allHealthy);
    const expected = 10 * 0.4 + sectorDelta * 0.6;
    expect(blended).toBeCloseTo(expected, 5);
  });

  it("healthy sectors produce a higher blended score than poor sectors", () => {
    const milestones: LegacyMilestoneRecord[] = [
      { title: "A", date: "1 Jan", pillar: "Governance", impact: 5, description: "test", day: 5 },
    ];
    const goodScore = computeLegacyScore(milestones, allHealthy);
    const badScore = computeLegacyScore(milestones, allPoor);
    expect(goodScore).toBeGreaterThan(badScore);
  });
});
