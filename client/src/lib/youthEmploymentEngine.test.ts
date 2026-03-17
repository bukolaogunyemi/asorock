// youthEmploymentEngine.test.ts
import { describe, it, expect } from "vitest";
import { processYouthEmploymentTurn } from "./youthEmploymentEngine";
import { defaultYouthEmploymentState, type CrossSectorEffects } from "./sectorTypes";
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
    nyscReform: { position: "status-quo", pendingPosition: null, cooldownUntilDay: 0 },
    youthEnterprise: { position: "minimal", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processYouthEmploymentTurn", () => {
  it("returns updated state with same id", () => {
    const state = defaultYouthEmploymentState();
    const result = processYouthEmploymentTurn(state, mockLevers(), mockEffects(), 6);
    expect(result.id).toBe("youthEmployment");
    expect(result.indicators.youthUnemploymentRate).toBeDefined();
  });

  it("public-works lever reduces youth unemployment over 3 turns", () => {
    let state = defaultYouthEmploymentState();
    const levers = mockLevers({ youthEnterprise: { position: "public-works" } });
    const initial = state.indicators.youthUnemploymentRate;
    for (let i = 0; i < 3; i++) {
      state = processYouthEmploymentTurn(state, levers, mockEffects(), 6);
    }
    expect(state.indicators.youthUnemploymentRate).toBeLessThan(initial);
  });

  it("startup-ecosystem lever increases startup formation rate", () => {
    let state = defaultYouthEmploymentState();
    const levers = mockLevers({ youthEnterprise: { position: "startup-ecosystem" } });
    const initial = state.indicators.startupFormationRate;
    for (let i = 0; i < 3; i++) {
      state = processYouthEmploymentTurn(state, levers, mockEffects(), 6);
    }
    expect(state.indicators.startupFormationRate).toBeGreaterThan(initial);
  });

  it("reformed NYSC improves deployment rate", () => {
    let state = defaultYouthEmploymentState();
    const levers = mockLevers({ nyscReform: { position: "reformed" } });
    const initial = state.indicators.nyscDeploymentRate;
    state = processYouthEmploymentTurn(state, levers, mockEffects(), 6);
    expect(state.indicators.nyscDeploymentRate).toBeGreaterThan(initial);
  });

  it("social unrest rises when youth unemployment exceeds 45", () => {
    let state = defaultYouthEmploymentState();
    state.indicators.youthUnemploymentRate = 48;
    const initial = state.indicators.socialUnrestRisk;
    const result = processYouthEmploymentTurn(state, mockLevers(), mockEffects(), 6);
    expect(result.indicators.socialUnrestRisk).toBeGreaterThan(initial);
  });

  it("ASUU strike active increases social unrest risk", () => {
    const stateBase = defaultYouthEmploymentState();
    const stateStrike = defaultYouthEmploymentState();

    const resultBase = processYouthEmploymentTurn(stateBase, mockLevers(), mockEffects({ asuuStrikeActive: false }), 6);
    const resultStrike = processYouthEmploymentTurn(stateStrike, mockLevers(), mockEffects({ asuuStrikeActive: true }), 6);

    expect(resultStrike.indicators.socialUnrestRisk).toBeGreaterThan(resultBase.indicators.socialUnrestRisk);
  });

  it("neglect decay reduces sector health after threshold", () => {
    let state = defaultYouthEmploymentState();
    // Use turnsSinceAttention=4 + budgetPct=0 to trigger neglect decay (> threshold of 3)
    // Run multiple turns to accumulate decay so health measurably drops
    state.turnsSinceAttention = 4;
    const initialHealth = state.health;
    for (let i = 0; i < 3; i++) {
      state = processYouthEmploymentTurn(state, mockLevers(), mockEffects(), 0);
    }
    expect(state.health).toBeLessThan(initialHealth);
  });

  it("scrapped NYSC sets deployment rate to zero", () => {
    let state = defaultYouthEmploymentState();
    const levers = mockLevers({ nyscReform: { position: "scrapped" } });
    const result = processYouthEmploymentTurn(state, levers, mockEffects(), 6);
    expect(result.indicators.nyscDeploymentRate).toBe(0);
  });

  it("evaluates crisis zone from health", () => {
    let state = defaultYouthEmploymentState();
    state.indicators.youthUnemploymentRate = 90;
    state.indicators.socialUnrestRisk = 90;
    state.indicators.nyscDeploymentRate = 5;
    state.indicators.skillsProgramEnrollment = 1;
    state.indicators.startupFormationRate = 2;
    const result = processYouthEmploymentTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.crisisZone).toBe("red");
  });
});
