import { describe, it, expect } from "vitest";
import {
  defaultEconomicState,
  advanceSectors,
  calculateUnemployment,
  applyPolicyToSectors,
  calculateRevenue,
  calculateExpenditure,
  updateTreasury,
  calculateMonthsOfCover,
  evaluateCrisisIndicators,
  detectNewCascades,
  advanceCascade,
  checkCascadeResolution,
  processEconomicTurn,
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

    // Empty cascades, seeded history
    expect(state.activeCascades).toEqual([]);
    expect(state.history.length).toBe(8);
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

// ── Task 4: Fiscal Pipeline Tests ──

describe("calculateRevenue", () => {
  it("calculates oil revenue from oil sector GDP", () => {
    const state = defaultEconomicState();
    const revenue = calculateRevenue(state);
    // oil = 190 * 0.15 - 30 * 0.1 = 28.5 - 3 = 25.5
    expect(revenue.oil).toBeCloseTo(25.5, 2);
  });

  it("calculates tax revenue from non-oil GDP", () => {
    const state = defaultEconomicState();
    const revenue = calculateRevenue(state);
    // nonOilGDP = 120 + 75 + 80 + 35 = 310
    // tax = 310 * 0.06 * 0.6 = 11.16
    expect(revenue.tax).toBeCloseTo(11.16, 2);
  });

  it("total equals sum of all streams", () => {
    const state = defaultEconomicState();
    const revenue = calculateRevenue(state);
    const sum = revenue.oil + revenue.tax + revenue.igr + revenue.trade + revenue.borrowing;
    expect(revenue.total).toBeCloseTo(sum, 6);
  });
});

describe("updateTreasury", () => {
  it("decreases liquidity when expenditure > revenue", () => {
    const state = defaultEconomicState();
    state.revenue = { total: 10, oil: 5, tax: 3, igr: 1, trade: 1, borrowing: 0 };
    state.expenditure = { total: 20, recurrent: 12, capital: 5, debtServicing: 2, transfers: 1 };
    state.treasuryLiquidity = 100;

    const updated = updateTreasury(state);
    expect(updated.treasuryLiquidity).toBe(90); // 100 + 10 - 20
  });

  it("auto-borrows when treasury hits zero", () => {
    const state = defaultEconomicState();
    state.revenue = { total: 5, oil: 3, tax: 1, igr: 0.5, trade: 0.5, borrowing: 0 };
    state.expenditure = { total: 30, recurrent: 15, capital: 5, debtServicing: 5, transfers: 5 };
    state.treasuryLiquidity = 10;
    // newLiquidity = 10 + 5 - 30 = -15

    const updated = updateTreasury(state);
    expect(updated.treasuryLiquidity).toBe(0); // should not go negative
    expect(updated.revenue.borrowing).toBeCloseTo(15 * 1.1, 6); // punitive premium
    expect(updated.debtToGdp).toBeGreaterThan(state.debtToGdp);
  });
});

describe("calculateMonthsOfCover", () => {
  it("returns correct ratio", () => {
    // 120 liquidity / (24/12) = 120 / 2 = 60 months
    expect(calculateMonthsOfCover(120, 24)).toBeCloseTo(60, 4);
  });

  it("returns 0 when expenditure is 0", () => {
    expect(calculateMonthsOfCover(100, 0)).toBe(0);
  });
});

// ── Task 5: Crisis System Tests ──

describe("evaluateCrisisIndicators", () => {
  it("returns green for healthy metrics", () => {
    const indicators = evaluateCrisisIndicators({
      inflation: 10,
      unemploymentRate: 20,
      fxRate: 1100,
      fxRateBaseline: 1000,
      debtToGdp: 30,
      treasuryMonthsOfCover: 5,
      oilOutput: 2.5,
    });
    expect(indicators.inflationZone).toBe("green");
    expect(indicators.unemploymentZone).toBe("green");
    expect(indicators.fxZone).toBe("green");
    expect(indicators.debtZone).toBe("green");
    expect(indicators.treasuryZone).toBe("green");
    expect(indicators.oilOutputZone).toBe("green");
  });

  it("returns yellow for moderate stress", () => {
    const indicators = evaluateCrisisIndicators({
      inflation: 25,
      unemploymentRate: 30,
      fxRate: 1400,
      fxRateBaseline: 1000,
      debtToGdp: 45,
      treasuryMonthsOfCover: 2,
      oilOutput: 1.7,
    });
    expect(indicators.inflationZone).toBe("yellow");
    expect(indicators.unemploymentZone).toBe("yellow");
    expect(indicators.fxZone).toBe("yellow");
    expect(indicators.debtZone).toBe("yellow");
    expect(indicators.treasuryZone).toBe("yellow");
    expect(indicators.oilOutputZone).toBe("yellow");
  });

  it("returns red for crisis conditions", () => {
    const indicators = evaluateCrisisIndicators({
      inflation: 35,
      unemploymentRate: 40,
      fxRate: 1600,
      fxRateBaseline: 1000,
      debtToGdp: 60,
      treasuryMonthsOfCover: 0.5,
      oilOutput: 1.0,
    });
    expect(indicators.inflationZone).toBe("red");
    expect(indicators.unemploymentZone).toBe("red");
    expect(indicators.fxZone).toBe("red");
    expect(indicators.debtZone).toBe("red");
    expect(indicators.treasuryZone).toBe("red");
    expect(indicators.oilOutputZone).toBe("red");
  });
});

describe("detectNewCascades", () => {
  it("creates cascade when metric enters red", () => {
    const indicators = evaluateCrisisIndicators({
      inflation: 35,
      unemploymentRate: 20,
      fxRate: 1100,
      fxRateBaseline: 1000,
      debtToGdp: 30,
      treasuryMonthsOfCover: 5,
      oilOutput: 2.5,
    });
    const cascades = detectNewCascades(indicators, []);
    expect(cascades).toHaveLength(1);
    expect(cascades[0].type).toBe("inflation-fx-spiral");
    expect(cascades[0].severity).toBe(1);
    expect(cascades[0].turnsActive).toBe(0);
    expect(cascades[0].resolved).toBe(false);
  });

  it("does not duplicate existing active cascade", () => {
    const indicators = evaluateCrisisIndicators({
      inflation: 35,
      unemploymentRate: 20,
      fxRate: 1100,
      fxRateBaseline: 1000,
      debtToGdp: 30,
      treasuryMonthsOfCover: 5,
      oilOutput: 2.5,
    });
    const existing = [{
      id: "cascade-inflation-fx-spiral-123",
      type: "inflation-fx-spiral" as const,
      triggerMetric: "inflation",
      affectedMetrics: ["fxRate"],
      turnsActive: 2,
      severity: 3,
      resolved: false,
    }];
    const cascades = detectNewCascades(indicators, existing);
    expect(cascades).toHaveLength(0);
  });
});

describe("advanceCascade", () => {
  it("increments turnsActive and severity", () => {
    const cascade = {
      id: "cascade-test-1",
      type: "inflation-fx-spiral" as const,
      triggerMetric: "inflation",
      affectedMetrics: ["fxRate"],
      turnsActive: 2,
      severity: 3,
      resolved: false,
    };
    const advanced = advanceCascade(cascade);
    expect(advanced.turnsActive).toBe(3);
    expect(advanced.severity).toBe(4);
  });

  it("caps severity at 10", () => {
    const cascade = {
      id: "cascade-test-1",
      type: "inflation-fx-spiral" as const,
      triggerMetric: "inflation",
      affectedMetrics: ["fxRate"],
      turnsActive: 9,
      severity: 10,
      resolved: false,
    };
    const advanced = advanceCascade(cascade);
    expect(advanced.severity).toBe(10);
    expect(advanced.turnsActive).toBe(10);
  });
});

describe("checkCascadeResolution", () => {
  it("resolves when trigger returns to yellow", () => {
    const cascade = {
      id: "cascade-test-1",
      type: "inflation-fx-spiral" as const,
      triggerMetric: "inflation",
      affectedMetrics: ["fxRate"],
      turnsActive: 3,
      severity: 4,
      resolved: false,
    };
    const indicators = evaluateCrisisIndicators({
      inflation: 25, // yellow, not red
      unemploymentRate: 20,
      fxRate: 1100,
      fxRateBaseline: 1000,
      debtToGdp: 30,
      treasuryMonthsOfCover: 5,
      oilOutput: 2.5,
    });
    const resolved = checkCascadeResolution(cascade, indicators);
    expect(resolved.resolved).toBe(true);
  });
});

// ── Task 6: processEconomicTurn Tests ──

describe("processEconomicTurn", () => {
  it("should update all economic state components", () => {
    const state = defaultEconomicState();
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 10 });
    expect(result.gdp).toBeGreaterThan(0);
    expect(result.unemploymentRate).toBeGreaterThanOrEqual(5);
    expect(result.revenue.total).toBeGreaterThan(0);
    expect(result.history.length).toBe(9);
  });

  it("should cap history at 12 snapshots", () => {
    let state = defaultEconomicState();
    state.history = Array.from({ length: 12 }, (_, i) => ({
      day: i, gdp: 100, sectorGdpValues: { oil: 38, agriculture: 24, manufacturing: 15, services: 16, tourism: 7 },
      unemploymentRate: 25, inflation: 15, fxRate: 1200,
      treasuryLiquidity: 100, debtToGdp: 30, oilOutput: 2,
      revenueTotal: 0, revenueOil: 0, revenueTax: 0, revenueIgr: 0, revenueTrade: 0, revenueBorrowing: 0,
      expenditureTotal: 0, reserves: 0,
    }));
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 13 });
    expect(result.history.length).toBe(12);
  });

  it("should decrement policy modifier durations", () => {
    const state = defaultEconomicState();
    state.sectors[0].policyModifiers = [
      { source: "test", effect: 1, duration: 2 },
      { source: "expiring", effect: 1, duration: 1 },
    ];
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 10 });
    expect(result.sectors[0].policyModifiers.length).toBe(1);
    expect(result.sectors[0].policyModifiers[0].duration).toBe(1);
  });

  it("should update inflation based on economic conditions", () => {
    const state = defaultEconomicState();
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 10 });
    expect(typeof result.inflation).toBe("number");
    expect(result.inflation).toBeGreaterThanOrEqual(0);
    expect(result.inflation).toBeLessThanOrEqual(60);
  });

  it("should update FX rate", () => {
    const state = defaultEconomicState();
    const result = processEconomicTurn(state, { policyLevers: {}, currentDay: 10 });
    expect(result.fxRate).toBeGreaterThanOrEqual(400);
    expect(result.fxRate).toBeLessThanOrEqual(3000);
  });
});
