import { describe, it, expect } from "vitest";
import { computePoliticalWeather, type PoliticalWeather } from "./politicalWeather";

const baseFactions = {
  "northern-caucus": { name: "Northern Caucus", influence: 50, loyalty: 60, stance: "Cooperative" as const, grievance: 20, firedThresholds: [] },
  "southern-bloc": { name: "Southern Bloc", influence: 40, loyalty: 50, stance: "Neutral" as const, grievance: 15, firedThresholds: [] },
};

describe("computePoliticalWeather", () => {
  it("returns Calm when grievances are low and VP loyal", () => {
    const result = computePoliticalWeather(baseFactions, { loyalty: 80 } as any, []);
    expect(result.level).toBe("Calm");
    expect(result.score).toBeLessThanOrEqual(25);
  });

  it("returns Brewing when average grievance is moderate", () => {
    const factions = {
      ...baseFactions,
      "northern-caucus": { ...baseFactions["northern-caucus"], grievance: 40 },
      "southern-bloc": { ...baseFactions["southern-bloc"], grievance: 35 },
    };
    const result = computePoliticalWeather(factions, { loyalty: 80 } as any, []);
    expect(result.level).toBe("Brewing");
  });

  it("adds 15 when VP loyalty < 40", () => {
    const result = computePoliticalWeather(baseFactions, { loyalty: 30 } as any, []);
    expect(result.score).toBeGreaterThanOrEqual(32);
  });

  it("adds 10 per Hostile faction", () => {
    const factions = {
      ...baseFactions,
      "northern-caucus": { ...baseFactions["northern-caucus"], stance: "Hostile" as const, grievance: 20 },
    };
    const result = computePoliticalWeather(factions, { loyalty: 80 } as any, []);
    expect(result.score).toBeGreaterThanOrEqual(27);
  });

  it("adds 20 for impeachment events", () => {
    const events = [{ id: "e1", title: "Impeachment Threat", description: "test", severity: "critical" as const, category: "politics" as const, source: "contextual" as const, choices: [], createdDay: 1 }];
    const result = computePoliticalWeather(baseFactions, { loyalty: 80 } as any, events);
    expect(result.score).toBeGreaterThanOrEqual(37);
  });

  it("returns Crisis when score exceeds 76", () => {
    const factions = {
      "f1": { name: "F1", influence: 50, loyalty: 10, stance: "Hostile" as const, grievance: 80, firedThresholds: [] },
      "f2": { name: "F2", influence: 50, loyalty: 10, stance: "Hostile" as const, grievance: 70, firedThresholds: [] },
    };
    const events = [{ id: "e1", title: "Coup rumours", description: "test", severity: "critical" as const, category: "politics" as const, source: "contextual" as const, choices: [], createdDay: 1 }];
    const result = computePoliticalWeather(factions, { loyalty: 20 } as any, events);
    expect(result.level).toBe("Crisis");
  });
});
