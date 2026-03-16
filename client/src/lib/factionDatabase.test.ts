import { describe, it, expect } from "vitest";
import { FACTION_DATABASE, getFactionData } from "./factionDatabase";
import { factions } from "./gameData";

describe("FACTION_DATABASE", () => {
  it("has exactly 7 factions", () => {
    expect(Object.keys(FACTION_DATABASE).length).toBe(7);
  });

  it("faction names match gameData.ts exactly", () => {
    for (const faction of factions) {
      expect(
        getFactionData(faction.name),
        `Missing faction data for "${faction.name}"`
      ).toBeDefined();
    }
  });

  it("every entry has all required fields", () => {
    for (const [key, data] of Object.entries(FACTION_DATABASE)) {
      expect(data.name, `${key} missing name`).toBeTruthy();
      expect(data.description.length, `${key} missing description`).toBeGreaterThan(20);
      expect(data.primaryZone, `${key} missing primaryZone`).toBeTruthy();
      expect(data.ideology, `${key} missing ideology`).toBeTruthy();
      expect(data.keyInterests.length, `${key} missing keyInterests`).toBeGreaterThan(0);
    }
  });
});

describe("getFactionData", () => {
  it("finds Northern Caucus by name", () => {
    expect(getFactionData("Northern Caucus")?.name).toBe("Northern Caucus");
  });

  it("finds Youth Movement by name", () => {
    expect(getFactionData("Youth Movement")?.name).toBe("Youth Movement");
  });

  it("returns undefined for unknown faction", () => {
    expect(getFactionData("Shadow Council")).toBeUndefined();
  });
});
