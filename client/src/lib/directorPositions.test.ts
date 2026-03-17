// client/src/lib/directorPositions.test.ts
import { describe, it, expect } from "vitest";
import {
  DIRECTOR_POSITIONS,
  getPositionsByMinistry,
  getPositionById,
} from "./directorPositions";
import type { MinistryKey } from "./directorTypes";
import { PROFESSIONAL_KEYS } from "./competencyTypes";

const ALL_MINISTRIES: MinistryKey[] = [
  "Finance",
  "Health",
  "Education",
  "Agriculture & Rural Development",
  "Works & Housing",
  "Petroleum",
  "Power",
  "Labour & Employment",
  "Interior",
  "Trade & Investment",
  "Communications & Digital Economy",
  "Environment",
  "Justice",
  "Transport",
  "Youth Development",
  "Foreign Affairs",
  "Defence",
];

describe("DIRECTOR_POSITIONS", () => {
  it("has exactly 49 positions", () => {
    expect(DIRECTOR_POSITIONS).toHaveLength(49);
  });

  it("represents all 17 ministries", () => {
    const ministriesInData = new Set(DIRECTOR_POSITIONS.map((p) => p.ministry));
    for (const ministry of ALL_MINISTRIES) {
      expect(ministriesInData.has(ministry)).toBe(true);
    }
  });

  it("has no duplicate IDs", () => {
    const ids = DIRECTOR_POSITIONS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all primaryCompetency values are valid", () => {
    const validKeys = new Set(PROFESSIONAL_KEYS);
    for (const position of DIRECTOR_POSITIONS) {
      expect(validKeys.has(position.primaryCompetency as (typeof PROFESSIONAL_KEYS)[number])).toBe(true);
    }
  });

  it("all sectorInfluence values are strings", () => {
    for (const position of DIRECTOR_POSITIONS) {
      expect(Array.isArray(position.sectorInfluence)).toBe(true);
      for (const sector of position.sectorInfluence) {
        expect(typeof sector).toBe("string");
      }
    }
  });

  it("all weight values are between 0.1 and 1.0", () => {
    for (const position of DIRECTOR_POSITIONS) {
      expect(position.weight).toBeGreaterThanOrEqual(0.1);
      expect(position.weight).toBeLessThanOrEqual(1.0);
    }
  });

  it("all prestigeTier values are valid", () => {
    const validTiers = new Set(["strategic", "standard", "routine"]);
    for (const position of DIRECTOR_POSITIONS) {
      expect(validTiers.has(position.prestigeTier)).toBe(true);
    }
  });
});

describe("getPositionsByMinistry", () => {
  it("returns correct count for Finance", () => {
    expect(getPositionsByMinistry("Finance")).toHaveLength(5);
  });

  it("returns correct count for Health", () => {
    expect(getPositionsByMinistry("Health")).toHaveLength(4);
  });

  it("returns empty array for unknown ministry cast", () => {
    // This tests runtime behaviour — TypeScript would catch invalid keys at compile time
    expect(getPositionsByMinistry("Unknown" as MinistryKey)).toHaveLength(0);
  });
});

describe("getPositionById", () => {
  it("finds an existing position", () => {
    const pos = getPositionById("governor-central-bank");
    expect(pos).toBeDefined();
    expect(pos?.title).toBe("Governor, Central Bank");
  });

  it("returns undefined for unknown id", () => {
    expect(getPositionById("nonexistent-id")).toBeUndefined();
  });
});
