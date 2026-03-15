import { describe, expect, it } from "vitest";
import { AGENCY_CANDIDATES, AMBASSADOR_CANDIDATES, POSITION_DEFINITIONS } from "./appointmentPools";

describe("appointmentPools", () => {
  it("should define 12 agency positions", () => {
    const agencies = POSITION_DEFINITIONS.filter((p) => p.category === "agency");
    expect(agencies.length).toBe(12);
  });

  it("should define 10 ambassador postings", () => {
    const ambassadors = POSITION_DEFINITIONS.filter((p) => p.category === "ambassador");
    expect(ambassadors.length).toBe(10);
  });

  it("should have candidates from all 6 zones for each agency", () => {
    for (const position of POSITION_DEFINITIONS.filter((p) => p.category === "agency")) {
      const candidates = AGENCY_CANDIDATES.filter((c) => c.qualifiedFor.includes(position.id));
      const zones = new Set(candidates.map((c) => c.zone));
      expect(zones.size).toBe(6);
    }
  });

  it("should have at least 2 women per zone per strategic agency", () => {
    for (const position of POSITION_DEFINITIONS.filter((p) => p.category === "agency" && p.prestigeTier === "strategic")) {
      for (const zone of ["NC", "NW", "NE", "SW", "SE", "SS"]) {
        const women = AGENCY_CANDIDATES.filter(
          (c) => c.qualifiedFor.includes(position.id) && c.zone === zone && c.gender === "Female"
        );
        expect(women.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("candidate competence should be 30-95", () => {
    for (const c of [...AGENCY_CANDIDATES, ...AMBASSADOR_CANDIDATES]) {
      expect(c.competence).toBeGreaterThanOrEqual(30);
      expect(c.competence).toBeLessThanOrEqual(95);
    }
  });

  it("should have unique character IDs", () => {
    const all = [...AGENCY_CANDIDATES, ...AMBASSADOR_CANDIDATES];
    const ids = all.map((c) => c.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
