import { describe, expect, it } from "vitest";
import { AMBASSADOR_CANDIDATES, POSITION_DEFINITIONS } from "./appointmentPools";

describe("appointmentPools", () => {
  it("should define 10 ambassador postings", () => {
    const ambassadors = POSITION_DEFINITIONS.filter((p) => p.category === "ambassador");
    expect(ambassadors.length).toBe(10);
  });

  it("should define 7 cabinet positions", () => {
    const cabinet = POSITION_DEFINITIONS.filter((p) => p.category === "cabinet");
    expect(cabinet.length).toBe(7);
  });

  it("candidate competence should be 30-95", () => {
    for (const c of AMBASSADOR_CANDIDATES) {
      expect(c.competence).toBeGreaterThanOrEqual(30);
      expect(c.competence).toBeLessThanOrEqual(95);
    }
  });

  it("should have unique character IDs", () => {
    const ids = AMBASSADOR_CANDIDATES.map((c) => c.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
