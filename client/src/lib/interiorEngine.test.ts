// interiorEngine.test.ts
import { describe, it, expect } from "vitest";
import { processInteriorTurn } from "./interiorEngine";
import { defaultInteriorState, type CrossSectorEffects } from "./sectorTypes";
import type { PolicyLeverState } from "./gameTypes";

function mockEffects(overrides: Partial<CrossSectorEffects> = {}): CrossSectorEffects {
  return {
    gdp: 500, inflation: 15, fxRate: 1200,
    sectorGdpValues: { oil: 190, agriculture: 120, manufacturing: 75, services: 80, tourism: 35 },
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
    borderPolicy: { position: "standard", pendingPosition: null, cooldownUntilDay: 0 },
    nationalIdPush: { position: "voluntary", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processInteriorTurn", () => {
  it("returns updated state with correct id", () => {
    const state = defaultInteriorState();
    const result = processInteriorTurn(state, mockLevers(), mockEffects(), 12);
    expect(result.id).toBe("interior");
    expect(result.indicators.borderSecurityScore).toBeDefined();
  });

  it("borderPolicy=fortress increases border security score over 3 turns", () => {
    let state = defaultInteriorState();
    const initial = state.indicators.borderSecurityScore;
    const levers = mockLevers({ borderPolicy: { position: "fortress" } });
    for (let i = 0; i < 3; i++) {
      state = processInteriorTurn(state, levers, mockEffects(), 12);
    }
    expect(state.indicators.borderSecurityScore).toBeGreaterThan(initial);
  });

  it("nationalIdPush=mandatory increases national ID penetration", () => {
    let state = defaultInteriorState();
    const initial = state.indicators.nationalIdPenetration;
    const levers = mockLevers({ nationalIdPush: { position: "mandatory" } });
    for (let i = 0; i < 3; i++) {
      state = processInteriorTurn(state, levers, mockEffects(), 12);
    }
    expect(state.indicators.nationalIdPenetration).toBeGreaterThan(initial);
  });

  it("prison occupancy slowly decreases with budget attention", () => {
    let state = defaultInteriorState();
    const initial = state.indicators.prisonOccupancyRate;
    const levers = mockLevers();
    for (let i = 0; i < 3; i++) {
      state = processInteriorTurn(state, levers, mockEffects(), 12);
    }
    expect(state.indicators.prisonOccupancyRate).toBeLessThan(initial);
  });

  it("low stability worsens border security", () => {
    const state = defaultInteriorState();
    const initial = state.indicators.borderSecurityScore;
    // Use porous border and low stability so border score drops
    const levers = mockLevers({ borderPolicy: { position: "porous" } });
    const effects = mockEffects({ stability: 30 });
    const result = processInteriorTurn(state, levers, effects, 12);
    expect(result.indicators.borderSecurityScore).toBeLessThan(initial);
  });

  it("neglect decay reduces scores after threshold", () => {
    const state = defaultInteriorState();
    state.turnsSinceAttention = 6;
    const result = processInteriorTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.health).toBeLessThanOrEqual(state.health);
  });

  it("crisis zone evaluates to red under poor conditions", () => {
    const state = defaultInteriorState();
    state.indicators.borderSecurityScore = 5;
    state.indicators.nationalIdPenetration = 5;
    state.indicators.prisonOccupancyRate = 390;
    state.indicators.immigrationProcessingScore = 5;
    state.indicators.correctionalRehabRate = 1;
    const result = processInteriorTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.crisisZone).toBe("red");
  });

  it("momentum builds with sustained attention", () => {
    const state = defaultInteriorState();
    state.turnsSinceAttention = 0;
    state.momentum = 3;
    const result = processInteriorTurn(state, mockLevers(), mockEffects(), 12);
    expect(result.momentum).toBeGreaterThanOrEqual(3);
  });

  it("high youthUnrestRisk increases prison occupancy", () => {
    const state = defaultInteriorState();
    const initial = state.indicators.prisonOccupancyRate;
    // Zero budget so rehab delta is minimal, but unrest adds +3
    const effects = mockEffects({ youthUnrestRisk: 80 });
    const result = processInteriorTurn(state, mockLevers(), effects, 0);
    // With budget=0, budgetMultiplier=0.5 → rehab delta = -2.0*0.5 = -1.0, unrest +3 → net +2
    expect(result.indicators.prisonOccupancyRate).toBeGreaterThan(initial - 1.0 + 3 - 1);
  });
});
