import { describe, expect, it } from "vitest";
import type { GameState } from "./gameTypes";
import type { FactionProfile } from "./factionProfiles";
import {
  computeFactionDrift,
  updateGrievance,
  checkGrievanceThresholds,
  hydrateDemandEvent,
} from "./factionDrift";
import { FACTION_PROFILES, GRIEVANCE_THRESHOLDS, THRESHOLD_REARM_BUFFER } from "./factionProfiles";

// ── Helpers ─────────────────────────────────────────────
const makeFactionState = (overrides = {}) => ({
  name: "Test Faction",
  influence: 20,
  loyalty: 50,
  stance: "Neutral" as const,
  grievance: 0,
  firedThresholds: [] as number[],
  ...overrides,
});

const makeMinimalState = (overrides: Partial<GameState> = {}): GameState => ({
  approval: 50,
  stability: 50,
  politicalCapital: 50,
  day: 30,
  date: "2023-06-30",
  phase: "playing",
  treasury: 2.0,
  presidentName: "Test",
  presidentOrigin: "Test",
  presidentTraits: [],
  stress: 30,
  presidentAge: 50,
  presidentGender: "Male",
  presidentState: "Lagos",
  presidentEducation: "Master's Degree",
  presidentParty: "ADU",
  presidentEra: "2023",
  vicePresident: { name: "VP", loyalty: 60, ambition: 50, relationship: "Neutral", mood: "Steady" },
  personalAssistant: "Aide",
  campaignPromises: [],
  appointments: [],
  term: { current: 1, daysInOffice: 30, daysUntilElection: 1430, daysUntilMediaChat: 7, daysUntilFactionReport: 30, daysUntilEconomicSnapshot: 14, reelectionsWon: 0, overstayDays: 0, governingPhase: "honeymoon", electionMomentum: 50 },
  health: 80,
  healthCrisis: { consecutiveHighStressDays: 0, rumorsActive: false, announced: false, concealmentActive: false, recoveryTurnsRemaining: 0 },
  macroEconomy: { inflation: 15, fxRate: 800, reserves: 35, debtToGdp: 30, oilOutput: 1.8, subsidyPressure: 30 },
  macroHistory: [],
  cabalMeeting: null,
  characters: {},
  factions: { "Test Faction": makeFactionState() },
  activeChains: [],
  activeEvents: [],
  pendingConsequences: [],
  victoryProgress: {},
  failureRisks: {},
  outrage: 20,
  trust: 60,
  activeCases: [],
  judicialIndependence: 70,
  governors: [],
  turnLog: [],
  inboxMessages: [],
  headlines: [],
  dailySummary: null,
  approvalHistory: [],
  legacyMilestones: [],
  lastActionAtDay: {},
  policyLevers: {
    fuelSubsidy: { position: "partial", pendingPosition: null, cooldownUntilDay: 0 },
    electricityTariff: { position: "tiered", pendingPosition: null, cooldownUntilDay: 0 },
    fxPolicy: { position: "managed-float", pendingPosition: null, cooldownUntilDay: 0 },
    interestRate: { position: "neutral", pendingPosition: null, cooldownUntilDay: 0 },
    taxRate: { position: "standard", pendingPosition: null, cooldownUntilDay: 0 },
    cashTransfers: { position: "minimal", pendingPosition: null, cooldownUntilDay: 0 },
    importTariffs: { position: "moderate", pendingPosition: null, cooldownUntilDay: 0 },
    minimumWage: { position: "modest", pendingPosition: null, cooldownUntilDay: 0 },
    publicSectorHiring: { position: "normal", pendingPosition: null, cooldownUntilDay: 0 },
  },
  ...overrides,
} as GameState);

const pragmaticProfile: FactionProfile = {
  key: "Test Faction",
  temperament: "pragmatic",
  loyaltyInertia: 0.6,
  policyPreferences: [
    { leverKey: "fuelSubsidy", favored: ["full", "partial"], opposed: ["removed"], weight: 1.5 },
  ],
  macroSensitivities: [
    { key: "inflation", ideal: 15, weight: 1.0 },
  ],
  demandTemplates: [],
};

// ── Layer 1: Policy Alignment ───────────────────────────
describe("computeFactionDrift", () => {
  it("returns positive drift when policy is in favored set", () => {
    const state = makeMinimalState();
    // fuelSubsidy is "partial" which is in favored
    const drift = computeFactionDrift(pragmaticProfile, state);
    expect(drift).toBeGreaterThan(0);
  });

  it("returns negative drift when policy is in opposed set", () => {
    const state = makeMinimalState({
      policyLevers: {
        ...makeMinimalState().policyLevers,
        fuelSubsidy: { position: "removed", pendingPosition: null, cooldownUntilDay: 0 },
      },
    });
    const drift = computeFactionDrift(pragmaticProfile, state);
    expect(drift).toBeLessThan(0);
  });

  it("returns zero policy contribution for neutral position", () => {
    const state = makeMinimalState({
      policyLevers: {
        ...makeMinimalState().policyLevers,
        fuelSubsidy: { position: "targeted", pendingPosition: null, cooldownUntilDay: 0 },
      },
    });
    // "targeted" is neither favored nor opposed
    const drift = computeFactionDrift(pragmaticProfile, state);
    // Only macro + ambient layers contribute — should be small
    expect(Math.abs(drift)).toBeLessThan(0.5);
  });

  // ── Layer 2: Macro Satisfaction ────────────────────────
  it("penalizes drift when macro deviates from ideal", () => {
    const profileHighMacro: FactionProfile = {
      ...pragmaticProfile,
      policyPreferences: [],
      macroSensitivities: [{ key: "inflation", ideal: 15, weight: 2.0 }],
    };
    const stateAtIdeal = makeMinimalState({ macroEconomy: { ...makeMinimalState().macroEconomy, inflation: 15 } });
    const stateDeviated = makeMinimalState({ macroEconomy: { ...makeMinimalState().macroEconomy, inflation: 35 } });

    const driftIdeal = computeFactionDrift(profileHighMacro, stateAtIdeal);
    const driftDeviated = computeFactionDrift(profileHighMacro, stateDeviated);
    expect(driftDeviated).toBeLessThan(driftIdeal);
  });

  // ── Layer 3: Ambient ──────────────────────────────────
  it("ambient pushes positive when approval and stability are high", () => {
    const profileNoPolicy: FactionProfile = {
      ...pragmaticProfile,
      policyPreferences: [],
      macroSensitivities: [],
    };
    const highState = makeMinimalState({ approval: 80, stability: 80 });
    const lowState = makeMinimalState({ approval: 20, stability: 20 });

    expect(computeFactionDrift(profileNoPolicy, highState)).toBeGreaterThan(computeFactionDrift(profileNoPolicy, lowState));
  });

  // ── Layer 4: Temperament ──────────────────────────────
  it("volatile temperament amplifies drift", () => {
    const volatileProfile: FactionProfile = { ...pragmaticProfile, temperament: "volatile", loyaltyInertia: 0.6 };
    const state = makeMinimalState();
    const pragDrift = computeFactionDrift(pragmaticProfile, state);
    const volDrift = computeFactionDrift(volatileProfile, state);
    expect(Math.abs(volDrift)).toBeGreaterThan(Math.abs(pragDrift));
  });

  it("patient temperament dampens drift", () => {
    const patientProfile: FactionProfile = { ...pragmaticProfile, temperament: "patient", loyaltyInertia: 0.6 };
    const state = makeMinimalState();
    const pragDrift = computeFactionDrift(pragmaticProfile, state);
    const patDrift = computeFactionDrift(patientProfile, state);
    expect(Math.abs(patDrift)).toBeLessThan(Math.abs(pragDrift));
  });

  it("ideological temperament doubles layer 1 and halves layers 2-3", () => {
    const ideoProfile: FactionProfile = {
      ...pragmaticProfile,
      temperament: "ideological",
      policyPreferences: [{ leverKey: "fuelSubsidy", favored: ["partial"], opposed: ["removed"], weight: 1.0 }],
      macroSensitivities: [{ key: "inflation", ideal: 15, weight: 2.0 }],
    };
    const state = makeMinimalState();
    const ideoDrift = computeFactionDrift(ideoProfile, state);
    const pragDrift = computeFactionDrift(pragmaticProfile, state);
    // Ideological has doubled policy bonus — hard to compare exactly, but drift should differ
    expect(ideoDrift).not.toBeCloseTo(pragDrift, 1);
  });

  it("loyaltyInertia scales the final delta", () => {
    const highInertia: FactionProfile = { ...pragmaticProfile, loyaltyInertia: 1.0 };
    const lowInertia: FactionProfile = { ...pragmaticProfile, loyaltyInertia: 0.3 };
    const state = makeMinimalState();
    expect(Math.abs(computeFactionDrift(highInertia, state))).toBeGreaterThan(Math.abs(computeFactionDrift(lowInertia, state)));
  });
});

// ── Grievance Update ────────────────────────────────────
describe("updateGrievance", () => {
  it("increases grievance on negative drift", () => {
    const result = updateGrievance(10, -2.0, "pragmatic");
    expect(result).toBeGreaterThan(10);
  });

  it("slowly decreases grievance on positive drift", () => {
    const result = updateGrievance(30, 2.0, "pragmatic");
    expect(result).toBeLessThan(30);
  });

  it("clamps grievance to 0-100", () => {
    expect(updateGrievance(0, 5.0, "pragmatic")).toBe(0);
    expect(updateGrievance(99, -50.0, "pragmatic")).toBeLessThanOrEqual(100);
  });

  it("volatile factions decay faster", () => {
    const pragResult = updateGrievance(40, 3.0, "pragmatic");
    const volResult = updateGrievance(40, 3.0, "volatile");
    expect(volResult).toBeLessThan(pragResult);
  });

  it("patient factions accumulate grievance faster", () => {
    const pragResult = updateGrievance(10, -3.0, "pragmatic");
    const patResult = updateGrievance(10, -3.0, "patient");
    expect(patResult).toBeGreaterThan(pragResult);
  });

  it("calculating factions accumulate grievance at 1.5x", () => {
    const pragResult = updateGrievance(10, -3.0, "pragmatic");
    const calcResult = updateGrievance(10, -3.0, "calculating");
    expect(calcResult).toBeGreaterThan(pragResult);
  });
});

// ── Grievance Threshold Checking ────────────────────────
describe("checkGrievanceThresholds", () => {
  it("returns no events when grievance is below 20", () => {
    const result = checkGrievanceThresholds("Northern Caucus", 15, [], 30);
    expect(result.events).toHaveLength(0);
    expect(result.firedThresholds).toEqual([]);
  });

  it("fires tier 20 whisper when grievance crosses 20", () => {
    const result = checkGrievanceThresholds("Northern Caucus", 22, [], 30);
    expect(result.firedThresholds).toContain(20);
    // Tier 20 is a whisper — produces a summary line, not an ActiveEvent
    expect(result.advisorLine).toBeTruthy();
  });

  it("fires tier 40 event when grievance crosses 40", () => {
    const result = checkGrievanceThresholds("Northern Caucus", 42, [20], 30);
    expect(result.firedThresholds).toContain(40);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].source).toBe("faction-demand");
  });

  it("does not re-fire already fired threshold", () => {
    const result = checkGrievanceThresholds("Northern Caucus", 42, [20, 40], 30);
    expect(result.events).toHaveLength(0);
  });

  it("re-arms threshold when grievance drops 10+ below it", () => {
    // Was at 40, grievance dropped to 28 (40 - 10 - 2)
    const result = checkGrievanceThresholds("Northern Caucus", 28, [20, 40], 30);
    expect(result.firedThresholds).not.toContain(40);
    // Threshold 20 should remain fired since 28 > 20
    expect(result.firedThresholds).toContain(20);
  });

  it("fires multiple thresholds if grievance jumps past several", () => {
    const result = checkGrievanceThresholds("Northern Caucus", 75, [], 30);
    expect(result.firedThresholds).toContain(20);
    expect(result.firedThresholds).toContain(40);
    expect(result.firedThresholds).toContain(70);
  });

  it("fires tier 100 breaking point with direct consequences and reactive event", () => {
    const result = checkGrievanceThresholds("Northern Caucus", 100, [20, 40, 70, 90], 30);
    expect(result.firedThresholds).toContain(100);
    // Breaking point produces direct consequences (automatic blow)
    expect(result.breakingPointConsequences).not.toBeNull();
    expect(result.breakingPointConsequences!.effects.some((e) => e.target === "faction" && e.delta < 0)).toBe(true);
    expect(result.breakingPointConsequences!.effects.some((e) => e.target === "stability" && e.delta < 0)).toBe(true);
    // Also produces a reactive event for damage control choices
    expect(result.events).toHaveLength(1);
    expect(result.events[0].source).toBe("faction-demand");
    expect(result.events[0].factionKey).toBe("Northern Caucus");
  });
});

// ── Event Hydration ─────────────────────────────────────
describe("hydrateDemandEvent", () => {
  it("produces a valid ActiveEvent from a demand template", () => {
    const profile = FACTION_PROFILES.find((p) => p.key === "Northern Caucus")!;
    const template = profile.demandTemplates.find((t) => t.grievanceLevel === 70)!;
    const event = hydrateDemandEvent(template, "Northern Caucus", 30);

    expect(event.id).toBe("faction-demand-Northern Caucus-70-d30");
    expect(event.source).toBe("faction-demand");
    expect(event.factionKey).toBe("Northern Caucus");
    expect(event.expiresInDays).toBe(30);
    expect(event.choices.length).toBeGreaterThanOrEqual(2);
    expect(event.description).toContain("Northern Caucus");
  });

  it("hydrates choice archetypes into proper EventChoice with consequences", () => {
    const profile = FACTION_PROFILES.find((p) => p.key === "Northern Caucus")!;
    const template = profile.demandTemplates.find((t) => t.grievanceLevel === 70)!;
    const event = hydrateDemandEvent(template, "Northern Caucus", 30);

    const concedeChoice = event.choices.find((c) => c.id === "concede");
    expect(concedeChoice).toBeDefined();
    expect(concedeChoice!.consequences.length).toBeGreaterThan(0);

    // Verify consequence has effects targeting faction loyalty and grievance
    const allEffects = concedeChoice!.consequences.flatMap((c) => c.effects);
    expect(allEffects.some((e) => e.target === "faction")).toBe(true);
    expect(allEffects.some((e) => e.target === "grievance")).toBe(true);
    expect(allEffects.some((e) => e.target === "politicalCapital")).toBe(true);
  });

  it("replaces {faction} placeholder in title and description", () => {
    const profile = FACTION_PROFILES.find((p) => p.key === "Youth Movement")!;
    const template = profile.demandTemplates.find((t) => t.grievanceLevel === 70)!;
    const event = hydrateDemandEvent(template, "Youth Movement", 30);
    // Verify no unresolved placeholders remain
    expect(event.description).not.toContain("{faction}");
    expect(event.title).not.toContain("{faction}");
    // Title should contain the faction name
    expect(event.title).toContain("Youth Movement");
    // Description should be populated
    expect(event.description.length).toBeGreaterThan(0);
  });

  it("copies requirements from archetype to choice", () => {
    const profile = FACTION_PROFILES.find((p) => p.key === "Northern Caucus")!;
    const template = profile.demandTemplates.find((t) => t.grievanceLevel === 90)!;
    const event = hydrateDemandEvent(template, "Northern Caucus", 30);
    const concedeChoice = event.choices.find((c) => c.id === "concede");
    expect(concedeChoice?.requirements).toBeDefined();
    expect(concedeChoice!.requirements!.some((r) => r.metric === "politicalCapital")).toBe(true);
  });
});

// ── Save Migration ──────────────────────────────────────
describe("save migration", () => {
  it("adds grievance: 0 and firedThresholds: [] to factions missing those fields", async () => {
    const { hydrateLoadedGameState } = await import("./GameContext");
    // Simulate a pre-migration save: FactionState without grievance/firedThresholds
    const oldFaction = { name: "Northern Caucus", influence: 28, loyalty: 50, stance: "Neutral" as const };
    const oldState = { factions: { "Northern Caucus": oldFaction } } as any;

    const migrated = hydrateLoadedGameState(oldState);

    expect(migrated.factions["Northern Caucus"].grievance).toBe(0);
    expect(migrated.factions["Northern Caucus"].firedThresholds).toEqual([]);
    expect(migrated.factions["Northern Caucus"].loyalty).toBe(50);
    expect(migrated.factions["Northern Caucus"].influence).toBe(28);
  });
});
