// client/src/lib/characterGeneration.test.ts
import { describe, it, expect } from "vitest";
import { generateCareerHistory, generateBiography, POSITION_POOLS } from "./characterGeneration";

describe("generateCareerHistory", () => {
  it("generates entries based on age", () => {
    const history = generateCareerHistory({
      age: 55,
      state: "Kano",
      topCompetencies: ["economics", "administration"],
      currentPosition: "Minister of Finance",
      gameYear: 2027,
      seed: 42,
    });
    // age 55 → floor((55-30)/6) = 4 past entries + 1 current = 5 total
    expect(history.length).toBe(5);
    expect(history[0].current).toBe(true);
    expect(history[0].position).toBe("Minister of Finance");
    for (const entry of history.slice(1)) {
      expect(entry.current).toBe(false);
      expect(entry.period).toBeTruthy();
    }
  });

  it("generates 1 past entry for young characters", () => {
    const history = generateCareerHistory({
      age: 35,
      state: "Lagos",
      topCompetencies: ["media"],
      currentPosition: "Press Secretary",
      gameYear: 2027,
      seed: 99,
    });
    // age 35 → floor((35-30)/6) = 0, clamped to 1 past + 1 current = 2 total
    expect(history.length).toBe(2);
    expect(history[0].current).toBe(true);
  });

  it("produces deterministic results with same seed", () => {
    const opts = {
      age: 50, state: "Rivers", topCompetencies: ["security", "administration"] as string[],
      currentPosition: "DSS Director", gameYear: 2027, seed: 77,
    };
    expect(generateCareerHistory(opts)).toEqual(generateCareerHistory(opts));
  });
});

describe("generateBiography", () => {
  it("generates 4-5 sentences", () => {
    const bio = generateBiography({
      name: "Alhaji Musa Ibrahim",
      state: "Kano",
      ethnicity: "Hausa-Fulani",
      education: "ABU Zaria (LLB), Georgetown (MBA)",
      traits: ["Dealmaker", "Cunning"],
      faction: "Northern Caucus",
      careerHighlight: "Commissioner for Finance, Kano State",
      party: "ADU",
      seed: 42,
    });
    const sentences = bio.split(/[.!?]+/).filter(s => s.trim().length > 0);
    expect(sentences.length).toBeGreaterThanOrEqual(4);
    expect(sentences.length).toBeLessThanOrEqual(5);
    expect(bio).toContain("Kano");
  });
});

describe("POSITION_POOLS", () => {
  it("has pools for all 7 professional competency domains", () => {
    const domains = ["economics", "diplomacy", "security", "media", "legal", "administration", "technology"];
    for (const domain of domains) {
      expect(POSITION_POOLS[domain]).toBeDefined();
      expect(POSITION_POOLS[domain].federal).toBeDefined();
      expect(POSITION_POOLS[domain].federal.length).toBeGreaterThan(0);
      expect(POSITION_POOLS[domain].state).toBeDefined();
      expect(POSITION_POOLS[domain].state.length).toBeGreaterThan(0);
    }
  });
});
