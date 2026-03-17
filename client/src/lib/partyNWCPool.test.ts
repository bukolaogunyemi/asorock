import { describe, it, expect } from "vitest";
import {
  generateNWCPool,
  getCandidatesForPosition,
  type NWCCandidate,
} from "./partyNWCPool";
import type { NWCPosition } from "./partyTypes";

const PARTY_IDS = ["adu", "pfc", "ndm", "nsf", "tla", "hdp", "pap", "upa"];
const NWC_POSITIONS: NWCPosition[] = [
  "national-chairman",
  "vice-chairman",
  "national-secretary",
  "national-treasurer",
  "publicity-secretary",
  "organising-secretary",
  "legal-adviser",
  "youth-women-leader",
];

describe("NWC Candidate Pool", () => {
  const pool = generateNWCPool(42);

  it("generates ~200 candidates total", () => {
    expect(pool.length).toBe(200);
  });

  it("every party has 25 candidates", () => {
    for (const pid of PARTY_IDS) {
      const count = pool.filter((c) => c.partyId === pid).length;
      expect(count).toBe(25);
    }
  });

  it("every NWC position has candidates across parties", () => {
    for (const pos of NWC_POSITIONS) {
      const withPos = pool.filter((c) => c.qualifiedPositions.includes(pos));
      expect(withPos.length).toBeGreaterThan(0);
    }
  });

  it("has no duplicate names", () => {
    const names = pool.map((c) => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("covers all six geopolitical zones", () => {
    const zones = new Set(pool.map((c) => c.zone));
    expect(zones.size).toBe(6);
    for (const z of ["NC", "NW", "NE", "SW", "SE", "SS"]) {
      expect(zones.has(z)).toBe(true);
    }
  });

  it("meets 35% minimum female representation", () => {
    for (const pid of PARTY_IDS) {
      const party = pool.filter((c) => c.partyId === pid);
      const femaleCount = party.filter((c) => c.gender === "Female").length;
      const pct = (femaleCount / party.length) * 100;
      expect(pct).toBeGreaterThanOrEqual(35);
    }
  });

  it("each candidate has 2-3 qualified positions", () => {
    for (const c of pool) {
      expect(c.qualifiedPositions.length).toBeGreaterThanOrEqual(2);
      expect(c.qualifiedPositions.length).toBeLessThanOrEqual(3);
    }
  });

  it("getCandidatesForPosition returns correct subset", () => {
    const aduChairCandidates = getCandidatesForPosition(
      "adu",
      "national-chairman",
    );
    expect(aduChairCandidates.length).toBeGreaterThan(0);
    for (const c of aduChairCandidates) {
      expect(c.partyId).toBe("adu");
      expect(c.qualifiedPositions).toContain("national-chairman");
    }
  });
});
