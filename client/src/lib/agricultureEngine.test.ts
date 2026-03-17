// agricultureEngine.test.ts
import { describe, it, expect } from "vitest";
import { processAgricultureTurn } from "./agricultureEngine";
import { defaultAgricultureState, type CrossSectorEffects } from "./sectorTypes";
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
    landReform: { position: "communal", pendingPosition: null, cooldownUntilDay: 0 },
    agricSubsidies: { position: "none", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processAgricultureTurn", () => {
  it("returns updated state", () => {
    const state = defaultAgricultureState();
    const result = processAgricultureTurn(state, mockLevers(), mockEffects(), 6);
    expect(result.id).toBe("agriculture");
  });

  it("full-mechanization subsidies improve crop output and food prices", () => {
    let state = defaultAgricultureState();
    const levers = mockLevers({ agricSubsidies: { position: "full-mechanization" } });
    for (let i = 0; i < 5; i++) {
      state = processAgricultureTurn(state, levers, mockEffects(), 6);
    }
    expect(state.indicators.mechanizationRate).toBeGreaterThan(15);
    expect(state.indicators.cropOutputIndex).toBeGreaterThan(55);
  });

  it("titling-program increases mechanization but raises herder tension short-term", () => {
    let state = defaultAgricultureState();
    const levers = mockLevers({ landReform: { position: "titling-program" } });
    const result = processAgricultureTurn(state, levers, mockEffects(), 6);
    expect(result.indicators.herderFarmerTension).toBeGreaterThan(50);
  });

  it("poor transport score worsens post-harvest loss", () => {
    const state = defaultAgricultureState();
    const badTransport = mockEffects({ transportScore: 10 });
    const result = processAgricultureTurn(state, mockLevers(), badTransport, 6);
    expect(result.indicators.postHarvestLossPct).toBeGreaterThanOrEqual(35);
  });

  it("high inflation drives food prices up", () => {
    const state = defaultAgricultureState();
    const highInflation = mockEffects({ inflation: 30 });
    const result = processAgricultureTurn(state, mockLevers(), highInflation, 6);
    expect(result.indicators.foodPriceIndex).toBeGreaterThan(65);
  });

  it("low stability increases herder-farmer tension", () => {
    const state = defaultAgricultureState();
    const lowStability = mockEffects({ stability: 20 });
    const result = processAgricultureTurn(state, mockLevers(), lowStability, 6);
    expect(result.indicators.herderFarmerTension).toBeGreaterThan(50);
  });

  it("neglect causes decay", () => {
    let state = defaultAgricultureState();
    state.turnsSinceAttention = 5;
    const result = processAgricultureTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.health).toBeLessThan(state.health);
  });
});
