// infrastructureEngine.test.ts
import { describe, it, expect } from "vitest";
import { processInfrastructureTurn } from "./infrastructureEngine";
import { defaultInfrastructureState, type CrossSectorEffects } from "./sectorTypes";
import type { PolicyLeverState } from "./gameTypes";

function mockEffects(overrides: Partial<CrossSectorEffects> = {}): CrossSectorEffects {
  return {
    gdp: 500, inflation: 15, fxRate: 1200, sectorGdpValues: { oil: 190, agriculture: 120, manufacturing: 75, services: 80, tourism: 35 },
    treasuryLiquidity: 150, unemploymentRate: 25, stability: 60,
    powerSupplyFactor: 0.27, transportScore: 35, digitalIndex: 38,
    foodPriceIndex: 65, foodSecurityScore: 25, workforceProductivity: 0.9,
    epidemicActive: false, humanCapitalIndex: 45, asuuStrikeActive: false,
    youthUnrestRisk: 55, laborForceQuality: 40, disasterRisk: 55,
    agriculturalResilience: 20, borderIntegrity: 40, civilRegistryScore: 45,
    ...overrides,
  };
}

function mockLevers(overrides: Partial<Record<string, { position: string }>> = {}): PolicyLeverState {
  const base: any = {
    powerPrivatization: { position: "state-run", pendingPosition: null, cooldownUntilDay: 0 },
    oilSectorReform: { position: "status-quo", pendingPosition: null, cooldownUntilDay: 0 },
    transportPriority: { position: "roads", pendingPosition: null, cooldownUntilDay: 0 },
    digitalInvestment: { position: "minimal", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processInfrastructureTurn", () => {
  it("returns updated state with same id", () => {
    const state = defaultInfrastructureState();
    const result = processInfrastructureTurn(state, mockLevers(), mockEffects(), 27);
    expect(result.id).toBe("infrastructure");
    expect(result.indicators.powerGenerationGW).toBeDefined();
  });

  it("full-private lever increases power generation over time", () => {
    let state = defaultInfrastructureState();
    const levers = mockLevers({ powerPrivatization: { position: "full-private" } });
    for (let i = 0; i < 5; i++) {
      state = processInfrastructureTurn(state, levers, mockEffects(), 27);
    }
    expect(state.indicators.powerGenerationGW).toBeGreaterThan(4.5);
  });

  it("aggressive digital investment increases broadband", () => {
    let state = defaultInfrastructureState();
    const levers = mockLevers({ digitalInvestment: { position: "aggressive" } });
    for (let i = 0; i < 3; i++) {
      state = processInfrastructureTurn(state, levers, mockEffects(), 27);
    }
    expect(state.indicators.broadbandPenetration).toBeGreaterThan(38);
  });

  it("neglect causes decay after threshold", () => {
    let state = defaultInfrastructureState();
    state.turnsSinceAttention = 5;
    const result = processInfrastructureTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.health).toBeLessThan(state.health);
  });

  it("momentum builds with sustained attention", () => {
    let state = defaultInfrastructureState();
    state.turnsSinceAttention = 0;
    state.momentum = 3;
    const result = processInfrastructureTurn(state, mockLevers(), mockEffects(), 27);
    expect(result.momentum).toBeGreaterThanOrEqual(3);
  });

  it("evaluates crisis zone from health", () => {
    let state = defaultInfrastructureState();
    state.indicators.powerGenerationGW = 1.5;
    state.indicators.roadNetworkScore = 10;
    state.indicators.broadbandPenetration = 5;
    const result = processInfrastructureTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.crisisZone).toBe("red");
  });
});
