import { describe, it, expect } from "vitest";
import { generateBrief } from "./intelligenceBrief";

describe("generateBrief", () => {
  const baseState = {
    day: 1,
    date: "30 May 1999",
    approval: 50,
    stability: 60,
    treasury: 1.2,
    politicalCapital: 50,
    stress: 20,
    trust: 60,
    outrage: 10,
    health: 80,
    macroEconomy: { inflation: 15, fxRate: 750, reserves: 20, debtToGdp: 30, oilOutput: 2.0, subsidyPressure: 5 },
    economy: { inflation: 15, fxRate: 750, oilOutput: 2.0, gdpGrowthRate: 0.02, reserves: 20 },
    factions: { nc: { name: "Northern Caucus", influence: 50, loyalty: 60, stance: "Neutral", grievance: 20, firedThresholds: [] } },
    vicePresident: { name: "VP", loyalty: 60, ambition: 30, relationship: "Friendly", mood: "Steady" },
    activeEvents: [],
    turnLog: [],
    headlines: [],
  } as any;

  it("generates a brief with all required sections", () => {
    const prev = { ...baseState, day: 1, approval: 52 };
    const next = { ...baseState, day: 2, approval: 48 };
    const brief = generateBrief(prev, next);
    expect(brief.day).toBe(2);
    expect(brief.executiveSummary).toBeTruthy();
    expect(brief.sections.political).toBeDefined();
    expect(brief.sections.economic).toBeDefined();
    expect(brief.sections.security).toBeDefined();
    expect(brief.sections.diplomatic).toBeDefined();
    expect(brief.dismissed).toBe(false);
  });

  it("includes metric changes when values differ", () => {
    const prev = { ...baseState, day: 1, approval: 55 };
    const next = { ...baseState, day: 2, approval: 48 };
    const brief = generateBrief(prev, next);
    expect(brief.metricChanges.length).toBeGreaterThan(0);
    expect(brief.metricChanges.some((m) => m.label === "Approval")).toBe(true);
  });

  it("returns empty metric changes when nothing changed", () => {
    const brief = generateBrief(baseState, baseState);
    expect(brief.metricChanges).toHaveLength(0);
  });
});
