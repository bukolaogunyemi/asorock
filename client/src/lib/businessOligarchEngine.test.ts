import { describe, it, expect } from "vitest";
import { selectBusinessOligarchs } from "./businessOligarchEngine";
import { BUSINESS_OLIGARCH_CANDIDATES } from "./businessOligarchPool";
import { BUSINESS_SECTORS } from "./businessOligarchTypes";
import { seededPatronageState } from "./godfatherEngine";

// ── Pool validation ──

describe("BUSINESS_OLIGARCH_CANDIDATES pool", () => {
  it("has 100 candidates", () => {
    expect(BUSINESS_OLIGARCH_CANDIDATES).toHaveLength(100);
  });

  it("covers all 6 zones", () => {
    const zones = new Set(BUSINESS_OLIGARCH_CANDIDATES.map(c => c.zone));
    expect(zones.size).toBe(6);
  });

  it("has at least 10 candidates per zone", () => {
    const zones = ["NW", "NE", "NC", "SW", "SE", "SS"];
    for (const zone of zones) {
      const count = BUSINESS_OLIGARCH_CANDIDATES.filter(c => c.zone === zone).length;
      expect(count).toBeGreaterThanOrEqual(10);
    }
  });

  it("covers multiple sectors", () => {
    const sectors = new Set(BUSINESS_OLIGARCH_CANDIDATES.map(c => c.sector));
    expect(sectors.size).toBeGreaterThanOrEqual(8);
  });

  it("all candidates have valid trait ranges", () => {
    for (const c of BUSINESS_OLIGARCH_CANDIDATES) {
      expect(c.traits.aggression).toBeGreaterThanOrEqual(10);
      expect(c.traits.aggression).toBeLessThanOrEqual(95);
      expect(c.traits.greed).toBeGreaterThanOrEqual(30);
      expect(c.traits.greed).toBeLessThanOrEqual(95);
      expect(c.influenceScore).toBeGreaterThanOrEqual(35);
      expect(c.influenceScore).toBeLessThanOrEqual(95);
    }
  });

  it("all candidates have 3-5 interests", () => {
    for (const c of BUSINESS_OLIGARCH_CANDIDATES) {
      expect(c.interests.length).toBeGreaterThanOrEqual(3);
      expect(c.interests.length).toBeLessThanOrEqual(5);
    }
  });

  it("all candidates have 2-4 connection descriptions", () => {
    for (const c of BUSINESS_OLIGARCH_CANDIDATES) {
      expect(c.connectionDescriptions.length).toBeGreaterThanOrEqual(2);
      expect(c.connectionDescriptions.length).toBeLessThanOrEqual(4);
    }
  });

  it("all names are unique", () => {
    const names = BUSINESS_OLIGARCH_CANDIDATES.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has mix of dispositions", () => {
    const dispositions = new Set(BUSINESS_OLIGARCH_CANDIDATES.map(c => c.disposition));
    expect(dispositions.size).toBeGreaterThanOrEqual(3);
  });
});

// ── Selection ──

describe("selectBusinessOligarchs", () => {
  it("selects 20 oligarchs by default", () => {
    const selected = selectBusinessOligarchs(42);
    expect(selected).toHaveLength(20);
  });

  it("all selected are business-oligarch archetype", () => {
    const selected = selectBusinessOligarchs(42);
    for (const gf of selected) {
      expect(gf.archetype).toBe("business-oligarch");
    }
  });

  it("covers at least 5 zones", () => {
    const selected = selectBusinessOligarchs(42);
    const zones = new Set(selected.map(gf => gf.zone));
    expect(zones.size).toBeGreaterThanOrEqual(5);
  });

  it("no zone has more than 5 oligarchs", () => {
    const selected = selectBusinessOligarchs(42);
    const zoneCounts: Record<string, number> = {};
    for (const gf of selected) {
      zoneCounts[gf.zone] = (zoneCounts[gf.zone] ?? 0) + 1;
    }
    for (const count of Object.values(zoneCounts)) {
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  it("produces different results with different seeds", () => {
    const s1 = selectBusinessOligarchs(42);
    const s2 = selectBusinessOligarchs(999);
    const names1 = s1.map(g => g.name).sort();
    const names2 = s2.map(g => g.name).sort();
    expect(names1).not.toEqual(names2);
  });

  it("all selected have valid Godfather structure", () => {
    const selected = selectBusinessOligarchs(42);
    for (const gf of selected) {
      expect(gf.id).toBeDefined();
      expect(gf.name).toBeDefined();
      expect(gf.stable).toBeDefined();
      expect(gf.stable.connections.length).toBeGreaterThanOrEqual(2);
      expect(gf.escalationStage).toBe(0);
      expect(gf.neutralized).toBe(false);
      expect(gf.interests.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("can select fewer than 20", () => {
    const selected = selectBusinessOligarchs(42, 10);
    expect(selected).toHaveLength(10);
  });
});

// ── Integration with patronage system ──

describe("seededPatronageState", () => {
  it("returns 39 total godfathers (19 non-business + 20 business)", () => {
    const state = seededPatronageState(42);
    expect(state.godfathers).toHaveLength(39);
  });

  it("has 20 business-oligarch godfathers", () => {
    const state = seededPatronageState(42);
    const businessCount = state.godfathers.filter(
      gf => gf.archetype === "business-oligarch",
    ).length;
    expect(businessCount).toBe(20);
  });

  it("preserves non-business godfathers", () => {
    const state = seededPatronageState(42);
    const nonBusiness = state.godfathers.filter(
      gf => gf.archetype !== "business-oligarch",
    );
    expect(nonBusiness.length).toBe(19);
    // Should include party-bosses, military-elders, etc.
    const archetypes = new Set(nonBusiness.map(gf => gf.archetype));
    expect(archetypes.size).toBeGreaterThanOrEqual(5);
  });

  it("produces different business selections with different seeds", () => {
    const s1 = seededPatronageState(42);
    const s2 = seededPatronageState(999);
    const biz1 = s1.godfathers
      .filter(gf => gf.archetype === "business-oligarch")
      .map(gf => gf.name)
      .sort();
    const biz2 = s2.godfathers
      .filter(gf => gf.archetype === "business-oligarch")
      .map(gf => gf.name)
      .sort();
    expect(biz1).not.toEqual(biz2);
  });
});
