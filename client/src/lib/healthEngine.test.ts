// healthEngine.test.ts
import { describe, it, expect } from "vitest";
import { processHealthTurn } from "./healthEngine";
import { defaultHealthState, type CrossSectorEffects } from "./sectorTypes";
import type { PolicyLeverState } from "./gameTypes";

function mockEffects(overrides: Partial<CrossSectorEffects> = {}): CrossSectorEffects {
  return {
    gdp: 500,
    inflation: 15,
    fxRate: 1200,
    sectorGdpValues: { oil: 190, agriculture: 120, manufacturing: 75, services: 80, tourism: 35 },
    treasuryLiquidity: 150,
    unemploymentRate: 25,
    stability: 60,
    powerSupplyFactor: 0.27,
    transportScore: 35,
    digitalIndex: 38,
    foodPriceIndex: 65,
    foodSecurityScore: 25,
    workforceProductivity: 0.9,
    epidemicActive: false,
    humanCapitalIndex: 45,
    asuuStrikeActive: false,
    youthUnrestRisk: 55,
    laborForceQuality: 40,
    disasterRisk: 55,
    agriculturalResilience: 20,
    borderIntegrity: 40,
    civilRegistryScore: 45,
    ...overrides,
  };
}

function mockLevers(overrides: Partial<Record<string, { position: string }>> = {}): PolicyLeverState {
  const base: any = {
    healthcareFunding: { position: "basic", pendingPosition: null, cooldownUntilDay: 0 },
    drugProcurement: { position: "local-only", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processHealthTurn", () => {
  it("returns updated state with correct id", () => {
    const state = defaultHealthState();
    const result = processHealthTurn(state, mockLevers(), mockEffects(), 10);
    expect(result.id).toBe("health");
    expect(result.indicators.phcCoverage).toBeDefined();
  });

  it("universal-push increases phcCoverage and healthWorkerDensity over 5 turns", () => {
    let state = defaultHealthState();
    const levers = mockLevers({ healthcareFunding: { position: "universal-push" } });
    const initialPhc = state.indicators.phcCoverage;
    const initialHwd = state.indicators.healthWorkerDensity;
    for (let i = 0; i < 5; i++) {
      state = processHealthTurn(state, levers, mockEffects(), 10);
    }
    expect(state.indicators.phcCoverage).toBeGreaterThan(initialPhc);
    expect(state.indicators.healthWorkerDensity).toBeGreaterThan(initialHwd);
  });

  it("international-partnership drug procurement reduces outOfPocketSpendPct", () => {
    let state = defaultHealthState();
    const levers = mockLevers({
      healthcareFunding: { position: "basic" },
      drugProcurement: { position: "international-partnership" },
    });
    const initialOop = state.indicators.outOfPocketSpendPct;
    for (let i = 0; i < 5; i++) {
      state = processHealthTurn(state, levers, mockEffects(), 10);
    }
    expect(state.indicators.outOfPocketSpendPct).toBeLessThan(initialOop);
  });

  it("epidemicRisk rises when healthWorkerDensity is critically low", () => {
    let state = defaultHealthState();
    state.indicators.healthWorkerDensity = 0.8;
    const initialRisk = state.indicators.epidemicRisk;
    const result = processHealthTurn(state, mockLevers(), mockEffects(), 10);
    expect(result.indicators.epidemicRisk).toBeGreaterThan(initialRisk);
  });

  it("neglect decay degrades sector when turnsSinceAttention exceeds threshold", () => {
    let state = defaultHealthState();
    state.turnsSinceAttention = 5;
    const initialPhc = state.indicators.phcCoverage;
    const result = processHealthTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.indicators.phcCoverage).toBeLessThan(initialPhc);
  });

  it("low stability increases epidemic risk", () => {
    let state = defaultHealthState();
    const initialRisk = state.indicators.epidemicRisk;
    const result = processHealthTurn(state, mockLevers(), mockEffects({ stability: 20 }), 10);
    expect(result.indicators.epidemicRisk).toBeGreaterThan(initialRisk);
  });

  it("evaluates crisis zone from health score", () => {
    let state = defaultHealthState();
    state.indicators.phcCoverage = 5;
    state.indicators.immunizationRate = 5;
    state.indicators.epidemicRisk = 95;
    state.indicators.outOfPocketSpendPct = 95;
    state.indicators.healthWorkerDensity = 0.1;
    const result = processHealthTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.crisisZone).toBe("red");
  });
});
