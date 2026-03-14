import { describe, it, expect } from "vitest";
import { PARTIES, BASE_VOTE_SHARES, getPartyById } from "./parties";

describe("PARTIES data integrity", () => {
  it("has exactly 8 parties", () => {
    expect(PARTIES).toHaveLength(8);
  });

  it("all parties have unique 3-letter abbreviations", () => {
    const abbreviations = PARTIES.map((p) => p.id);
    const unique = new Set(abbreviations);
    expect(unique.size).toBe(8);
    abbreviations.forEach((id) => {
      expect(id).toMatch(/^[A-Z]{3}$/);
    });
  });

  it("all 7 ideology dimensions are in range -2 to +2", () => {
    const dimensions: Array<keyof import("./parties").IdeologyProfile> = [
      "economic",
      "federalism",
      "social",
      "security",
      "welfare",
      "foreignPolicy",
      "cultural",
    ];
    PARTIES.forEach((party) => {
      dimensions.forEach((dim) => {
        const value = party.ideology[dim];
        expect(value).toBeGreaterThanOrEqual(-2);
        expect(value).toBeLessThanOrEqual(2);
      });
    });
  });

  it("getPartyById returns the correct party", () => {
    const aduParty = getPartyById("ADU");
    expect(aduParty).toBeDefined();
    expect(aduParty?.name).toBe("African Democratic Union");

    const pfcParty = getPartyById("PFC");
    expect(pfcParty).toBeDefined();
    expect(pfcParty?.name).toBe("People's Freedom Congress");
  });

  it("getPartyById returns undefined for unknown id", () => {
    const result = getPartyById("XYZ");
    expect(result).toBeUndefined();
  });

  it("BASE_VOTE_SHARES has entries for all 8 parties plus Others", () => {
    const partyIds = PARTIES.map((p) => p.id);
    partyIds.forEach((id) => {
      expect(BASE_VOTE_SHARES[id]).toBeDefined();
      expect(BASE_VOTE_SHARES[id]).toHaveLength(6);
    });
    expect(BASE_VOTE_SHARES["Others"]).toBeDefined();
    expect(BASE_VOTE_SHARES["Others"]).toHaveLength(6);
  });
});
