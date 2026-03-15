import { describe, it, expect } from "vitest";
import {
  defaultEconomicState,
  advanceSectors,
  calculateUnemployment,
  applyPolicyToSectors,
} from "./economicEngine";

describe("defaultEconomicState", () => {
  it("returns a valid initial state with 5 sectors", () => {
    const state = defaultEconomicState();
    expect(state.sectors).toHaveLength(5);
    expect(state.gdp).toBe(500);
    expect(state.unemploymentRate).toBe(25);
    expect(state.inflation).toBe(15);
    expect(state.fxRate).toBe(1200);
    expect(state.fxRateBaseline).toBe(1000);
    expect(state.reserves).toBe(32);
    expect(state.debtToGdp).toBe(35);
    expect(state.oilOutput).toBe(2.0);
    expect(state.subsidyPressure).toBe(30);
    expect(state.treasuryLiquidity).toBe(150);
    expect(state.treasuryMonthsOfCover).toBe(4);

    // Revenue
    expect(state.revenue.total).toBe(25);
    expect(state.revenue.oil).toBe(10);

    // Expenditure
    expect(state.expenditure.total).toBe(23);

    // Crisis indicators all green
    const indicators = state.crisisIndicators;
    expect(indicators.inflationZone).toBe("green");
    expect(indicators.unemploymentZone).toBe("green");
    expect(indicators.fxZone).toBe("green");
    expect(indicators.debtZone).toBe("green");
    expect(indicators.treasuryZone).toBe("green");
    expect(indicators.oilOutputZone).toBe("green");

    // Empty arrays
    expect(state.activeCascades).toEqual([]);
    expect(state.history).toEqual([]);
  });

  it("has sector IDs matching oil, agriculture, manufacturing, services, tourism", () => {
    const state = defaultEconomicState();
    const ids = state.sectors.map((s) => s.id);
    expect(ids).toEqual(["oil", "agriculture", "manufacturing", "services", "tourism"]);
  });
});

describe("advanceSectors", () => {
  // Use deterministic random that returns 0.5 (so randomComponent = 0)
  const noRandom = () => 0.5;

  it("updates GDP values for all 5 sectors", () => {
    const state = defaultEconomicState();
    const original = state.sectors.map((s) => s.gdpValue);
    const updated = advanceSectors(state.sectors, [], noRandom);

    expect(updated).toHaveLength(5);
    for (let i = 0; i < updated.length; i++) {
      // With noRandom, base growth is 0.5 + 0*0.1 = 0.5%
      // So newValue = oldValue * 1.005
      expect(updated[i].gdpValue).toBeCloseTo(original[i] * 1.005, 4);
    }
  });

  it("increases momentum on positive growth", () => {
    const state = defaultEconomicState();
    // With noRandom, growth = 0.5 (positive), so momentum should go from 0 to 1
    const updated = advanceSectors(state.sectors, [], noRandom);

    for (const sector of updated) {
      expect(sector.momentum).toBe(1);
    }

    // Advance again: momentum should go to 2
    const updated2 = advanceSectors(updated, [], noRandom);
    for (const sector of updated2) {
      expect(sector.momentum).toBe(2);
    }
  });

  it("resets momentum on negative growth", () => {
    const state = defaultEconomicState();
    // First, build some momentum
    let sectors = advanceSectors(state.sectors, [], noRandom);
    sectors = advanceSectors(sectors, [], noRandom);
    expect(sectors[0].momentum).toBe(2);

    // Apply a large negative shock to force negative growth
    const negativeShocks = sectors.map((s) => ({
      sectorId: s.id,
      effect: -5, // large enough to make growth negative
    })) as { sectorId: "oil" | "agriculture" | "manufacturing" | "services" | "tourism"; effect: number }[];

    const updated = advanceSectors(sectors, negativeShocks, noRandom);
    for (const sector of updated) {
      // Growth = 0.5 + momentum*0.1 + (-5) + 0 which is negative
      expect(sector.growthRate).toBeLessThan(0);
      expect(sector.momentum).toBe(0);
    }
  });

  it("total GDP equals sum of sector values", () => {
    const state = defaultEconomicState();
    const updated = advanceSectors(state.sectors, [], noRandom);
    const totalFromSectors = updated.reduce((sum, s) => sum + s.gdpValue, 0);
    // Each sector grows by 0.5%, so total should be close to 500 * 1.005
    expect(totalFromSectors).toBeCloseTo(500 * 1.005, 2);
  });

  it("sector shares sum to approximately 100%", () => {
    const state = defaultEconomicState();
    const updated = advanceSectors(state.sectors, [], noRandom);
    const totalShares = updated.reduce((sum, s) => sum + s.gdpShare, 0);
    expect(totalShares).toBeCloseTo(100, 4);
  });

  it("decrements policy modifier durations and removes expired", () => {
    const state = defaultEconomicState();
    // Add a modifier with duration 1 (will be decremented to 0 and removed)
    state.sectors[0].policyModifiers = [
      { source: "test-short", effect: 1.0, duration: 1 },
      { source: "test-long", effect: 0.5, duration: 3 },
    ];

    const updated = advanceSectors(state.sectors, [], noRandom);
    // Short modifier should be removed (duration was 1, decremented to 0)
    expect(updated[0].policyModifiers).toHaveLength(1);
    expect(updated[0].policyModifiers[0].source).toBe("test-long");
    expect(updated[0].policyModifiers[0].duration).toBe(2);
  });

  it("caps momentum at 5", () => {
    const state = defaultEconomicState();
    // Set momentum to 5 already
    state.sectors[0].momentum = 5;
    const updated = advanceSectors(state.sectors, [], noRandom);
    expect(updated[0].momentum).toBe(5); // should stay capped at 5
  });
});

describe("calculateUnemployment", () => {
  it("derives unemployment rate from sectoral performance", () => {
    const state = defaultEconomicState();
    // All sectors have positive growth rates initially
    const rate = calculateUnemployment(state.sectors, 25);
    // reduction = sum(growthRate * employmentWeight * 2)
    // = 1.0*0.05*2 + 1.5*0.35*2 + 0.8*0.25*2 + 2.0*0.25*2 + 1.0*0.10*2
    // = 0.1 + 1.05 + 0.4 + 1.0 + 0.2 = 2.75
    // result = 25 - 2.75 = 22.25
    expect(rate).toBeCloseTo(22.25, 2);
  });

  it("agriculture growth has the biggest impact on unemployment", () => {
    const state = defaultEconomicState();
    // Set all sectors to 0 growth except one at a time
    const sectors = state.sectors.map((s) => ({ ...s, growthRate: 0 }));

    // Test each sector individually with growth = 5
    const impacts: Record<string, number> = {};
    for (const sector of sectors) {
      const testSectors = sectors.map((s) =>
        s.id === sector.id ? { ...s, growthRate: 5 } : s,
      );
      const rate = calculateUnemployment(testSectors, 25);
      impacts[sector.id] = 25 - rate; // positive = more reduction
    }

    // Agriculture (weight 0.35) should have the biggest impact
    expect(impacts["agriculture"]).toBeGreaterThan(impacts["oil"]);
    expect(impacts["agriculture"]).toBeGreaterThan(impacts["manufacturing"]);
    expect(impacts["agriculture"]).toBeGreaterThan(impacts["services"]);
    expect(impacts["agriculture"]).toBeGreaterThan(impacts["tourism"]);
  });

  it("clamps unemployment between 5% and 50%", () => {
    const state = defaultEconomicState();
    // Very high growth should not push below 5
    const highGrowth = state.sectors.map((s) => ({ ...s, growthRate: 100 }));
    expect(calculateUnemployment(highGrowth, 25)).toBe(5);

    // Very negative growth should not push above 50
    const negGrowth = state.sectors.map((s) => ({ ...s, growthRate: -100 }));
    expect(calculateUnemployment(negGrowth, 25)).toBe(50);
  });
});

describe("applyPolicyToSectors", () => {
  it("creates modifiers for fuel subsidy removal", () => {
    const effects = applyPolicyToSectors("fuelSubsidy", "removed");
    expect(effects).toHaveLength(3);

    const oil = effects.find((e) => e.sectorId === "oil");
    expect(oil).toBeDefined();
    expect(oil!.effect).toBe(1.5);
    expect(oil!.duration).toBe(5);

    const mfg = effects.find((e) => e.sectorId === "manufacturing");
    expect(mfg).toBeDefined();
    expect(mfg!.effect).toBe(-1.0);

    const svc = effects.find((e) => e.sectorId === "services");
    expect(svc).toBeDefined();
    expect(svc!.effect).toBe(-0.5);
  });

  it("creates modifiers for full fuel subsidy", () => {
    const effects = applyPolicyToSectors("fuelSubsidy", "full");
    expect(effects).toHaveLength(2);
    expect(effects.find((e) => e.sectorId === "oil")!.effect).toBe(-1.0);
    expect(effects.find((e) => e.sectorId === "manufacturing")!.effect).toBe(0.5);
  });

  it("creates modifiers for free-float FX policy", () => {
    const effects = applyPolicyToSectors("fxPolicy", "free-float");
    expect(effects).toHaveLength(3);
    expect(effects.find((e) => e.sectorId === "manufacturing")!.effect).toBe(1.0);
    expect(effects.find((e) => e.sectorId === "services")!.effect).toBe(0.5);
    expect(effects.find((e) => e.sectorId === "oil")!.effect).toBe(-0.5);
  });

  it("creates modifiers for restrictive import tariffs", () => {
    const effects = applyPolicyToSectors("importTariffs", "restrictive");
    expect(effects).toHaveLength(3);
    expect(effects.find((e) => e.sectorId === "manufacturing")!.effect).toBe(1.5);
    expect(effects.find((e) => e.sectorId === "tourism")!.effect).toBe(-1.0);
  });

  it("creates modifiers for high tax rate affecting all sectors", () => {
    const effects = applyPolicyToSectors("taxRate", "high");
    expect(effects).toHaveLength(5);
    for (const e of effects) {
      expect(e.effect).toBe(-0.5);
      expect(e.duration).toBe(4);
    }
  });

  it("creates modifiers for public sector hiring expansion", () => {
    const effects = applyPolicyToSectors("publicSectorHiring", "expansion");
    expect(effects).toHaveLength(1);
    expect(effects[0].sectorId).toBe("services");
    expect(effects[0].effect).toBe(1.0);
    expect(effects[0].duration).toBe(3);
  });

  it("returns empty array for unmatched policy/position combos", () => {
    const effects = applyPolicyToSectors("fuelSubsidy", "partial");
    expect(effects).toEqual([]);
  });
});
