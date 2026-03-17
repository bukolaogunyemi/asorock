import { describe, it, expect } from "vitest";
import {
  migrateOldCompetencies,
  migrateHandcraftedCompetencies,
  generateProceduralCompetencies,
  getTopN,
  deriveBetrayalThreshold,
} from "./competencyUtils";

describe("migrateOldCompetencies", () => {
  it("converts old loyalty/competence/ambition to new model", () => {
    const result = migrateOldCompetencies({
      loyalty: 75,
      competence: 60,
      ambition: 40,
      portfolio: "Minister of Finance",
    });
    expect(result.personal.loyalty).toBe(75);
    expect(result.personal.ambition).toBe(40);
    expect(result.professional.economics).toBeGreaterThanOrEqual(50);
    for (const val of Object.values(result.professional)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
    for (const val of Object.values(result.personal)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });
});

describe("migrateHandcraftedCompetencies", () => {
  it("maps 5-key 1-5 scale to 14-key 0-100 scale", () => {
    const old = { charisma: 4, diplomacy: 5, economics: 3, military: 2, leadership: 4 };
    const result = migrateHandcraftedCompetencies(old, 70, 50);
    expect(result.personal.charisma).toBe(80);
    expect(result.professional.diplomacy).toBe(100);
    expect(result.professional.economics).toBe(60);
    expect(result.professional.security).toBe(40);
    expect(result.personal.leadership).toBe(80);
    expect(result.personal.loyalty).toBe(70);
    expect(result.personal.ambition).toBe(50);
    expect(result.professional.communications).toBeGreaterThan(0);
    expect(result.personal.integrity).toBeGreaterThan(0);
  });
});

describe("generateProceduralCompetencies", () => {
  it("generates all 14 competencies in valid range", () => {
    const result = generateProceduralCompetencies({
      portfolio: "Director of Security",
      faction: "Military Circle",
      age: 55,
      seed: 42,
    });
    for (const val of Object.values(result.professional)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
    for (const val of Object.values(result.personal)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
    expect(result.professional.security).toBeGreaterThanOrEqual(60);
  });

  it("produces deterministic results with same seed", () => {
    const opts = { portfolio: "Minister of Finance", faction: "Technocrats", age: 45, seed: 123 };
    const a = generateProceduralCompetencies(opts);
    const b = generateProceduralCompetencies(opts);
    expect(a).toEqual(b);
  });
});

describe("getTopN", () => {
  it("returns top 3 keys by value from professional competencies", () => {
    const comp = {
      economics: 90, diplomacy: 30, security: 70,
      communications: 50, legal: 60, administration: 40, technology: 80,
      management: 55, politics: 60,
    };
    const top3 = getTopN(comp, 3);
    expect(top3.map(t => t.key)).toEqual(["economics", "technology", "security"]);
    expect(top3[0].value).toBe(90);
  });
});

describe("deriveBetrayalThreshold", () => {
  it("computes threshold from integrity, loyalty, ambition", () => {
    const result = deriveBetrayalThreshold({ integrity: 60, loyalty: 70, ambition: 50 });
    expect(result).toBe(37);
  });

  it("floors at 15", () => {
    const result = deriveBetrayalThreshold({ integrity: 0, loyalty: 0, ambition: 100 });
    expect(result).toBe(15);
  });
});
