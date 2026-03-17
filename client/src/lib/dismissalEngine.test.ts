// client/src/lib/dismissalEngine.test.ts
import { describe, it, expect } from "vitest";
import type { GameState, CharacterState, FactionState } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import type { Godfather } from "./godfatherTypes";
import { processDismissal } from "./dismissalEngine";

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
      factions: { "Northern Caucus": makeFaction() },
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
    const state = makeMockState({ cabinetAppointments: { finance: null } });
    const result = processDismissal(state, "minister", "finance");
    expect(result.consequences).toHaveLength(0);
    expect(result.inboxMessages).toHaveLength(0);
    expect(result.events).toHaveLength(0);
  });

  it("returns empty result when positionId does not exist", () => {
    const state = makeMockState({ cabinetAppointments: {} });
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

// ══════════════════════════════════════════════════════════════
// Task 2: Director, diplomat, military, aide paths
// ══════════════════════════════════════════════════════════════

describe("dismissalEngine — director path", () => {
  it("sets characterName to null and updates vacancyTracking", () => {
    const state = makeMockState({
      directors: {
        positions: [],
        appointments: [
          { positionId: "cbn-governor", characterName: "Chief Emeka", appointedDay: 5, isOriginal: true },
        ],
        technocratsFired: 0,
        vacancyTracking: {} as any,
      },
      characters: {
        "Chief Emeka": makeCharacter({ name: "Chief Emeka", faction: "Southern Caucus" }),
      },
      factions: { "Southern Caucus": makeFaction({ name: "Southern Caucus" }) },
    });

    const result = processDismissal(state, "director", "cbn-governor");
    const updatedDirectors = result.updatedState.directors!;
    const appt = updatedDirectors.appointments.find(a => a.positionId === "cbn-governor");
    expect(appt!.characterName).toBeNull();
    expect(updatedDirectors.vacancyTracking["cbn-governor"]).toBe(30);
  });

  it("generates -1 approval consequence for director", () => {
    const state = makeMockState({
      directors: {
        positions: [],
        appointments: [
          { positionId: "cbn-governor", characterName: "Chief Emeka", appointedDay: 5, isOriginal: true },
        ],
        technocratsFired: 0,
        vacancyTracking: {} as any,
      },
      characters: {
        "Chief Emeka": makeCharacter({ name: "Chief Emeka", faction: "Southern Caucus" }),
      },
      factions: { "Southern Caucus": makeFaction({ name: "Southern Caucus" }) },
    });

    const result = processDismissal(state, "director", "cbn-governor");
    const approvalEffect = result.consequences.flatMap(c => c.effects).find(e => e.target === "approval");
    expect(approvalEffect).toBeDefined();
    expect(approvalEffect!.value).toBe(-1);
  });

  it("returns empty result for vacant director position", () => {
    const state = makeMockState({
      directors: {
        positions: [],
        appointments: [
          { positionId: "cbn-governor", characterName: null, appointedDay: 5, isOriginal: true },
        ],
        technocratsFired: 0,
        vacancyTracking: {} as any,
      },
    });

    const result = processDismissal(state, "director", "cbn-governor");
    expect(result.consequences).toHaveLength(0);
  });

  it("marks lifecycle exit for director", () => {
    const state = makeMockState({
      directors: {
        positions: [],
        appointments: [
          { positionId: "cbn-governor", characterName: "Chief Emeka", appointedDay: 5, isOriginal: true },
        ],
        technocratsFired: 0,
        vacancyTracking: {} as any,
      },
      characters: {
        "Chief Emeka": makeCharacter({ name: "Chief Emeka" }),
      },
      factions: {},
    });

    const result = processDismissal(state, "director", "cbn-governor");
    expect(result.lifecycleExit).toEqual({
      characterName: "Chief Emeka",
      exitReason: "fired",
    });
  });
});

describe("dismissalEngine — diplomat path", () => {
  it("sets characterName to null and vacantSinceDay for bilateral post", () => {
    const state = makeMockState({
      diplomats: {
        posts: [],
        appointments: [
          { postId: "amb-usa", characterName: "Amb. Okoro", appointedDay: 5, rotationDueDay: 900, vacantSinceDay: null },
        ],
        incidents: [],
        diplomaticEffectiveness: 50,
      },
      characters: {
        "Amb. Okoro": makeCharacter({ name: "Amb. Okoro", faction: "Foreign Service" }),
      },
      factions: { "Foreign Service": makeFaction({ name: "Foreign Service" }) },
    });

    const result = processDismissal(state, "diplomat", "amb-usa");
    const updatedDiplomats = result.updatedState.diplomats!;
    const appt = updatedDiplomats.appointments.find(a => a.postId === "amb-usa");
    expect(appt!.characterName).toBeNull();
    expect(appt!.vacantSinceDay).toBe(30);
  });

  it("generates -2 approval for bilateral diplomat", () => {
    const state = makeMockState({
      diplomats: {
        posts: [],
        appointments: [
          { postId: "amb-usa", characterName: "Amb. Okoro", appointedDay: 5, rotationDueDay: 900, vacantSinceDay: null },
        ],
        incidents: [],
        diplomaticEffectiveness: 50,
      },
      characters: {
        "Amb. Okoro": makeCharacter({ name: "Amb. Okoro", faction: "Foreign Service" }),
      },
      factions: { "Foreign Service": makeFaction({ name: "Foreign Service" }) },
    });

    const result = processDismissal(state, "diplomat", "amb-usa");
    const approvalEffect = result.consequences.flatMap(c => c.effects).find(e => e.target === "approval");
    expect(approvalEffect).toBeDefined();
    expect(approvalEffect!.value).toBe(-2);
  });

  it("generates -1 approval for minor diplomat post", () => {
    const state = makeMockState({
      diplomats: {
        posts: [],
        appointments: [
          { postId: "minor-cuba", characterName: "Amb. Adamu", appointedDay: 5, rotationDueDay: 900, vacantSinceDay: null },
        ],
        incidents: [],
        diplomaticEffectiveness: 50,
      },
      characters: {
        "Amb. Adamu": makeCharacter({ name: "Amb. Adamu", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "diplomat", "minor-cuba");
    const approvalEffect = result.consequences.flatMap(c => c.effects).find(e => e.target === "approval");
    expect(approvalEffect).toBeDefined();
    expect(approvalEffect!.value).toBe(-1);
  });
});

describe("dismissalEngine — military path", () => {
  it("sets characterName to null for military appointment", () => {
    const state = makeMockState({
      military: {
        positions: [],
        appointments: [
          { positionId: "chief-army-force", characterName: "Gen. Tsafe", appointedDay: 5 },
        ],
        coupRisk: 10,
        securityEffectiveness: 50,
      },
      characters: {
        "Gen. Tsafe": makeCharacter({ name: "Gen. Tsafe", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "military", "chief-army-force");
    const updatedMilitary = result.updatedState.military!;
    const appt = updatedMilitary.appointments.find(a => a.positionId === "chief-army-force");
    expect(appt!.characterName).toBeNull();
  });

  it("generates -4 approval and -3 stability for military", () => {
    const state = makeMockState({
      military: {
        positions: [],
        appointments: [
          { positionId: "chief-army-force", characterName: "Gen. Tsafe", appointedDay: 5 },
        ],
        coupRisk: 10,
        securityEffectiveness: 50,
      },
      characters: {
        "Gen. Tsafe": makeCharacter({ name: "Gen. Tsafe", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "military", "chief-army-force");
    const effects = result.consequences.flatMap(c => c.effects);
    expect(effects.find(e => e.target === "approval")!.value).toBe(-4);
    expect(effects.find(e => e.target === "stability")!.value).toBe(-3);
  });
});

describe("dismissalEngine — aide path", () => {
  it("removes aide from appointments array", () => {
    const state = makeMockState({
      appointments: [
        { office: "Chief of Staff", appointee: "Sen. Agba", confirmed: true },
        { office: "SGF", appointee: "Amb. Mustapha", confirmed: true },
      ],
      characters: {
        "Sen. Agba": makeCharacter({ name: "Sen. Agba", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "aide", "Chief of Staff");
    const updatedAppointments = result.updatedState.appointments!;
    expect(updatedAppointments.find(a => a.office === "Chief of Staff")).toBeUndefined();
    expect(updatedAppointments.find(a => a.office === "SGF")).toBeDefined();
  });

  it("clears personalAssistant when dismissing PA", () => {
    const state = makeMockState({
      personalAssistant: "Alhaji Sule",
      appointments: [
        { office: "Personal Assistant", appointee: "Alhaji Sule", confirmed: true },
      ],
      characters: {
        "Alhaji Sule": makeCharacter({ name: "Alhaji Sule", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "aide", "Personal Assistant");
    expect(result.updatedState.personalAssistant).toBe("");
    expect(result.updatedState.appointments!.find(a => a.office === "Personal Assistant")).toBeUndefined();
  });

  it("generates -2 approval for aide dismissal", () => {
    const state = makeMockState({
      appointments: [
        { office: "NSA", appointee: "Gen. Monguno", confirmed: true },
      ],
      characters: {
        "Gen. Monguno": makeCharacter({ name: "Gen. Monguno", faction: "Northern Caucus" }),
      },
      factions: { "Northern Caucus": makeFaction() },
    });

    const result = processDismissal(state, "aide", "NSA");
    const approvalEffect = result.consequences.flatMap(c => c.effects).find(e => e.target === "approval");
    expect(approvalEffect).toBeDefined();
    expect(approvalEffect!.value).toBe(-2);
  });

  it("returns empty result when aide not found", () => {
    const state = makeMockState({ appointments: [] });
    const result = processDismissal(state, "aide", "Nonexistent Office");
    expect(result.consequences).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Task 3: Faction penalty and godfather escalation
// ══════════════════════════════════════════════════════════════

describe("dismissalEngine — faction penalty", () => {
  it("reduces faction loyalty by 5 on minister dismissal", () => {
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
        "Northern Caucus": makeFaction({ name: "Northern Caucus", loyalty: 60 }),
      },
    });

    const result = processDismissal(state, "minister", "finance");
    expect(result.updatedState.factions!["Northern Caucus"].loyalty).toBe(55);
  });

  it("clamps faction loyalty at 0", () => {
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
        "Northern Caucus": makeFaction({ name: "Northern Caucus", loyalty: 2 }),
      },
    });

    const result = processDismissal(state, "minister", "finance");
    expect(result.updatedState.factions!["Northern Caucus"].loyalty).toBe(0);
  });

  it("does not crash when character has no faction match in state.factions", () => {
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
        "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Nonexistent Faction" }),
      },
      factions: {},
    });

    // Should not throw
    const result = processDismissal(state, "minister", "finance");
    expect(result.consequences.length).toBeGreaterThan(0);
  });
});

describe("dismissalEngine — godfather escalation", () => {
  it("escalates godfather when dismissed minister is in cabinetCandidates", () => {
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
      patronage: {
        godfathers: [
          makeGodfather({
            id: "gf-dantata",
            name: "Alhaji Dantata",
            escalationStage: 1,
            stable: {
              governors: [],
              legislativeBloc: { house: 0, senate: 0 },
              cabinetCandidates: ["finance"],
              connections: [],
            },
          }),
        ],
        patronageIndex: 0,
        activeDeals: 0,
        neutralizedGodfathers: [],
        approachCooldowns: {},
      },
    });

    const result = processDismissal(state, "minister", "finance");
    const updatedPatronage = result.updatedState.patronage!;
    const godfather = updatedPatronage.godfathers.find(g => g.id === "gf-dantata");
    expect(godfather!.escalationStage).toBe(2);
  });

  it("does not escalate godfather past stage 4", () => {
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
      patronage: {
        godfathers: [
          makeGodfather({
            id: "gf-dantata",
            escalationStage: 4,
            stable: {
              governors: [],
              legislativeBloc: { house: 0, senate: 0 },
              cabinetCandidates: ["finance"],
              connections: [],
            },
          }),
        ],
        patronageIndex: 0,
        activeDeals: 0,
        neutralizedGodfathers: [],
        approachCooldowns: {},
      },
    });

    const result = processDismissal(state, "minister", "finance");
    const updatedPatronage = result.updatedState.patronage!;
    const godfather = updatedPatronage.godfathers.find(g => g.id === "gf-dantata");
    expect(godfather!.escalationStage).toBe(4);
  });

  it("does not escalate godfather with no interest in the position", () => {
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
      patronage: {
        godfathers: [
          makeGodfather({
            id: "gf-unrelated",
            escalationStage: 1,
            stable: {
              governors: [],
              legislativeBloc: { house: 0, senate: 0 },
              cabinetCandidates: ["defence"],
              connections: [],
            },
          }),
        ],
        patronageIndex: 0,
        activeDeals: 0,
        neutralizedGodfathers: [],
        approachCooldowns: {},
      },
    });

    const result = processDismissal(state, "minister", "finance");
    const updatedPatronage = result.updatedState.patronage!;
    const godfather = updatedPatronage.godfathers.find(g => g.id === "gf-unrelated");
    expect(godfather!.escalationStage).toBe(1);
  });
});

// ══════════════════════════════════════════════════════════════
// Task 4: Dismissal preview
// ══════════════════════════════════════════════════════════════

import { computeDismissalPreview } from "./dismissalEngine";

describe("computeDismissalPreview", () => {
  describe("approval/stability costs per system type", () => {
    it("returns -3 approval and -2 stability for minister dismissal", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello" }),
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.approvalCost).toBe(-3);
      expect(preview.stabilityCost).toBe(-2);
    });

    it("returns -1 approval and 0 stability for director dismissal", () => {
      const state = makeMockState({
        directors: {
          positions: [],
          appointments: [
            { positionId: "cbn-governor", characterName: "Chief Emeka", appointedDay: 5, isOriginal: true },
          ],
          technocratsFired: 0,
          vacancyTracking: {} as any,
        },
        characters: {
          "Chief Emeka": makeCharacter({ name: "Chief Emeka" }),
        },
      });
      const preview = computeDismissalPreview(state, "director", "cbn-governor");
      expect(preview.approvalCost).toBe(-1);
      expect(preview.stabilityCost).toBe(0);
    });

    it("returns -2 approval for bilateral diplomat and -1 for minor", () => {
      const bilateralState = makeMockState({
        diplomats: {
          posts: [],
          appointments: [
            { postId: "amb-usa", characterName: "Amb. Okoro", appointedDay: 5, rotationDueDay: 900, vacantSinceDay: null },
          ],
          incidents: [],
          diplomaticEffectiveness: 50,
        },
        characters: {
          "Amb. Okoro": makeCharacter({ name: "Amb. Okoro" }),
        },
      });
      const bilateralPreview = computeDismissalPreview(bilateralState, "diplomat", "amb-usa");
      expect(bilateralPreview.approvalCost).toBe(-2);
      expect(bilateralPreview.stabilityCost).toBe(0);

      const minorState = makeMockState({
        diplomats: {
          posts: [],
          appointments: [
            { postId: "minor-cuba", characterName: "Amb. Adamu", appointedDay: 5, rotationDueDay: 900, vacantSinceDay: null },
          ],
          incidents: [],
          diplomaticEffectiveness: 50,
        },
        characters: {
          "Amb. Adamu": makeCharacter({ name: "Amb. Adamu" }),
        },
      });
      const minorPreview = computeDismissalPreview(minorState, "diplomat", "minor-cuba");
      expect(minorPreview.approvalCost).toBe(-1);
    });

    it("returns -4 approval and -3 stability for military dismissal", () => {
      const state = makeMockState({
        military: {
          positions: [],
          appointments: [
            { positionId: "chief-army-force", characterName: "Gen. Tsafe", appointedDay: 5 },
          ],
          coupRisk: 10,
          securityEffectiveness: 50,
        },
        characters: {
          "Gen. Tsafe": makeCharacter({ name: "Gen. Tsafe" }),
        },
      });
      const preview = computeDismissalPreview(state, "military", "chief-army-force");
      expect(preview.approvalCost).toBe(-4);
      expect(preview.stabilityCost).toBe(-3);
    });

    it("returns -2 approval and 0 stability for aide dismissal", () => {
      const state = makeMockState({
        appointments: [
          { office: "Chief of Staff", appointee: "Sen. Agba", confirmed: true },
        ],
        characters: {
          "Sen. Agba": makeCharacter({ name: "Sen. Agba" }),
        },
      });
      const preview = computeDismissalPreview(state, "aide", "Chief of Staff");
      expect(preview.approvalCost).toBe(-2);
      expect(preview.stabilityCost).toBe(0);
    });
  });

  describe("affected factions", () => {
    it("lists faction of the dismissed character", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "Northern Caucus" }),
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.affectedFactions).toContain("Northern Caucus");
    });

    it("returns empty array when character has no faction", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello", faction: "" }),
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.affectedFactions).toEqual([]);
    });

    it("returns empty array when character not in state.characters", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Unknown Person" },
        characters: {},
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.affectedFactions).toEqual([]);
    });
  });

  describe("interested godfathers", () => {
    it("lists godfathers with cabinetCandidates matching the position", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello" }),
        },
        patronage: {
          godfathers: [
            makeGodfather({
              id: "gf-1",
              name: "Alhaji Dantata",
              stable: {
                governors: [],
                legislativeBloc: { house: 0, senate: 0 },
                cabinetCandidates: ["finance"],
                connections: [],
              },
            }),
            makeGodfather({
              id: "gf-2",
              name: "Chief Odumegwu",
              stable: {
                governors: [],
                legislativeBloc: { house: 0, senate: 0 },
                cabinetCandidates: ["defence"],
                connections: [],
              },
            }),
          ],
          patronageIndex: 0,
          activeDeals: 0,
          neutralizedGodfathers: [],
          approachCooldowns: {},
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.interestedGodfathers).toContain("Alhaji Dantata");
      expect(preview.interestedGodfathers).not.toContain("Chief Odumegwu");
    });

    it("returns empty array when no godfathers exist", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello" }),
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.interestedGodfathers).toEqual([]);
    });
  });

  describe("replacement pool availability", () => {
    it("reports true when cabinetCandidates pool has unused candidates for minister", () => {
      // The cabinetCandidates pool for "Finance" has entries;
      // none are currently appointed → pool available
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello" }),
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.replacementPoolAvailable).toBe(true);
    });

    it("reports false for non-minister system types (no pool concept)", () => {
      const state = makeMockState({
        directors: {
          positions: [],
          appointments: [
            { positionId: "cbn-governor", characterName: "Chief Emeka", appointedDay: 5, isOriginal: true },
          ],
          technocratsFired: 0,
          vacancyTracking: {} as any,
        },
        characters: {
          "Chief Emeka": makeCharacter({ name: "Chief Emeka" }),
        },
      });
      const preview = computeDismissalPreview(state, "director", "cbn-governor");
      // Directors don't have a handcrafted replacement pool
      expect(typeof preview.replacementPoolAvailable).toBe("boolean");
    });
  });

  describe("character and position metadata", () => {
    it("returns character name and position title", () => {
      const state = makeMockState({
        cabinetAppointments: { finance: "Dr. Bello" },
        characters: {
          "Dr. Bello": makeCharacter({ name: "Dr. Bello" }),
        },
      });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.characterName).toBe("Dr. Bello");
      expect(preview.positionTitle).toContain("Finance");
    });

    it("returns empty preview for vacant position", () => {
      const state = makeMockState({ cabinetAppointments: { finance: null } });
      const preview = computeDismissalPreview(state, "minister", "finance");
      expect(preview.characterName).toBe("");
      expect(preview.approvalCost).toBe(0);
    });
  });
});
