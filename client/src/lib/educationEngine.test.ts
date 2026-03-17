// educationEngine.test.ts
import { describe, it, expect } from "vitest";
import { processEducationTurn } from "./educationEngine";
import { defaultEducationState, type CrossSectorEffects } from "./sectorTypes";
import type { PolicyLeverState } from "./gameTypes";

function mockEffects(overrides: Partial<CrossSectorEffects> = {}): CrossSectorEffects {
  return {
    gdp: 500, inflation: 15, fxRate: 1200,
    sectorGdpValues: { oil: 190, agriculture: 120, manufacturing: 75, services: 80, tourism: 35 },
    treasuryLiquidity: 150, unemploymentRate: 25, stability: 60,
    powerSupplyFactor: 0.4, transportScore: 35, digitalIndex: 38,
    foodPriceIndex: 65, foodSecurityScore: 25, workforceProductivity: 0.9,
    epidemicActive: false, humanCapitalIndex: 45, asuuStrikeActive: false,
    youthUnrestRisk: 55, laborForceQuality: 40, disasterRisk: 55,
    agriculturalResilience: 20, borderIntegrity: 40, civilRegistryScore: 45,
    ...overrides,
  };
}

function mockLevers(overrides: Partial<Record<string, { position: string }>> = {}): PolicyLeverState {
  const base: any = {
    universityAutonomy: { position: "centralized", pendingPosition: null, cooldownUntilDay: 0 },
    educationBudgetSplit: { position: "balanced", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) base[k] = { ...base[k], ...v };
  return base as PolicyLeverState;
}

describe("processEducationTurn", () => {
  it("returns updated state with correct id", () => {
    const state = defaultEducationState();
    const result = processEducationTurn(state, mockLevers(), mockEffects(), 13);
    expect(result.id).toBe("education");
    expect(result.indicators.enrollmentRate).toBeDefined();
  });

  it("full-autonomy reduces ASUU strike risk over 3 turns", () => {
    let state = defaultEducationState();
    const levers = mockLevers({ universityAutonomy: { position: "full-autonomy" } });
    const initialRisk = state.indicators.asuuStrikeRisk;
    for (let i = 0; i < 3; i++) {
      state = processEducationTurn(state, levers, mockEffects(), 13);
    }
    expect(state.indicators.asuuStrikeRisk).toBeLessThan(initialRisk);
  });

  it("basic-heavy split reduces out-of-school children and hurts tertiary graduation", () => {
    let state = defaultEducationState();
    const levers = mockLevers({ educationBudgetSplit: { position: "basic-heavy" } });
    const initialOutOfSchool = state.indicators.outOfSchoolChildren;
    const initialTertiary = state.indicators.tertiaryGraduationRate;
    for (let i = 0; i < 5; i++) {
      state = processEducationTurn(state, levers, mockEffects(), 13);
    }
    expect(state.indicators.outOfSchoolChildren).toBeLessThan(initialOutOfSchool);
    expect(state.indicators.tertiaryGraduationRate).toBeLessThan(initialTertiary);
  });

  it("enrollment rises with budget attention", () => {
    let state = defaultEducationState();
    const levers = mockLevers({ educationBudgetSplit: { position: "basic-heavy" } });
    const initialEnrollment = state.indicators.enrollmentRate;
    for (let i = 0; i < 3; i++) {
      state = processEducationTurn(state, levers, mockEffects(), 13);
    }
    expect(state.indicators.enrollmentRate).toBeGreaterThan(initialEnrollment);
  });

  it("neglect decay degrades sector health when turnsSinceAttention=6 and budgetPct=0", () => {
    let state = defaultEducationState();
    state = { ...state, turnsSinceAttention: 6 };
    const initialHealth = state.health;
    const result = processEducationTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.health).toBeLessThanOrEqual(initialHealth);
  });

  it("momentum builds with sustained attention", () => {
    let state = defaultEducationState();
    state = { ...state, turnsSinceAttention: 0, momentum: 2 };
    const result = processEducationTurn(state, mockLevers(), mockEffects(), 13);
    expect(result.momentum).toBeGreaterThanOrEqual(2);
  });

  it("momentum resets to 0 after neglect threshold", () => {
    let state = defaultEducationState();
    state = { ...state, turnsSinceAttention: 6, momentum: 4 };
    const result = processEducationTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.momentum).toBe(0);
  });

  it("crisis zone evaluates to red with degraded indicators", () => {
    let state = defaultEducationState();
    state = {
      ...state,
      indicators: {
        ...state.indicators,
        enrollmentRate: 20,
        literacyRate: 20,
        outOfSchoolChildren: 24,
        asuuStrikeRisk: 90,
        educationBudgetUtilization: 10,
        tertiaryGraduationRate: 2,
      },
    };
    const result = processEducationTurn(state, mockLevers(), mockEffects(), 0);
    expect(result.crisisZone).toBe("red");
  });

  it("low power supply factor reduces enrollment improvement", () => {
    const levers = mockLevers({ educationBudgetSplit: { position: "basic-heavy" } });
    const highPowerState = defaultEducationState();
    const lowPowerState = defaultEducationState();

    const highPowerResult = processEducationTurn(highPowerState, levers, mockEffects({ powerSupplyFactor: 0.8 }), 13);
    const lowPowerResult = processEducationTurn(lowPowerState, levers, mockEffects({ powerSupplyFactor: 0.1 }), 13);

    expect(highPowerResult.indicators.enrollmentRate).toBeGreaterThan(lowPowerResult.indicators.enrollmentRate);
  });

  it("low stability increases ASUU strike risk", () => {
    const levers = mockLevers({ universityAutonomy: { position: "centralized" } });
    const highStabilityState = defaultEducationState();
    const lowStabilityState = defaultEducationState();

    const highStabilityResult = processEducationTurn(highStabilityState, levers, mockEffects({ stability: 60 }), 13);
    const lowStabilityResult = processEducationTurn(lowStabilityState, levers, mockEffects({ stability: 30 }), 13);

    expect(lowStabilityResult.indicators.asuuStrikeRisk).toBeGreaterThan(highStabilityResult.indicators.asuuStrikeRisk);
  });

  it("tertiary-heavy split increases tertiary graduation rate", () => {
    let state = defaultEducationState();
    const levers = mockLevers({ educationBudgetSplit: { position: "tertiary-heavy" } });
    const initialTertiary = state.indicators.tertiaryGraduationRate;
    for (let i = 0; i < 3; i++) {
      state = processEducationTurn(state, levers, mockEffects(), 13);
    }
    expect(state.indicators.tertiaryGraduationRate).toBeGreaterThan(initialTertiary);
  });
});
