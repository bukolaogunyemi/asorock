// client/src/lib/dismissalEngine.test.ts
import { describe, it, expect } from "vitest";
import type { GameState, CharacterState, ActiveEvent, GameInboxMessage, FactionState, Consequence } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import type { DirectorAppointment } from "./directorTypes";
import type { AmbassadorAppointment } from "./diplomatTypes";
import type { MilitaryAppointment } from "./militaryTypes";
import type { Godfather, GodfatherStable, PatronageState } from "./godfatherTypes";
import { processDismissal } from "./dismissalEngine";
import type { DismissalResult } from "./dismissalEngine";

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 60, diplomacy: 60, security: 60, media: 60,
      legal: 60, administration: 60, technology: 60,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 60, leadership: 60, ambition: 60,
      integrity: 60, resilience: 60, intrigue: 60,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Character",
    portfolio: overrides.portfolio ?? "Minister",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Northern Caucus",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TC",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makeFaction(overrides: Partial<FactionState> = {}): FactionState {
  return {
    name: overrides.name ?? "Northern Caucus",
    influence: overrides.influence ?? 50,
    loyalty: overrides.loyalty ?? 60,
    stance: overrides.stance ?? "Neutral",
    grievance: overrides.grievance ?? 0,
    firedThresholds: overrides.firedThresholds ?? [],
  };
}

function makeGodfather(overrides: Partial<Godfather> = {}): Godfather {
  return {
    id: overrides.id ?? "gf-test",
    name: overrides.name ?? "Test Godfather",
    archetype: overrides.archetype ?? "oligarch",
    zone: overrides.zone ?? "NW",
    description: "A test godfather",
    traits: overrides.traits ?? { greed: 5, patience: 5, ruthlessness: 5 },
    disposition: overrides.disposition ?? "neutral",
    dealStyle: overrides.dealStyle ?? "favour-bank",
    interests: overrides.interests ?? [],
    stable: overrides.stable ?? {
      governors: [],
      legislativeBloc: { house: 0, senate: 0 },
      cabinetCandidates: [],
      connections: [],
    },
    escalationStage: overrides.escalationStage ?? 0,
    favourDebt: overrides.favourDebt ?? 0,
    activeContracts: overrides.activeContracts ?? [],
    neutralized: overrides.neutralized ?? false,
    influenceScore: overrides.influenceScore ?? 50,
  };
}

/**
 * Builds a minimal GameState sufficient for dismissal testing.
 * Only the fields needed by processDismissal are populated.
 */
function makeMockState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 30,
    date: "Monday, 30 June, 2023",
    phase: "playing",
    approval: 55,
    treasury: 500,
    politicalCapital: 10,
    stability: 60,
    presidentName: "Test President",
    presidentOrigin: "Lagos",
    presidentTraits: [],
    stress: 20,
    presidentAge: 55,
    presidentGender: "Male",
    presidentState: "Lagos",
    presidentEducation: "University",
    presidentTitle: "President",
    presidentEthnicity: "Yoruba",
    presidentReligion: "Christian",
    presidentOccupation: "Politician",
    presidentParty: "APC",
    partyLoyalty: 70,
    politicalState: {} as any,
    presidentEra: "Modern",
    vicePresident: {} as any,
    constitutionalOfficers: [],
    personalAssistant: "PA Name",
    campaignPromises: [],
    appointments: [],
    term: {} as any,
    health: 80,
    healthCrisis: {} as any,
    macroEconomy: {} as any,
    macroHistory: [],
    cabalMeeting: null,
    characters: {},
    factions: {},
    activeChains: [],
    activeEvents: [],
    pendingConsequences: [],
    victoryProgress: {},
    failureRisks: {},
    outrage: 10,
    trust: 50,
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
    ministerStatuses: {},
    cabinetRetreats: {
      lastRetreatDay: 0,
      priorities: [],
      lastFECDay: 0,
      fecCooldownUntil: 0,
      pendingFECMemos: [],
    },
    lastActionAtDay: {},
    policyLevers: {} as any,
    legislature: {} as any,
    patronage: {
      godfathers: [],
      patronageIndex: 0,
      activeDeals: 0,
      neutralizedGodfathers: [],
      approachCooldowns: {},
    },
    federalCharacter: {} as any,
    intelligence: {} as any,
    partyInternals: {} as any,
    economy: {} as any,
    lastBriefData: null,
    reforms: [],
    infrastructure: {} as any,
    healthSector: {} as any,
    education: {} as any,
    agriculture: {} as any,
    interior: {} as any,
    environment: {} as any,
    youthEmployment: {} as any,
    budgetAllocation: {} as any,
    internationalReputation: 50,
    crossSectorEffects: {} as any,
    crossSectorCascades: [],
    defeatVictoryCounters: {} as any,
    directors: {
      positions: [],
      appointments: [],
      technocratsFired: 0,
      vacancyTracking: {} as any,
    },
    judiciary: {} as any,
    unionLeaders: {} as any,
    governorSystem: {} as any,
    diplomats: {
      posts: [],
      appointments: [],
      incidents: [],
      diplomaticEffectiveness: 50,
    },
    military: {
      positions: [],
      appointments: [],
      coupRisk: 10,
      securityEffectiveness: 50,
    },
    traditionalRulers: {} as any,
    religiousLeaders: {} as any,
    ...overrides,
  } as GameState;
}

// ══════════════════════════════════════════════════════════════
// Task 1: Minister dismissal path
// ══════════════════════════════════════════════════════════════

describe("dismissalEngine — minister path", () => {
  it("removes minister from cabinetAppointments and ministerStatuses", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Dr. Bello" },
      ministerStatuses: {
        "Dr. Bello": {
          lastSummonedDay: 0,
          lastDirectiveDay: 0,
          onProbation: false,
          probationStartDay: 0,
          appointmentDay: 5,
          pendingMemos: [],
        },
      },
      characters: {
        "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Northern Caucus" }),
      },
      factions: {
        "Northern Caucus": makeFaction({ name: "Northern Caucus", loyalty: 60 }),
      },
    });

    const result = processDismissal(state, "minister", "finance");
    expect(result.updatedState.cabinetAppointments?.["finance"]).toBeNull();
    expect(result.updatedState.ministerStatuses).toBeDefined();
    expect(result.updatedState.ministerStatuses!["Dr. Bello"]).toBeUndefined();
  });

  it("generates -3 approval and -2 stability consequences for minister", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Dr. Bello" },
      ministerStatuses: {
        "Dr. Bello": {
          lastSummonedDay: 0, lastDirectiveDay: 0,
          onProbation: false, probationStartDay: 0,
          appointmentDay: 5, pendingMemos: [],
        },
      },
      characters: {
        "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Northern Caucus" }),
      },
      factions: {
        "Northern Caucus": makeFaction(),
      },
    });

    const result = processDismissal(state, "minister", "finance");
    const approvalEffect = result.consequences.flatMap(c => c.effects).find(e => e.target === "approval");
    const stabilityEffect = result.consequences.flatMap(c => c.effects).find(e => e.target === "stability");
    expect(approvalEffect).toBeDefined();
    expect(approvalEffect!.value).toBe(-3);
    expect(stabilityEffect).toBeDefined();
    expect(stabilityEffect!.value).toBe(-2);
  });

  it("generates an inbox message about the dismissal", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Dr. Bello" },
      ministerStatuses: {
        "Dr. Bello": {
          lastSummonedDay: 0, lastDirectiveDay: 0,
          onProbation: false, probationStartDay: 0,
          appointmentDay: 5, pendingMemos: [],
        },
      },
      characters: {
        "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "minister", "finance");
    expect(result.inboxMessages.length).toBeGreaterThanOrEqual(1);
    const msg = result.inboxMessages[0];
    expect(msg.subject).toContain("Dr. Bello");
    expect(msg.subject.toLowerCase()).toContain("relieved");
  });

  it("returns empty result when positionId has no appointment", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: null },
    });

    const result = processDismissal(state, "minister", "finance");
    expect(result.consequences).toHaveLength(0);
    expect(result.inboxMessages).toHaveLength(0);
    expect(result.events).toHaveLength(0);
  });

  it("returns empty result when positionId does not exist", () => {
    const state = makeMockState({
      cabinetAppointments: {},
    });

    const result = processDismissal(state, "minister", "nonexistent");
    expect(result.consequences).toHaveLength(0);
  });

  it("generates a cabinet-appointment vacancy event for minister", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Dr. Bello" },
      ministerStatuses: {
        "Dr. Bello": {
          lastSummonedDay: 0, lastDirectiveDay: 0,
          onProbation: false, probationStartDay: 0,
          appointmentDay: 5, pendingMemos: [],
        },
      },
      characters: {
        "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "minister", "finance");
    const vacancyEvent = result.events.find(e => e.source === "cabinet-appointment");
    expect(vacancyEvent).toBeDefined();
    expect(vacancyEvent!.cabinetPortfolio).toBe("finance");
  });

  it("marks lifecycle exit with exitReason 'fired'", () => {
    const state = makeMockState({
      cabinetAppointments: { finance: "Dr. Bello" },
      ministerStatuses: {
        "Dr. Bello": {
          lastSummonedDay: 0, lastDirectiveDay: 0,
          onProbation: false, probationStartDay: 0,
          appointmentDay: 5, pendingMemos: [],
        },
      },
      characters: {
        "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "minister", "finance");
    expect(result.lifecycleExit).toEqual({
      characterName: "Dr. Bello",
      exitReason: "fired",
    });
  });
});
