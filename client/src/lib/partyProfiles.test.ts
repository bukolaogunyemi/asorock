import { describe, expect, it } from "vitest";
import { PARTY_PROFILES, NWC_CHARACTERS } from "./partyProfiles";

describe("partyProfiles", () => {
  it("should define all 8 parties", () => {
    expect(PARTY_PROFILES.length).toBe(8);
  });

  it("each party should have 8 NWC members", () => {
    for (const party of PARTY_PROFILES) {
      const members = NWC_CHARACTERS.filter((c) => c.partyId === party.id);
      expect(members.length).toBe(8);
    }
  });

  it("each party NWC should cover all 6 zones", () => {
    for (const party of PARTY_PROFILES) {
      const members = NWC_CHARACTERS.filter((c) => c.partyId === party.id);
      const zones = new Set(members.map((m) => m.zone));
      expect(zones.size).toBe(6);
    }
  });

  it("each party NWC should have all 8 positions filled", () => {
    for (const party of PARTY_PROFILES) {
      const members = NWC_CHARACTERS.filter((c) => c.partyId === party.id);
      const positions = new Set(members.map((m) => m.position));
      expect(positions.size).toBe(8);
    }
  });

  it("should have unique character IDs", () => {
    const ids = NWC_CHARACTERS.map((c) => c.characterId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("party abbreviations should match existing parties", () => {
    const expected = ["ADU", "PFC", "NDM", "NSF", "TLA", "HDP", "PAP", "UPA"];
    const actual = PARTY_PROFILES.map((p) => p.abbreviation);
    expect(actual.sort()).toEqual(expected.sort());
  });
});
