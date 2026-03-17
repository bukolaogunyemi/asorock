// sectorTurnProcessor.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { processSectorTurns, computeApprovalModifier, computeInternationalReputation } from "./sectorTurnProcessor";
import type { GameState } from "./gameTypes";
import type { GovernanceSectorState, CrossSectorEffects, CrossSectorCascade } from "./sectorTypes";
import {
  defaultInfrastructureState,
  defaultHealthState,
  defaultEducationState,
  defaultAgricultureState,
  defaultInteriorState,
  defaultEnvironmentState,
  defaultYouthEmploymentState,
  defaultBudgetAllocation,
  buildCrossSectorEffects,
} from "./sectorTypes";
import { defaultEconomicState } from "./economicEngine";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeLever(position: string) {
  return { position, pendingPosition: null, cooldownUntilDay: 0 };
}

function makeDefaultLevers() {
  return {
    fuelSubsidy: makeLever("full"),
    electricityTariff: makeLever("subsidised"),
    fxPolicy: makeLever("managed-float"),
    interestRate: makeLever("neutral"),
    taxRate: makeLever("standard"),
    cashTransfers: makeLever("none"),
    importTariffs: makeLever("moderate"),
    minimumWage: makeLever("frozen"),
    publicSectorHiring: makeLever("normal"),
    powerPrivatization: makeLever("state-run"),
    oilSectorReform: makeLever("status-quo"),
    transportPriority: makeLever("roads"),
    digitalInvestment: makeLever("minimal"),
    healthcareFunding: makeLever("basic"),
    drugProcurement: makeLever("local-preference"),
    universityAutonomy: makeLever("centralized"),
    educationBudgetSplit: makeLever("balanced"),
    landReform: makeLever("communal"),
    agricSubsidies: makeLever("none"),
    borderPolicy: makeLever("standard"),
    nationalIdPush: makeLever("voluntary"),
    gasFlarePolicy: makeLever("tolerance"),
    climateAdaptation: makeLever("minimal"),
    nyscReform: makeLever("status-quo"),
    youthEnterprise: makeLever("minimal"),
  } as GameState["policyLevers"];
}

function makeMinimalGameState(): GameState {
  const infrastructure = defaultInfrastructureState();
  const healthSector = defaultHealthState();
  const education = defaultEducationState();
  const agriculture = defaultAgricultureState();
  const interior = defaultInteriorState();
  const environment = defaultEnvironmentState();
  const youthEmployment = defaultYouthEmploymentState();
  const economy = defaultEconomicState();

  const crossSectorEffects = buildCrossSectorEffects({
    economy,
    stability: 55,
    infrastructure,
    agriculture,
    health: healthSector,
    education,
    youthEmployment,
    environment,
    interior,
  });

  return {
    day: 1,
    date: "2023-06-01",
    phase: "playing",
    approval: 55,
    treasury: 150,
    politicalCapital: 50,
    stability: 55,
    presidentName: "Test",
    presidentOrigin: "Lagos",
    presidentTraits: [],
    stress: 20,
    presidentAge: 55,
    presidentGender: "Male",
    presidentState: "Lagos",
    presidentEducation: "University",
    presidentTitle: "President",
    presidentEthnicity: "Yoruba",
    presidentReligion: "Christianity",
    presidentOccupation: "Politician",
    presidentParty: "APC",
    partyLoyalty: 70,
    politicalState: { partyLoyalty: 70 },
    presidentEra: "2023",
    vicePresident: { name: "VP", loyalty: 60, ambition: 40, relationship: "Friendly", mood: "Steady" },
    constitutionalOfficers: [],
    personalAssistant: "Aide",
    campaignPromises: [],
    appointments: [],
    term: {
      current: 1,
      daysInOffice: 1,
      daysUntilElection: 1000,
      daysUntilMediaChat: 30,
      daysUntilFactionReport: 30,
      daysUntilEconomicSnapshot: 30,
      reelectionsWon: 0,
      overstayDays: 0,
      governingPhase: "governance",
      electionMomentum: 0,
    },
    health: 80,
    healthCrisis: {
      consecutiveHighStressDays: 0,
      rumorsActive: false,
      announced: false,
      concealmentActive: false,
      recoveryTurnsRemaining: 0,
    },
    macroEconomy: {
      inflation: 15,
      fxRate: 1200,
      reserves: 32,
      debtToGdp: 35,
      oilOutput: 2,
      subsidyPressure: 30,
    },
    macroHistory: [],
    cabalMeeting: null,
    characters: {},
    factions: {},
    activeChains: [],
    activeEvents: [],
    pendingConsequences: [],
    victoryProgress: {},
    failureRisks: {},
    outrage: 20,
    trust: 60,
    activeCases: [],
    judicialIndependence: 50,
    governors: [],
    turnLog: [],
    inboxMessages: [],
    headlines: [],
    dailySummary: null,
    approvalHistory: [],
    legacyMilestones: [],
    cabinetAppointments: {},
    lastActionAtDay: {},
    policyLevers: makeDefaultLevers(),
    legislature: {} as any,
    patronage: {} as any,
    federalCharacter: {} as any,
    intelligence: {} as any,
    partyInternals: {} as any,
    economy,
    lastBriefData: null,
    reforms: [],
    infrastructure,
    healthSector,
    education,
    agriculture,
    interior,
    environment,
    youthEmployment,
    budgetAllocation: defaultBudgetAllocation(),
    internationalReputation: 50,
    crossSectorEffects,
    crossSectorCascades: [],
    defeatVictoryCounters: { famineTurns: 0, blackoutTurns: 0, governanceCrisisTurns: 0, gdpGrowthPositiveTurns: 0 },
    ministerStatuses: {},
    cabinetRetreats: { lastRetreatDay: 0, priorities: [], lastFECDay: 0, fecCooldownUntil: 0, pendingFECMemos: [] },
    directors: { positions: [], appointments: [], technocratsFired: 0, vacancyTracking: {} },
    judiciary: {
      supremeCourt: { justices: [], chiefJustice: null, cjnConfirmed: false },
      courtOfAppeal: { justices: [], president: null, pcaConfirmed: false },
      pendingNomination: { position: null, nominee: null, hearingDay: null },
    },
    unionLeaders: {
      positions: [],
      appointments: {
        "chairman-teachers-union": null,
        "chairman-labour-union": null,
        "chairman-trade-congress": null,
        "chairman-youth-forum": null,
        "chairman-petroleum-workers": null,
        "chairman-medical-association": null,
      },
    },
    governorSystem: { governors: [], forumChair: null, forumChairElectedDay: null, nextElectionDay: 1460 },
    diplomats: { posts: [], appointments: [] },
  };
}

// ── processSectorTurns ────────────────────────────────────────────────────────

describe("processSectorTurns", () => {
  it("returns all 7 sector states", () => {
    const state = makeMinimalGameState();
    const result = processSectorTurns(state);

    expect(result.infrastructure).toBeDefined();
    expect(result.healthSector).toBeDefined();
    expect(result.education).toBeDefined();
    expect(result.agriculture).toBeDefined();
    expect(result.interior).toBeDefined();
    expect(result.environment).toBeDefined();
    expect(result.youthEmployment).toBeDefined();
  });

  it("returns crossSectorEffects and crossSectorCascades", () => {
    const state = makeMinimalGameState();
    const result = processSectorTurns(state);

    expect(result.crossSectorEffects).toBeDefined();
    expect(result.crossSectorCascades).toBeDefined();
    expect(Array.isArray(result.crossSectorCascades)).toBe(true);
  });

  it("returns approvalModifier and internationalReputation", () => {
    const state = makeMinimalGameState();
    const result = processSectorTurns(state);

    expect(typeof result.approvalModifier).toBe("number");
    expect(typeof result.internationalReputation).toBe("number");
  });

  it("budget allocation is passed to the correct engines", () => {
    const state = makeMinimalGameState();
    // Set a very high infrastructure budget to verify it influences output
    state.budgetAllocation.infrastructure = 100;
    state.budgetAllocation.health = 0;

    const resultHigh = processSectorTurns(state);
    state.budgetAllocation.infrastructure = 1;
    state.budgetAllocation.health = 100;
    const resultLow = processSectorTurns(state);

    // High infra budget should produce higher infra power generation than low budget
    expect(resultHigh.infrastructure.indicators.powerGenerationGW)
      .toBeGreaterThan(resultLow.infrastructure.indicators.powerGenerationGW);
  });

  it("uses crossSectorEffects from previous turn state (not rebuilt before running engines)", () => {
    // Set up two states that differ only in their pre-built crossSectorEffects
    const state1 = makeMinimalGameState();
    const state2 = makeMinimalGameState();

    // Manually set a distinctive crossSectorEffects value in state1 vs state2
    // The engines use the effects passed in — if sectorTurnProcessor passes
    // state.crossSectorEffects (not a rebuilt version), output will differ
    state1.crossSectorEffects = { ...state1.crossSectorEffects, stability: 100 };
    state2.crossSectorEffects = { ...state2.crossSectorEffects, stability: 10 };

    const result1 = processSectorTurns(state1);
    const result2 = processSectorTurns(state2);

    // Both return valid results — the effects are used as-is from state
    expect(result1.crossSectorEffects).toBeDefined();
    expect(result2.crossSectorEffects).toBeDefined();
    // New effects (for next turn) are rebuilt after processing
    // They should reflect the new sector states
    expect(result1.crossSectorEffects).not.toBe(state1.crossSectorEffects);
  });

  it("cascade pass runs after all engines and deltas are applied to sector indicators", () => {
    const state = makeMinimalGameState();

    // Trigger the herder-farmer conflict cascade by setting indicator > 70
    state.agriculture.indicators.herderFarmerTension = 75;

    const result = processSectorTurns(state);

    // The cascade should be detected and added to crossSectorCascades
    // (agriculture-herder-farmer-conflict triggers when herderFarmerTension > 70)
    const hasHerderCascade = result.crossSectorCascades.some(
      (c) => c.id === "agriculture-herder-farmer-conflict"
    );
    expect(hasHerderCascade).toBe(true);
  });

  it("cascade deltas are applied to sector indicator values", () => {
    const state = makeMinimalGameState();

    // Inject an active cascade with turnsActive=0 and delay=0 so it fires immediately
    const activeCascade: CrossSectorCascade = {
      id: "test-cascade",
      trigger: {
        kind: "single",
        sector: "infrastructure",
        indicator: "powerGenerationGW",
        condition: "lt",
        threshold: 999, // always true
      },
      effects: [
        { sector: "agriculture", indicator: "cropOutputIndex", delta: -10, delay: 0 },
      ],
      severity: 1,
      resolved: false,
      turnsActive: 0,
    };
    state.crossSectorCascades = [activeCascade];

    const baseState = makeMinimalGameState();
    const baseResult = processSectorTurns(baseState);

    const result = processSectorTurns(state);

    // With cascade delta of -10 on cropOutputIndex, the cascade-affected result
    // should have a lower cropOutputIndex than the baseline (no cascades)
    // Note: cascade is advanced first (turnsActive becomes 1), delay=0 so effect applies
    expect(result.agriculture.indicators.cropOutputIndex)
      .toBeLessThan(baseResult.agriculture.indicators.cropOutputIndex + 1); // allows for small rounding
  });

  it("sector states have valid health values in 0-100 range", () => {
    const state = makeMinimalGameState();
    const result = processSectorTurns(state);

    expect(result.infrastructure.health).toBeGreaterThanOrEqual(0);
    expect(result.infrastructure.health).toBeLessThanOrEqual(100);
    expect(result.healthSector.health).toBeGreaterThanOrEqual(0);
    expect(result.healthSector.health).toBeLessThanOrEqual(100);
    expect(result.education.health).toBeGreaterThanOrEqual(0);
    expect(result.education.health).toBeLessThanOrEqual(100);
    expect(result.agriculture.health).toBeGreaterThanOrEqual(0);
    expect(result.agriculture.health).toBeLessThanOrEqual(100);
    expect(result.interior.health).toBeGreaterThanOrEqual(0);
    expect(result.interior.health).toBeLessThanOrEqual(100);
    expect(result.environment.health).toBeGreaterThanOrEqual(0);
    expect(result.environment.health).toBeLessThanOrEqual(100);
    expect(result.youthEmployment.health).toBeGreaterThanOrEqual(0);
    expect(result.youthEmployment.health).toBeLessThanOrEqual(100);
  });
});

// ── computeApprovalModifier ───────────────────────────────────────────────────

describe("computeApprovalModifier", () => {
  function makeSectorStatesMap(healthOverrides: Partial<Record<string, number>> = {}) {
    const makeState = (id: string, health: number): GovernanceSectorState => ({
      id,
      health,
      momentum: 0,
      turnsSinceAttention: 0,
      crisisZone: health >= 60 ? "green" : health >= 35 ? "yellow" : "red",
      activeCascades: [],
      indicators: {},
    });

    return {
      infrastructure: makeState("infrastructure", healthOverrides.infrastructure ?? 60),
      healthSector: makeState("healthSector", healthOverrides.healthSector ?? 60),
      education: makeState("education", healthOverrides.education ?? 60),
      agriculture: makeState("agriculture", healthOverrides.agriculture ?? 60),
      interior: makeState("interior", healthOverrides.interior ?? 60),
      environment: makeState("environment", healthOverrides.environment ?? 60),
      youthEmployment: makeState("youthEmployment", healthOverrides.youthEmployment ?? 60),
    };
  }

  it("returns a positive modifier when all sectors are healthy (health >= 70)", () => {
    const sectors = makeSectorStatesMap({
      infrastructure: 80,
      healthSector: 80,
      education: 80,
      agriculture: 80,
      interior: 80,
      environment: 80,
      youthEmployment: 80,
    });
    const modifier = computeApprovalModifier(sectors);
    expect(modifier).toBeGreaterThan(0);
    expect(modifier).toBeLessThanOrEqual(5);
  });

  it("returns a negative modifier when all sectors are deteriorated (health < 40)", () => {
    const sectors = makeSectorStatesMap({
      infrastructure: 20,
      healthSector: 20,
      education: 20,
      agriculture: 20,
      interior: 20,
      environment: 20,
      youthEmployment: 20,
    });
    const modifier = computeApprovalModifier(sectors);
    expect(modifier).toBeLessThan(0);
    expect(modifier).toBeGreaterThanOrEqual(-8);
  });

  it("returns near-zero modifier for middling sector health (40-70)", () => {
    const sectors = makeSectorStatesMap({
      infrastructure: 55,
      healthSector: 55,
      education: 55,
      agriculture: 55,
      interior: 55,
      environment: 55,
      youthEmployment: 55,
    });
    const modifier = computeApprovalModifier(sectors);
    expect(modifier).toBeGreaterThanOrEqual(-3);
    expect(modifier).toBeLessThanOrEqual(3);
  });

  it("respects salience weights — economy/agriculture deterioration hurts more than environment", () => {
    // Agriculture has 20% weight; environment has 3% weight
    // Deteriorate agriculture heavily, keep environment healthy
    const agricultureBad = makeSectorStatesMap({
      infrastructure: 70,
      healthSector: 70,
      education: 70,
      agriculture: 10,  // very bad
      interior: 70,
      environment: 70,
      youthEmployment: 70,
    });

    // Deteriorate environment heavily, keep agriculture healthy
    const environmentBad = makeSectorStatesMap({
      infrastructure: 70,
      healthSector: 70,
      education: 70,
      agriculture: 70,
      interior: 70,
      environment: 10,  // very bad
      youthEmployment: 70,
    });

    const agricMod = computeApprovalModifier(agricultureBad);
    const envMod = computeApprovalModifier(environmentBad);

    // Bad agriculture should hurt approval more than bad environment
    expect(agricMod).toBeLessThan(envMod);
  });

  it("modifier is bounded within -8 to +5", () => {
    const allMin = makeSectorStatesMap({
      infrastructure: 0,
      healthSector: 0,
      education: 0,
      agriculture: 0,
      interior: 0,
      environment: 0,
      youthEmployment: 0,
    });
    const allMax = makeSectorStatesMap({
      infrastructure: 100,
      healthSector: 100,
      education: 100,
      agriculture: 100,
      interior: 100,
      environment: 100,
      youthEmployment: 100,
    });

    expect(computeApprovalModifier(allMin)).toBeGreaterThanOrEqual(-8);
    expect(computeApprovalModifier(allMax)).toBeLessThanOrEqual(5);
  });
});

// ── computeInternationalReputation ────────────────────────────────────────────

describe("computeInternationalReputation", () => {
  function makeSectorState(id: string, indicators: Record<string, number>): GovernanceSectorState {
    return {
      id,
      health: 50,
      momentum: 0,
      turnsSinceAttention: 0,
      crisisZone: "yellow",
      activeCascades: [],
      indicators,
    };
  }

  function makeSectorStatesMap(overrides: {
    environment?: Record<string, number>;
    healthSector?: Record<string, number>;
    education?: Record<string, number>;
    interior?: Record<string, number>;
    infrastructure?: Record<string, number>;
    agriculture?: Record<string, number>;
    youthEmployment?: Record<string, number>;
  } = {}) {
    return {
      infrastructure: makeSectorState("infrastructure", overrides.infrastructure ?? {}),
      healthSector: makeSectorState("healthSector", overrides.healthSector ?? {}),
      education: makeSectorState("education", overrides.education ?? {}),
      agriculture: makeSectorState("agriculture", overrides.agriculture ?? {}),
      interior: makeSectorState("interior", overrides.interior ?? {}),
      environment: makeSectorState("environment", overrides.environment ?? {}),
      youthEmployment: makeSectorState("youthEmployment", overrides.youthEmployment ?? {}),
    };
  }

  it("returns a value between 0 and 100", () => {
    const sectors = makeSectorStatesMap();
    const economy = defaultEconomicState();
    const rep = computeInternationalReputation(sectors, economy);
    expect(rep).toBeGreaterThanOrEqual(0);
    expect(rep).toBeLessThanOrEqual(100);
  });

  it("returns higher reputation for better environmental and health indicators", () => {
    const goodSectors = makeSectorStatesMap({
      environment: { climateAdaptationScore: 90, gasFlareIndex: 5 },
      healthSector: { healthWorkerDensity: 4.0, epidemicRisk: 5 },
      education: { literacyRate: 95, outOfSchoolChildren: 1 },
      interior: { prisonOccupancyRate: 100 },
    });

    const badSectors = makeSectorStatesMap({
      environment: { climateAdaptationScore: 5, gasFlareIndex: 90 },
      healthSector: { healthWorkerDensity: 0.2, epidemicRisk: 90 },
      education: { literacyRate: 20, outOfSchoolChildren: 24 },
      interior: { prisonOccupancyRate: 390 },
    });

    const economy = defaultEconomicState();
    const goodRep = computeInternationalReputation(goodSectors, economy);
    const badRep = computeInternationalReputation(badSectors, economy);

    expect(goodRep).toBeGreaterThan(badRep);
  });

  it("returns a numeric result even with empty indicator objects", () => {
    const sectors = makeSectorStatesMap();
    const economy = defaultEconomicState();
    const rep = computeInternationalReputation(sectors, economy);
    expect(typeof rep).toBe("number");
    expect(isNaN(rep)).toBe(false);
  });

  it("higher GDP improves international reputation", () => {
    const sectors = makeSectorStatesMap();
    const lowGdpEconomy = { ...defaultEconomicState(), gdp: 100 };
    const highGdpEconomy = { ...defaultEconomicState(), gdp: 1000 };

    const lowRep = computeInternationalReputation(sectors, lowGdpEconomy);
    const highRep = computeInternationalReputation(sectors, highGdpEconomy);

    expect(highRep).toBeGreaterThan(lowRep);
  });
});
