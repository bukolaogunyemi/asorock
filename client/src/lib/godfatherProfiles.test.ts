import { describe, expect, it } from "vitest";
import { GODFATHER_PROFILES } from "./godfatherProfiles";

describe("godfatherProfiles", () => {
  it("should have 20-25 godfathers", () => {
    expect(GODFATHER_PROFILES.length).toBeGreaterThanOrEqual(20);
    expect(GODFATHER_PROFILES.length).toBeLessThanOrEqual(25);
  });

  it("should cover all 6 geopolitical zones", () => {
    const zones = new Set(GODFATHER_PROFILES.map((g) => g.zone));
    expect(zones.size).toBe(6);
    for (const z of ["NC", "NW", "NE", "SW", "SE", "SS"]) {
      expect(zones.has(z)).toBe(true);
    }
  });

  it("should have 3-4 godfathers per zone", () => {
    const zoneCounts: Record<string, number> = {};
    for (const g of GODFATHER_PROFILES) {
      zoneCounts[g.zone] = (zoneCounts[g.zone] || 0) + 1;
    }
    for (const count of Object.values(zoneCounts)) {
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it("should cover all 7 archetypes", () => {
    const archetypes = new Set(GODFATHER_PROFILES.map((g) => g.archetype));
    expect(archetypes.size).toBe(7);
  });

  it("should have unique IDs", () => {
    const ids = GODFATHER_PROFILES.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all traits should be 0-100", () => {
    for (const g of GODFATHER_PROFILES) {
      for (const [, value] of Object.entries(g.traits)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      }
    }
  });

  it("should have ~60% revealed connections", () => {
    for (const g of GODFATHER_PROFILES) {
      const total = g.stable.connections.length;
      if (total > 0) {
        const revealed = g.stable.connections.filter((c) => c.revealed).length;
        const ratio = revealed / total;
        expect(ratio).toBeGreaterThanOrEqual(0.4);
        expect(ratio).toBeLessThanOrEqual(0.8);
      }
    }
  });
});
