import { describe, it, expect } from "vitest";
import {
  generateLGAChairpersons,
  getLGAChairpersons,
  getChairpersonsForState,
  getChairpersonForLGA,
  resetLGAChairpersonCache,
} from "./lgaChairpersons";
import { LGA_BY_STATE } from "./lgaData";

describe("lgaChairpersons", () => {
  // Use a fixed seed for determinism tests
  const pool = generateLGAChairpersons(7001);

  it("total chairperson count is 774", () => {
    expect(pool).toHaveLength(774);
  });

  it("every LGA has exactly one chairperson", () => {
    for (const [state, lgas] of Object.entries(LGA_BY_STATE)) {
      for (const lga of lgas) {
        const found = pool.filter((c) => c.state === state && c.lga === lga);
        expect(found, `No chairperson found for ${state} / ${lga}`).toHaveLength(1);
      }
    }
  });

  it("no duplicate names across the full pool", () => {
    const names = pool.map((c) => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("all 8 parties are represented in the pool", () => {
    const parties = new Set(pool.map((c) => c.party));
    const expected = ["ADU", "PFC", "NDM", "NSF", "TLA", "HDP", "PAP", "UPA"];
    for (const p of expected) {
      expect(parties.has(p), `Party ${p} not found in LGA chairperson pool`).toBe(true);
    }
  });

  it("generation is deterministic — same seed produces identical output", () => {
    const pool2 = generateLGAChairpersons(7001);
    expect(pool.map((c) => c.name)).toEqual(pool2.map((c) => c.name));
    expect(pool.map((c) => c.party)).toEqual(pool2.map((c) => c.party));
  });

  it("different seeds produce different outputs", () => {
    const pool3 = generateLGAChairpersons(1234);
    const same = pool.every((c, i) => c.name === pool3[i].name);
    expect(same).toBe(false);
  });

  it("all chairpersons have competence in range 30–80", () => {
    for (const c of pool) {
      expect(c.competence, `${c.name} competence out of range`).toBeGreaterThanOrEqual(30);
      expect(c.competence, `${c.name} competence out of range`).toBeLessThanOrEqual(80);
    }
  });

  it("all chairpersons have popularity in range 25–75", () => {
    for (const c of pool) {
      expect(c.popularity, `${c.name} popularity out of range`).toBeGreaterThanOrEqual(25);
      expect(c.popularity, `${c.name} popularity out of range`).toBeLessThanOrEqual(75);
    }
  });

  it("getChairpersonsForState returns correct count for Kano (44)", () => {
    resetLGAChairpersonCache();
    const kanoChairs = getChairpersonsForState("Kano");
    expect(kanoChairs).toHaveLength(44);
  });

  it("getChairpersonForLGA returns a chairperson for a known LGA", () => {
    const chair = getChairpersonForLGA("Lagos", "Ikeja");
    expect(chair).toBeDefined();
    expect(chair?.state).toBe("Lagos");
    expect(chair?.lga).toBe("Ikeja");
  });

  it("getChairpersonForLGA returns undefined for unknown LGA", () => {
    const chair = getChairpersonForLGA("Lagos", "Nonexistent");
    expect(chair).toBeUndefined();
  });

  it("getLGAChairpersons cache returns same reference on second call", () => {
    resetLGAChairpersonCache();
    const a = getLGAChairpersons();
    const b = getLGAChairpersons();
    expect(a).toBe(b);
  });
});
