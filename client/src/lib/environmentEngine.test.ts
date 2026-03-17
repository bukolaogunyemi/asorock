// environmentEngine.test.ts
import { describe, it, expect } from "vitest";
import { processEnvironmentTurn } from "./environmentEngine";
import { defaultEnvironmentState, type CrossSectorEffects } from "./sectorTypes";
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
    gasFlarePolicy: { position: "tolerance", pendingPosition: null, cooldownUntilDay: 0 },
    climateAdaptation: { position: "minimal", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processEnvironmentTurn", () => {
  it("returns updated state with correct id", () => {
    const state = defaultEnvironmentState();
    const result = processEnvironmentTurn(state, mockLevers(), mockEffects(), 4);
    expect(result.id).toBe("environment");
    expect(result.indicators.gasFlareIndex).toBeDefined();
  });

  it("zero-flare policy reduces gasFlareIndex over 3 turns", () => {
    let state = defaultEnvironmentState();
    const levers = mockLevers({ gasFlarePolicy: { position: "zero-flare" } });
    const initial = state.indicators.gasFlareIndex;
    for (let i = 0; i < 3; i++) {
      state = processEnvironmentTurn(state, levers, mockEffects(), 4);
    }
    expect(state.indicators.gasFlareIndex).toBeLessThan(initial);
  });

  it("aggressive climate adaptation increases climateAdaptationScore", () => {
    let state = defaultEnvironmentState();
    const levers = mockLevers({ climateAdaptation: { position: "aggressive" } });
    const initial = state.indicators.climateAdaptationScore;
    for (let i = 0; i < 3; i++) {
      state = processEnvironmentTurn(state, levers, mockEffects(), 4);
    }
    expect(state.indicators.climateAdaptationScore).toBeGreaterThan(initial);
  });

  it("aggressive climate adaptation reduces flood displacement risk", () => {
    let state = defaultEnvironmentState();
    // Boost adaptation score high enough so flood delta is negative
    state.indicators.climateAdaptationScore = 40;
    const levers = mockLevers({ climateAdaptation: { position: "aggressive" } });
    const initial = state.indicators.floodDisplacementRisk;
    for (let i = 0; i < 3; i++) {
      state = processEnvironmentTurn(state, levers, mockEffects(), 4);
    }
    expect(state.indicators.floodDisplacementRisk).toBeLessThan(initial);
  });

  it("desertification drifts up over 5 turns with minimal adaptation", () => {
    let state = defaultEnvironmentState();
    // Keep adaptation score low so desertDelta > 0
    state.indicators.climateAdaptationScore = 10;
    const levers = mockLevers({ climateAdaptation: { position: "minimal" } });
    const initial = state.indicators.desertificationIndex;
    for (let i = 0; i < 5; i++) {
      state = processEnvironmentTurn(state, levers, mockEffects(), 4);
    }
    expect(state.indicators.desertificationIndex).toBeGreaterThan(initial);
  });

  it("neglect decay degrades health when turnsSinceAttention exceeds threshold", () => {
    let state = defaultEnvironmentState();
    state.turnsSinceAttention = 10;
    const result = processEnvironmentTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.health).toBeLessThan(state.health);
  });

  it("crisis zone is red when adaptation is low and desertification is high", () => {
    let state = defaultEnvironmentState();
    state.indicators.climateAdaptationScore = 5;
    state.indicators.desertificationIndex = 90;
    state.indicators.floodDisplacementRisk = 85;
    state.indicators.gasFlareIndex = 90;
    state.indicators.carbonIntensity = 85;
    state.indicators.deforestationRate = 90;
    const result = processEnvironmentTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.crisisZone).toBe("red");
  });
});
