import { describe, it, expect } from "vitest";
import {
  checkDefeat,
  checkVictory,
  computeVictoryProgress,
  computeFailureRisks,
  victoryPaths,
  failureStates,
} from "./victorySystem";
import type { VictoryCheckState } from "./victorySystem";

// ── Minimal base state for tests ──────────────────────────────────────────────

const baseState: VictoryCheckState = {
  approval: 55,
  treasury: 2.5,
  stability: 65,
  politicalCapital: 60,
  stress: 30,
  outrage: 25,
  trust: 60,
  day: 30,
  health: 75,
  judicialIndependence: 60,
  characters: {},
  factions: {},
  governors: [],
  activeCases: [],
  vicePresident: { loyalty: 70, ambition: 40, relationship: "Friendly", mood: "Steady" },
  term: { current: 1, daysUntilElection: 300, reelectionsWon: 0, overstayDays: 0, governingPhase: "governance", electionMomentum: 55 },
  campaignPromises: [],
  healthCrisis: { rumorsActive: false, announced: false, concealmentActive: false },
  macroEconomy: { inflation: 18, fxRate: 1400, reserves: 25, debtToGdp: 35, oilOutput: 1.5, subsidyPressure: 40 },
  defeatVictoryCounters: {
    famineTurns: 0,
    blackoutTurns: 0,
    governanceCrisisTurns: 0,
    gdpGrowthPositiveTurns: 0,
  },
  internationalReputation: 50,
};

const healthySector = { health: 75, crisisZone: "green" as const, indicators: {} };
const poorSector = { health: 25, crisisZone: "red" as const, indicators: {} };
const neutralSector = { health: 55, crisisZone: "yellow" as const, indicators: {} };

// ── Existing paths still work ─────────────────────────────────────────────────

describe("victoryPaths", () => {
  it("includes the 4 new sector-based victory paths", () => {
    const ids = victoryPaths.map(p => p.id);
    expect(ids).toContain("economic-titan");
    expect(ids).toContain("peoples-champion");
    expect(ids).toContain("reformer");
    expect(ids).toContain("statesman");
  });

  it("returns 0 progress for economic-titan with no data", () => {
    const progress = computeVictoryProgress(baseState);
    expect(progress["economic-titan"]).toBeDefined();
    expect(progress["economic-titan"]).toBeGreaterThanOrEqual(0);
    expect(progress["economic-titan"]).toBeLessThanOrEqual(100);
  });

  it("economic-titan advances with 12+ GDP growth turns and low debt", () => {
    const state: VictoryCheckState = {
      ...baseState,
      macroEconomy: { ...baseState.macroEconomy, debtToGdp: 25 },
      economy: { gdpGrowthRate: 0.05 },
      defeatVictoryCounters: { ...baseState.defeatVictoryCounters!, gdpGrowthPositiveTurns: 12 },
    };
    const progress = computeVictoryProgress(state);
    expect(progress["economic-titan"]).toBeGreaterThan(50);
  });

  it("peoples-champion advances when health/education/youth sectors and approval are high", () => {
    const state: VictoryCheckState = {
      ...baseState,
      approval: 80,
      healthSector: { ...healthySector, health: 75 },
      education: { ...healthySector, health: 75 },
      youthEmployment: { ...healthySector, health: 70 },
    };
    const progress = computeVictoryProgress(state);
    expect(progress["peoples-champion"]).toBeGreaterThan(40);
  });

  it("statesman penalised when red sectors exist", () => {
    const stateAllGreen: VictoryCheckState = {
      ...baseState,
      internationalReputation: 85,
      approval: 75,
      infrastructure: healthySector,
      healthSector: healthySector,
      education: healthySector,
      agriculture: healthySector,
      interior: healthySector,
      environment: healthySector,
      youthEmployment: healthySector,
    };
    const stateWithRed: VictoryCheckState = {
      ...stateAllGreen,
      agriculture: poorSector,
      youthEmployment: poorSector,
    };
    const greenProgress = computeVictoryProgress(stateAllGreen)["statesman"];
    const redProgress = computeVictoryProgress(stateWithRed)["statesman"];
    expect(greenProgress).toBeGreaterThan(redProgress);
  });

  it("checkVictory returns null when no path reaches 100", () => {
    expect(checkVictory(baseState)).toBeNull();
  });
});

// ── New defeat conditions ─────────────────────────────────────────────────────

describe("failureStates — new sector conditions", () => {
  it("includes the 6 new sector-based defeat states", () => {
    const ids = failureStates.map(f => f.id);
    expect(ids).toContain("famine");
    expect(ids).toContain("health-catastrophe");
    expect(ids).toContain("total-blackout");
    expect(ids).toContain("youth-uprising");
    expect(ids).toContain("governance-crisis");
    expect(ids).toContain("environmental-catastrophe");
  });

  it("famine hardCheck triggers when famineTurns >= 3", () => {
    const state: VictoryCheckState = {
      ...baseState,
      defeatVictoryCounters: { ...baseState.defeatVictoryCounters!, famineTurns: 3 },
    };
    expect(checkDefeat(state)?.id).toBe("famine");
  });

  it("famine hardCheck does NOT trigger when famineTurns < 3", () => {
    const state: VictoryCheckState = {
      ...baseState,
      defeatVictoryCounters: { ...baseState.defeatVictoryCounters!, famineTurns: 2 },
    };
    const result = checkDefeat(state);
    expect(result?.id).not.toBe("famine");
  });

  it("total-blackout hardCheck triggers when blackoutTurns >= 5", () => {
    const state: VictoryCheckState = {
      ...baseState,
      defeatVictoryCounters: { ...baseState.defeatVictoryCounters!, blackoutTurns: 5 },
    };
    expect(checkDefeat(state)?.id).toBe("total-blackout");
  });

  it("governance-crisis hardCheck triggers when governanceCrisisTurns >= 4", () => {
    const state: VictoryCheckState = {
      ...baseState,
      defeatVictoryCounters: { ...baseState.defeatVictoryCounters!, governanceCrisisTurns: 4 },
    };
    expect(checkDefeat(state)?.id).toBe("governance-crisis");
  });

  it("health-catastrophe hardCheck triggers on epidemic > 80 AND hwd < 0.5", () => {
    const state: VictoryCheckState = {
      ...baseState,
      healthSector: {
        ...neutralSector,
        indicators: { epidemicRisk: 85, healthWorkerDensity: 0.3 },
      },
    };
    expect(checkDefeat(state)?.id).toBe("health-catastrophe");
  });

  it("health-catastrophe does NOT trigger when only epidemic is high", () => {
    const state: VictoryCheckState = {
      ...baseState,
      healthSector: {
        ...neutralSector,
        indicators: { epidemicRisk: 85, healthWorkerDensity: 1.5 },
      },
    };
    const result = checkDefeat(state);
    expect(result?.id).not.toBe("health-catastrophe");
  });

  it("youth-uprising hardCheck triggers on unrestRisk > 90 AND unemployment > 55", () => {
    const state: VictoryCheckState = {
      ...baseState,
      youthEmployment: {
        ...neutralSector,
        indicators: { socialUnrestRisk: 92, youthUnemploymentRate: 58 },
      },
    };
    expect(checkDefeat(state)?.id).toBe("youth-uprising");
  });

  it("environmental-catastrophe hardCheck triggers on flood > 90 AND adaptation < 10", () => {
    const state: VictoryCheckState = {
      ...baseState,
      environment: {
        ...neutralSector,
        indicators: { floodDisplacementRisk: 93, climateAdaptationScore: 5 },
      },
    };
    expect(checkDefeat(state)?.id).toBe("environmental-catastrophe");
  });

  it("checkDefeat returns null in normal healthy state", () => {
    expect(checkDefeat(baseState)).toBeNull();
  });

  it("risk scores are in [0, 100] range for all failure states", () => {
    const risks = computeFailureRisks(baseState);
    for (const [id, risk] of Object.entries(risks)) {
      expect(risk, `${id} risk`).toBeGreaterThanOrEqual(0);
      expect(risk, `${id} risk`).toBeLessThanOrEqual(100);
    }
  });
});
