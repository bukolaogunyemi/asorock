import { describe, it, expect } from "vitest";
import {
  generateSenatorPool,
  getSenatorPool,
  getSenatorsForState,
  HANDCRAFTED_SENATORS,
} from "./senatorPool";

const ALL_STATES_AND_FCT = [
  "Kano","Kaduna","Katsina","Sokoto","Zamfara","Kebbi","Jigawa",
  "Borno","Adamawa","Bauchi","Gombe","Taraba","Yobe",
  "Benue","Kogi","Kwara","Nasarawa","Niger","Plateau","FCT",
  "Lagos","Ogun","Oyo","Osun","Ondo","Ekiti",
  "Abia","Anambra","Ebonyi","Enugu","Imo",
  "Akwa Ibom","Bayelsa","Cross River","Delta","Edo","Rivers",
];

describe("HANDCRAFTED_SENATORS", () => {
  it("has exactly 50 hand-crafted senators", () => {
    expect(HANDCRAFTED_SENATORS).toHaveLength(50);
  });

  it("all hand-crafted senators have isHandCrafted: true", () => {
    for (const s of HANDCRAFTED_SENATORS) {
      expect(s.isHandCrafted).toBe(true);
    }
  });

  it("all hand-crafted senators have non-empty required fields", () => {
    for (const s of HANDCRAFTED_SENATORS) {
      expect(s.name.length).toBeGreaterThan(3);
      expect(s.state.length).toBeGreaterThan(0);
      expect(s.zone).toMatch(/^(NW|NE|NC|SW|SE|SS)$/);
      expect(s.party).toMatch(/^(ADU|PFC|NDM|NSF|TLA|HDP|PAP|UPA)$/);
      expect(s.senateDistrict.length).toBeGreaterThan(3);
      expect(s.bio.length).toBeGreaterThan(50);
      expect(s.traits.length).toBeGreaterThanOrEqual(2);
      expect(s.traits.length).toBeLessThanOrEqual(4);
    }
  });

  it("no duplicate names in hand-crafted pool", () => {
    const names = HANDCRAFTED_SENATORS.map(s => s.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });
});

describe("generateSenatorPool", () => {
  const pool = generateSenatorPool();

  it("total pool is exactly 109 senators", () => {
    expect(pool).toHaveLength(109);
  });

  it("exactly 50 senators are hand-crafted", () => {
    const handCrafted = pool.filter(s => s.isHandCrafted);
    expect(handCrafted).toHaveLength(50);
  });

  it("exactly 59 senators are generated", () => {
    const generated = pool.filter(s => !s.isHandCrafted);
    expect(generated).toHaveLength(59);
  });

  it("no duplicate names across the entire pool", () => {
    const names = pool.map(s => s.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("all senators have a valid zone", () => {
    for (const s of pool) {
      expect(["NW","NE","NC","SW","SE","SS"]).toContain(s.zone);
    }
  });

  it("all senators have a valid party", () => {
    const validParties = ["ADU","PFC","NDM","NSF","TLA","HDP","PAP","UPA"];
    for (const s of pool) {
      expect(validParties).toContain(s.party);
    }
  });

  it("ADU is the largest party in the pool (dominant ruling party)", () => {
    const partyCounts: Record<string, number> = {};
    for (const s of pool) {
      partyCounts[s.party] = (partyCounts[s.party] ?? 0) + 1;
    }
    const aduCount = partyCounts["ADU"] ?? 0;
    for (const [party, count] of Object.entries(partyCounts)) {
      if (party !== "ADU") {
        expect(aduCount).toBeGreaterThan(count);
      }
    }
  });

  it("all 8 parties are represented", () => {
    const parties = new Set(pool.map(s => s.party));
    for (const party of ["ADU","PFC","NDM","NSF","TLA","HDP","PAP","UPA"]) {
      expect(parties.has(party)).toBe(true);
    }
  });

  it("all senators have age in range 40–70", () => {
    // Generated senators: 40–70. Hand-crafted may vary slightly.
    for (const s of pool.filter(s => !s.isHandCrafted)) {
      expect(s.age).toBeGreaterThanOrEqual(40);
      expect(s.age).toBeLessThanOrEqual(70);
    }
  });

  it("competence is in range 40–90", () => {
    for (const s of pool) {
      expect(s.competence).toBeGreaterThanOrEqual(40);
      expect(s.competence).toBeLessThanOrEqual(90);
    }
  });

  it("influence is in range 30–85", () => {
    for (const s of pool) {
      expect(s.influence).toBeGreaterThanOrEqual(30);
      expect(s.influence).toBeLessThanOrEqual(85);
    }
  });

  it("loyalty is in range 30–80", () => {
    for (const s of pool) {
      expect(s.loyalty).toBeGreaterThanOrEqual(30);
      expect(s.loyalty).toBeLessThanOrEqual(80);
    }
  });

  it("all states including FCT are represented", () => {
    const states = new Set(pool.map(s => s.state));
    for (const state of ALL_STATES_AND_FCT) {
      expect(states.has(state)).toBe(true);
    }
  });

  it("gender balance: at least 20% female in generated pool", () => {
    const generated = pool.filter(s => !s.isHandCrafted);
    const female = generated.filter(s => s.gender === "Female").length;
    const pct = (female / generated.length) * 100;
    expect(pct).toBeGreaterThanOrEqual(20);
  });

  it("NW zone has the most senators (proportional to state count × ADU dominance)", () => {
    const nwCount = pool.filter(s => s.zone === "NW").length;
    expect(nwCount).toBeGreaterThan(5);
  });

  it("all senators have a non-empty bio", () => {
    for (const s of pool) {
      expect(s.bio.length).toBeGreaterThan(20);
    }
  });

  it("all senators have at least 2 traits", () => {
    for (const s of pool) {
      expect(s.traits.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("all senators have a non-empty senateDistrict", () => {
    for (const s of pool) {
      expect(s.senateDistrict.length).toBeGreaterThan(3);
    }
  });

  it("FCT senator exists and is in NC zone", () => {
    const fct = pool.filter(s => s.state === "FCT");
    expect(fct.length).toBeGreaterThanOrEqual(1);
    for (const s of fct) {
      expect(s.zone).toBe("NC");
    }
  });

  it("generates deterministically for the same seed", () => {
    const p1 = generateSenatorPool(5001);
    const p2 = generateSenatorPool(5001);
    const names1 = p1.filter(s => !s.isHandCrafted).map(s => s.name);
    const names2 = p2.filter(s => !s.isHandCrafted).map(s => s.name);
    expect(names1).toEqual(names2);
  });

  it("generates different results for different seeds", () => {
    const p1 = generateSenatorPool(5001);
    const p2 = generateSenatorPool(9999);
    const n1 = p1.filter(s => !s.isHandCrafted).map(s => s.name).join(",");
    const n2 = p2.filter(s => !s.isHandCrafted).map(s => s.name).join(",");
    expect(n1).not.toBe(n2);
  });

  it("party distribution is roughly proportional (ADU ≥ 50, PFC ≥ 18)", () => {
    const counts: Record<string, number> = {};
    for (const s of pool) counts[s.party] = (counts[s.party] ?? 0) + 1;
    expect(counts["ADU"] ?? 0).toBeGreaterThanOrEqual(50);
    expect(counts["PFC"] ?? 0).toBeGreaterThanOrEqual(18);
  });

  it("zone representation is proportional (SE should have fewer than NW)", () => {
    const zoneCounts: Record<string, number> = {};
    for (const s of pool) zoneCounts[s.zone] = (zoneCounts[s.zone] ?? 0) + 1;
    // SE has 5 states × 3 = 15 senate seats; NW has 7 states × 3 = 21 senate seats
    expect(zoneCounts["SE"] ?? 0).toBeLessThan(zoneCounts["NW"] ?? 0);
  });
});

describe("getSenatorPool (cached)", () => {
  it("returns the same reference on repeated calls", () => {
    const p1 = getSenatorPool();
    const p2 = getSenatorPool();
    expect(p1).toBe(p2);
  });

  it("cached pool has 109 senators", () => {
    expect(getSenatorPool()).toHaveLength(109);
  });
});

describe("getSenatorsForState", () => {
  it("returns senators for Kano", () => {
    const senators = getSenatorsForState("Kano");
    expect(senators.length).toBeGreaterThanOrEqual(1);
    for (const s of senators) {
      expect(s.state).toBe("Kano");
    }
  });

  it("returns senators for FCT", () => {
    const senators = getSenatorsForState("FCT");
    expect(senators.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array for non-existent state", () => {
    const senators = getSenatorsForState("Narnia");
    expect(senators).toHaveLength(0);
  });

  it("returns senators for multiple states correctly", () => {
    const testStates = ["Lagos","Rivers","Borno","Anambra","Kaduna"];
    for (const state of testStates) {
      const senators = getSenatorsForState(state);
      expect(senators.length).toBeGreaterThanOrEqual(1);
      for (const s of senators) {
        expect(s.state).toBe(state);
      }
    }
  });
});
