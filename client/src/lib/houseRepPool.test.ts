import { describe, it, expect } from "vitest";
import {
  generateHouseRepPool,
  getHouseRepPool,
  getHouseRepsForState,
  HANDCRAFTED_HOUSE_REPS,
} from "./houseRepPool";

describe("HANDCRAFTED_HOUSE_REPS", () => {
  it("has exactly 100 hand-crafted representatives", () => {
    expect(HANDCRAFTED_HOUSE_REPS).toHaveLength(100);
  });

  it("all hand-crafted reps have isHandCrafted: true", () => {
    for (const r of HANDCRAFTED_HOUSE_REPS) {
      expect(r.isHandCrafted).toBe(true);
    }
  });

  it("all hand-crafted reps have non-empty required fields", () => {
    for (const r of HANDCRAFTED_HOUSE_REPS) {
      expect(r.name.length).toBeGreaterThan(3);
      expect(r.state.length).toBeGreaterThan(0);
      expect(r.zone).toMatch(/^(NW|NE|NC|SW|SE|SS)$/);
      expect(r.party).toMatch(/^(ADU|PFC|NDM|NSF|TLA|HDP|PAP|UPA)$/);
      expect(r.constituency.length).toBeGreaterThan(5);
      expect(r.bio.length).toBeGreaterThan(50);
      expect(r.traits.length).toBeGreaterThanOrEqual(2);
      expect(r.traits.length).toBeLessThanOrEqual(4);
    }
  });

  it("no duplicate names in hand-crafted pool", () => {
    const names = HANDCRAFTED_HOUSE_REPS.map(r => r.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("hand-crafted reps are distributed across all 6 zones", () => {
    const zones = new Set(HANDCRAFTED_HOUSE_REPS.map(r => r.zone));
    for (const zone of ["NW","NE","NC","SW","SE","SS"]) {
      expect(zones.has(zone)).toBe(true);
    }
  });

  it("NW zone has 20 hand-crafted reps", () => {
    const nw = HANDCRAFTED_HOUSE_REPS.filter(r => r.zone === "NW");
    expect(nw).toHaveLength(20);
  });

  it("NE zone has 15 hand-crafted reps", () => {
    const ne = HANDCRAFTED_HOUSE_REPS.filter(r => r.zone === "NE");
    expect(ne).toHaveLength(15);
  });

  it("NC zone has 18 hand-crafted reps", () => {
    const nc = HANDCRAFTED_HOUSE_REPS.filter(r => r.zone === "NC");
    expect(nc).toHaveLength(18);
  });

  it("SW zone has 18 hand-crafted reps", () => {
    const sw = HANDCRAFTED_HOUSE_REPS.filter(r => r.zone === "SW");
    expect(sw).toHaveLength(18);
  });

  it("SE zone has 14 hand-crafted reps", () => {
    const se = HANDCRAFTED_HOUSE_REPS.filter(r => r.zone === "SE");
    expect(se).toHaveLength(14);
  });

  it("SS zone has 15 hand-crafted reps", () => {
    const ss = HANDCRAFTED_HOUSE_REPS.filter(r => r.zone === "SS");
    expect(ss).toHaveLength(15);
  });
});

describe("generateHouseRepPool", () => {
  const pool = generateHouseRepPool();

  it("total pool is exactly 360 representatives", () => {
    expect(pool).toHaveLength(360);
  });

  it("exactly 100 representatives are hand-crafted", () => {
    const handCrafted = pool.filter(r => r.isHandCrafted);
    expect(handCrafted).toHaveLength(100);
  });

  it("exactly 260 representatives are generated", () => {
    const generated = pool.filter(r => !r.isHandCrafted);
    expect(generated).toHaveLength(260);
  });

  it("no duplicate names across the entire pool", () => {
    const names = pool.map(r => r.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("all reps have a valid zone", () => {
    const validZones = ["NW","NE","NC","SW","SE","SS"];
    for (const r of pool) {
      expect(validZones).toContain(r.zone);
    }
  });

  it("all reps have a valid party", () => {
    const validParties = ["ADU","PFC","NDM","NSF","TLA","HDP","PAP","UPA"];
    for (const r of pool) {
      expect(validParties).toContain(r.party);
    }
  });

  it("all 8 parties are represented in the pool", () => {
    const parties = new Set(pool.map(r => r.party));
    for (const p of ["ADU","PFC","NDM","NSF","TLA","HDP","PAP","UPA"]) {
      expect(parties.has(p)).toBe(true);
    }
  });

  it("ADU is the largest party (dominant ruling party with 145 seats)", () => {
    const counts: Record<string, number> = {};
    for (const r of pool) counts[r.party] = (counts[r.party] ?? 0) + 1;
    const aduCount = counts["ADU"] ?? 0;
    for (const [party, count] of Object.entries(counts)) {
      if (party !== "ADU") {
        expect(aduCount).toBeGreaterThan(count);
      }
    }
  });

  it("party distribution is roughly proportional (ADU ≥ 130, PFC ≥ 70)", () => {
    const counts: Record<string, number> = {};
    for (const r of pool) counts[r.party] = (counts[r.party] ?? 0) + 1;
    // Allow 10% margin for hand-crafted mix
    expect(counts["ADU"] ?? 0).toBeGreaterThanOrEqual(130);
    expect(counts["PFC"] ?? 0).toBeGreaterThanOrEqual(70);
    expect(counts["NDM"] ?? 0).toBeGreaterThanOrEqual(35);
    expect(counts["NSF"] ?? 0).toBeGreaterThanOrEqual(25);
  });

  it("UPA has at least 5 reps (minimum minority party)", () => {
    const upa = pool.filter(r => r.party === "UPA").length;
    expect(upa).toBeGreaterThanOrEqual(5);
  });

  it("competence is in range 40–90 for all reps", () => {
    for (const r of pool) {
      expect(r.competence).toBeGreaterThanOrEqual(40);
      expect(r.competence).toBeLessThanOrEqual(90);
    }
  });

  it("influence is in range 30–85 for all reps", () => {
    for (const r of pool) {
      expect(r.influence).toBeGreaterThanOrEqual(30);
      expect(r.influence).toBeLessThanOrEqual(85);
    }
  });

  it("loyalty is in range 30–80 for all reps", () => {
    for (const r of pool) {
      expect(r.loyalty).toBeGreaterThanOrEqual(30);
      expect(r.loyalty).toBeLessThanOrEqual(80);
    }
  });

  it("all reps have a non-empty bio", () => {
    for (const r of pool) {
      expect(r.bio.length).toBeGreaterThan(20);
    }
  });

  it("all reps have at least 2 traits", () => {
    for (const r of pool) {
      expect(r.traits.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("all reps have a non-empty constituency", () => {
    for (const r of pool) {
      expect(r.constituency.length).toBeGreaterThan(5);
    }
  });

  it("gender balance: at least 20% female in generated pool", () => {
    const generated = pool.filter(r => !r.isHandCrafted);
    const female = generated.filter(r => r.gender === "Female").length;
    const pct = (female / generated.length) * 100;
    expect(pct).toBeGreaterThanOrEqual(20);
  });

  it("all reps have a valid gender", () => {
    for (const r of pool) {
      expect(["Male","Female"]).toContain(r.gender);
    }
  });

  it("all reps have a non-empty avatar (initials)", () => {
    for (const r of pool) {
      expect(r.avatar.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("generates deterministically for the same seed", () => {
    const p1 = generateHouseRepPool(6001);
    const p2 = generateHouseRepPool(6001);
    const n1 = p1.filter(r => !r.isHandCrafted).map(r => r.name);
    const n2 = p2.filter(r => !r.isHandCrafted).map(r => r.name);
    expect(n1).toEqual(n2);
  });

  it("generates different results for different seeds", () => {
    const p1 = generateHouseRepPool(6001);
    const p2 = generateHouseRepPool(9999);
    const n1 = p1.filter(r => !r.isHandCrafted).map(r => r.name).join(",");
    const n2 = p2.filter(r => !r.isHandCrafted).map(r => r.name).join(",");
    expect(n1).not.toBe(n2);
  });

  it("all six geopolitical zones are represented", () => {
    const zones = new Set(pool.map(r => r.zone));
    for (const z of ["NW","NE","NC","SW","SE","SS"]) {
      expect(zones.has(z)).toBe(true);
    }
  });

  it("Lagos is represented (most populous state)", () => {
    const lagos = pool.filter(r => r.state === "Lagos");
    expect(lagos.length).toBeGreaterThanOrEqual(1);
  });

  it("female reps include members from multiple zones", () => {
    const femaleZones = new Set(pool.filter(r => r.gender === "Female").map(r => r.zone));
    expect(femaleZones.size).toBeGreaterThanOrEqual(4);
  });
});

describe("getHouseRepPool (cached)", () => {
  it("returns the same reference on repeated calls", () => {
    const p1 = getHouseRepPool();
    const p2 = getHouseRepPool();
    expect(p1).toBe(p2);
  });

  it("cached pool has 360 representatives", () => {
    expect(getHouseRepPool()).toHaveLength(360);
  });
});

describe("getHouseRepsForState", () => {
  it("returns reps for Lagos", () => {
    const reps = getHouseRepsForState("Lagos");
    expect(reps.length).toBeGreaterThanOrEqual(1);
    for (const r of reps) {
      expect(r.state).toBe("Lagos");
    }
  });

  it("returns reps for Kano", () => {
    const reps = getHouseRepsForState("Kano");
    expect(reps.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array for non-existent state", () => {
    const reps = getHouseRepsForState("Wakanda");
    expect(reps).toHaveLength(0);
  });

  it("returns reps for multiple states correctly", () => {
    const testStates = ["Rivers","Borno","Anambra","Kaduna","Delta"];
    for (const state of testStates) {
      const reps = getHouseRepsForState(state);
      expect(reps.length).toBeGreaterThanOrEqual(1);
      for (const r of reps) {
        expect(r.state).toBe(state);
      }
    }
  });
});
