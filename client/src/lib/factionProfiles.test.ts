import { describe, it, expect } from "vitest";
import { FACTION_PROFILES } from "./factionProfiles";

describe("FACTION_PROFILES integrity", () => {
  it("has exactly 7 profiles", () => {
    expect(FACTION_PROFILES).toHaveLength(7);
  });
  it("every profile key matches a faction name in gameData", () => {
    const expectedKeys = [
      "Northern Caucus", "South-West Alliance", "South-East Bloc",
      "Presidential Guard", "Military Circle", "Technocrats", "Youth Movement",
    ];
    const profileKeys = FACTION_PROFILES.map((p) => p.key);
    expect(profileKeys.sort()).toEqual(expectedKeys.sort());
  });
});
