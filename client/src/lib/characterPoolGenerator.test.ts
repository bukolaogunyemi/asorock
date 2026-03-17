import { describe, it, expect } from "vitest";
import { generateCharacterPool } from "./characterPoolGenerator";
import { GEOPOLITICAL_ZONES } from "./zones";

// ────────────────────────────────────────────────────────────
// 1. Required fields
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — required fields", () => {
  it("each character has all required fields", () => {
    const pool = generateCharacterPool({ count: 10, seed: 42 });
    expect(pool).toHaveLength(10);

    for (const char of pool) {
      expect(char.name, "name").toBeTruthy();
      expect(char.state, "state").toBeTruthy();
      expect(["Male", "Female"]).toContain(char.gender);
      expect(["Islam", "Christianity"]).toContain(char.religion);
      expect(char.ethnicity, "ethnicity").toBeTruthy();
      expect(char.age, "age").toBeGreaterThan(0);
      expect(char.biography, "biography").toBeTruthy();
      expect(char.education, "education").toBeTruthy();
      expect(Array.isArray(char.traits), "traits is array").toBe(true);
      expect(char.traits.length, "traits count").toBeGreaterThanOrEqual(2);

      // Competencies — professional
      const prof = char.competencies.professional;
      expect(typeof prof.economics).toBe("number");
      expect(typeof prof.diplomacy).toBe("number");
      expect(typeof prof.security).toBe("number");
      expect(typeof prof.communications).toBe("number");
      expect(typeof prof.legal).toBe("number");
      expect(typeof prof.administration).toBe("number");
      expect(typeof prof.management).toBe("number");
      expect(typeof prof.technology).toBe("number");
      expect(typeof prof.politics).toBe("number");

      // Competencies — personal
      const pers = char.competencies.personal;
      expect(typeof pers.loyalty).toBe("number");
      expect(typeof pers.charisma).toBe("number");
      expect(typeof pers.leadership).toBe("number");
      expect(typeof pers.ambition).toBe("number");
      expect(typeof pers.integrity).toBe("number");
      expect(typeof pers.resilience).toBe("number");
      expect(typeof pers.intrigue).toBe("number");
      expect(typeof pers.discretion).toBe("number");

      // Career history
      expect(Array.isArray(char.careerHistory), "careerHistory is array").toBe(true);
      expect(char.careerHistory.length, "at least one career entry").toBeGreaterThanOrEqual(1);
      for (const entry of char.careerHistory) {
        expect(entry.position, "career position").toBeTruthy();
        expect(entry.period, "career period").toBeTruthy();
        expect(typeof entry.current).toBe("boolean");
      }
    }
  });
});

// ────────────────────────────────────────────────────────────
// 2. Zone enforcement
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — zone distribution", () => {
  it("respects zoneDistribution when provided", () => {
    const zoneDistribution = { NC: 3, SW: 4, SE: 3 };
    const pool = generateCharacterPool({
      count: 10,
      seed: 100,
      zoneDistribution,
    });
    expect(pool).toHaveLength(10);

    // Build a lookup: zone abbrev → set of states in that zone
    const zoneStateMap: Record<string, Set<string>> = {};
    for (const zone of GEOPOLITICAL_ZONES) {
      zoneStateMap[zone.abbrev] = new Set(zone.states);
    }

    // Count characters per zone based on their state
    const zoneCounts: Record<string, number> = { NC: 0, SW: 0, SE: 0 };
    for (const char of pool) {
      for (const [abbrev, states] of Object.entries(zoneStateMap)) {
        if (states.has(char.state) && abbrev in zoneCounts) {
          zoneCounts[abbrev]++;
          break;
        }
      }
    }

    expect(zoneCounts.NC).toBe(3);
    expect(zoneCounts.SW).toBe(4);
    expect(zoneCounts.SE).toBe(3);
  });
});

// ────────────────────────────────────────────────────────────
// 3. Gender balance
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — gender balance", () => {
  it("enforces minFemalePercent and minMalePercent of 40% each in a pool of 100", () => {
    const pool = generateCharacterPool({
      count: 100,
      seed: 777,
      genderBalance: { minFemalePercent: 40, minMalePercent: 40 },
    });
    expect(pool).toHaveLength(100);

    const femaleCount = pool.filter(c => c.gender === "Female").length;
    const maleCount = pool.filter(c => c.gender === "Male").length;

    expect(femaleCount).toBeGreaterThanOrEqual(40);
    expect(maleCount).toBeGreaterThanOrEqual(40);
    // Both together ≤ 100 (obviously)
    expect(femaleCount + maleCount).toBe(100);
  });
});

// ────────────────────────────────────────────────────────────
// 4. No duplicate names
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — uniqueness", () => {
  it("produces no duplicate names in a batch of 200", () => {
    const pool = generateCharacterPool({ count: 200, seed: 999 });
    const names = pool.map(c => c.name);
    const unique = new Set(names);
    expect(unique.size).toBe(200);
  });
});

// ────────────────────────────────────────────────────────────
// 5. Seeded determinism
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — determinism", () => {
  it("produces identical output for the same seed", () => {
    const pool1 = generateCharacterPool({ count: 20, seed: 12345 });
    const pool2 = generateCharacterPool({ count: 20, seed: 12345 });

    expect(pool1.map(c => c.name)).toEqual(pool2.map(c => c.name));
    expect(pool1.map(c => c.state)).toEqual(pool2.map(c => c.state));
    expect(pool1.map(c => c.gender)).toEqual(pool2.map(c => c.gender));
    expect(pool1.map(c => c.age)).toEqual(pool2.map(c => c.age));
    expect(pool1.map(c => c.biography)).toEqual(pool2.map(c => c.biography));
  });

  it("produces different output for different seeds", () => {
    const pool1 = generateCharacterPool({ count: 20, seed: 1 });
    const pool2 = generateCharacterPool({ count: 20, seed: 2 });
    expect(pool1.map(c => c.name)).not.toEqual(pool2.map(c => c.name));
  });
});

// ────────────────────────────────────────────────────────────
// 6. Age range respected
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — age range", () => {
  it("keeps all ages within default range (40–68)", () => {
    const pool = generateCharacterPool({ count: 50, seed: 55 });
    for (const char of pool) {
      expect(char.age).toBeGreaterThanOrEqual(40);
      expect(char.age).toBeLessThanOrEqual(68);
    }
  });

  it("keeps all ages within a custom range", () => {
    const pool = generateCharacterPool({
      count: 50,
      seed: 56,
      ageRange: { min: 30, max: 45 },
    });
    for (const char of pool) {
      expect(char.age).toBeGreaterThanOrEqual(30);
      expect(char.age).toBeLessThanOrEqual(45);
    }
  });
});

// ────────────────────────────────────────────────────────────
// 7. Default pool of 50
// ────────────────────────────────────────────────────────────
describe("generateCharacterPool — default pool", () => {
  it("generates 50 characters without errors", () => {
    expect(() => {
      const pool = generateCharacterPool({ count: 50, seed: 1 });
      expect(pool).toHaveLength(50);
    }).not.toThrow();
  });
});
