import { describe, it, expect } from "vitest";
import {
  generateGovernorPool,
  getGovernorCandidatesForState,
  getGovernorPool,
  GOVERNABLE_STATES,
} from "./governorPool";

describe("generateGovernorPool", () => {
  const pool = generateGovernorPool();

  it("total pool size is 144 (36 states × 4 candidates)", () => {
    expect(pool).toHaveLength(144);
  });

  it("covers exactly 36 states", () => {
    const states = new Set(pool.map(c => c.state));
    expect(states.size).toBe(36);
  });

  it("every state has exactly 4 candidates", () => {
    for (const state of GOVERNABLE_STATES) {
      const candidates = pool.filter(c => c.state === state);
      expect(candidates).toHaveLength(4);
    }
  });

  it("FCT is not in the pool", () => {
    const fctCandidates = pool.filter(c => c.state === "FCT");
    expect(fctCandidates).toHaveLength(0);
  });

  it("no duplicate names across the entire pool", () => {
    const names = pool.map(c => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("all 8 parties are represented in the pool", () => {
    const parties = new Set(pool.map(c => c.party));
    const expectedParties = ["ADU", "PFC", "NDM", "NSF", "TLA", "HDP", "PAP", "UPA"];
    for (const party of expectedParties) {
      expect(parties.has(party)).toBe(true);
    }
  });

  it("each state has candidates from different parties (no 2 from same party per state)", () => {
    for (const state of GOVERNABLE_STATES) {
      const candidates = pool.filter(c => c.state === state);
      const parties = candidates.map(c => c.party);
      const uniqueParties = new Set(parties);
      expect(uniqueParties.size).toBe(4);
    }
  });

  it("all candidates have age in range 35–68", () => {
    for (const candidate of pool) {
      expect(candidate.age).toBeGreaterThanOrEqual(35);
      expect(candidate.age).toBeLessThanOrEqual(68);
    }
  });

  it("gender balance: at least 30% female overall", () => {
    const femaleCount = pool.filter(c => c.gender === "Female").length;
    const femalePercent = (femaleCount / pool.length) * 100;
    expect(femalePercent).toBeGreaterThanOrEqual(30);
  });

  it("competence is in range 40–90", () => {
    for (const candidate of pool) {
      expect(candidate.competence).toBeGreaterThanOrEqual(40);
      expect(candidate.competence).toBeLessThanOrEqual(90);
    }
  });

  it("popularity is in range 30–85", () => {
    for (const candidate of pool) {
      expect(candidate.popularity).toBeGreaterThanOrEqual(30);
      expect(candidate.popularity).toBeLessThanOrEqual(85);
    }
  });

  it("financialStrength is in range 20–80", () => {
    for (const candidate of pool) {
      expect(candidate.financialStrength).toBeGreaterThanOrEqual(20);
      expect(candidate.financialStrength).toBeLessThanOrEqual(80);
    }
  });

  it("all candidates start with incumbentAdvantage: false", () => {
    for (const candidate of pool) {
      expect(candidate.incumbentAdvantage).toBe(false);
    }
  });

  it("all candidates have a zone string", () => {
    for (const candidate of pool) {
      expect(candidate.zone).toBeTruthy();
      expect(["NW", "NE", "NC", "SW", "SE", "SS"]).toContain(candidate.zone);
    }
  });

  it("all candidates have a non-empty bio", () => {
    for (const candidate of pool) {
      expect(candidate.bio.length).toBeGreaterThan(10);
    }
  });

  it("all candidates have traits", () => {
    for (const candidate of pool) {
      expect(candidate.traits.length).toBeGreaterThan(0);
    }
  });

  it("generates deterministically for the same seed", () => {
    const pool1 = generateGovernorPool(42);
    const pool2 = generateGovernorPool(42);
    expect(pool1.map(c => c.name)).toEqual(pool2.map(c => c.name));
    expect(pool1.map(c => c.party)).toEqual(pool2.map(c => c.party));
  });

  it("generates different results for different seeds", () => {
    const pool1 = generateGovernorPool(100);
    const pool2 = generateGovernorPool(999);
    const names1 = pool1.map(c => c.name).join(",");
    const names2 = pool2.map(c => c.name).join(",");
    expect(names1).not.toBe(names2);
  });

  it("NW zone candidates have ADU as most common party (dominant zone party)", () => {
    const nwCandidates = pool.filter(c => c.zone === "NW");
    const aduCount = nwCandidates.filter(c => c.party === "ADU").length;
    // ADU is the top party in NW — each NW state has exactly 1 ADU candidate (7 states)
    expect(aduCount).toBe(7);
  });

  it("SW zone candidates have PFC as dominant party (one per state)", () => {
    const swCandidates = pool.filter(c => c.zone === "SW");
    const pfcCount = swCandidates.filter(c => c.party === "PFC").length;
    // PFC is top in SW — 6 SW states, 1 PFC per state
    expect(pfcCount).toBe(6);
  });
});

describe("getGovernorCandidatesForState", () => {
  it("returns exactly 4 candidates for a valid state", () => {
    const candidates = getGovernorCandidatesForState("Lagos");
    expect(candidates).toHaveLength(4);
  });

  it("returns empty array for invalid state", () => {
    const candidates = getGovernorCandidatesForState("FCT");
    expect(candidates).toHaveLength(0);
  });

  it("all returned candidates belong to the requested state", () => {
    const candidates = getGovernorCandidatesForState("Kano");
    for (const c of candidates) {
      expect(c.state).toBe("Kano");
    }
  });

  it("returns candidates for multiple different states correctly", () => {
    const states = ["Borno", "Rivers", "Oyo", "Anambra"];
    for (const state of states) {
      const candidates = getGovernorCandidatesForState(state);
      expect(candidates).toHaveLength(4);
    }
  });
});

describe("getGovernorPool (cached)", () => {
  it("returns the same reference on repeated calls (caching)", () => {
    const pool1 = getGovernorPool();
    const pool2 = getGovernorPool();
    expect(pool1).toBe(pool2);
  });

  it("cached pool has 144 entries", () => {
    expect(getGovernorPool()).toHaveLength(144);
  });
});
