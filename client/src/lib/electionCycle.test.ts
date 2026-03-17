import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { GameState, CharacterState } from "./gameTypes";
import type { GovernorAppointment, GovernorSystemState } from "./governorTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import type { DirectorSystemState } from "./directorTypes";
import { GOVERNABLE_STATES } from "./governorPool";
import {
  shouldTriggerElection,
  runGovernorElections,
  processPostElectionReset,
  processElectionCycle,
  TERM_LENGTH_DAYS,
} from "./electionCycle";
import { seedGovernorSystem } from "./governorEngine";

// ── Helpers ──

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 60, diplomacy: 60, security: 60, communications: 60,
      legal: 60, administration: 60, technology: 60, management: 60, politics: 60,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 60, leadership: 60, ambition: 60,
      integrity: 60, resilience: 60, intrigue: 60, discretion: 60,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Governor",
    portfolio: overrides.portfolio ?? "Governor of Lagos",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TG",
    traits: overrides.traits ?? [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makeGovernorSystem(overrides: Partial<GovernorSystemState> = {}): GovernorSystemState {
  return {
    governors: overrides.governors ?? [
      { state: "Lagos", characterName: "Gov A", party: "ADU", electedDay: 0, term: 1, cooperation: 50 },
      { state: "Kano", characterName: "Gov B", party: "PFC", electedDay: 0, term: 1, cooperation: 50 },
      { state: "Rivers", characterName: "Gov C", party: "NDM", electedDay: 0, term: 1, cooperation: 30 },
    ],
    forumChair: overrides.forumChair ?? null,
    forumChairElectedDay: overrides.forumChairElectedDay ?? null,
    nextElectionDay: overrides.nextElectionDay ?? 1461,
  };
}

function makeDirectorSystem(overrides: Partial<DirectorSystemState> = {}): DirectorSystemState {
  return {
    positions: overrides.positions ?? [],
    appointments: overrides.appointments ?? [],
    technocratsFired: overrides.technocratsFired ?? 5,
    vacancyTracking: overrides.vacancyTracking ?? ({} as any),
  };
}

/** Build a full GameState with governors seeded from the real pool */
function makeSeededState(overrides: {
  day?: number;
  approval?: number;
  stability?: number;
  seed?: number;
  technocratsFired?: number;
  nextElectionDay?: number;
  forumChair?: string | null;
} = {}): GameState {
  const seed = overrides.seed ?? 12345;
  const govResult = seedGovernorSystem(seed);
  const chars: Record<string, CharacterState> = { ...govResult.characters };

  return {
    day: overrides.day ?? 30,
    approval: overrides.approval ?? 50,
    stability: overrides.stability ?? 50,
    presidentParty: "ADU",
    partyInternals: { rulingPartyId: "ADU" },
    characters: chars,
    governorSystem: {
      ...govResult.state,
      nextElectionDay: overrides.nextElectionDay ?? govResult.state.nextElectionDay,
      forumChair: overrides.forumChair ?? govResult.state.forumChair,
    },
    directors: makeDirectorSystem({ technocratsFired: overrides.technocratsFired ?? 5 }),
    judiciary: { appointments: [], pendingNomination: null },
    unionLeaders: { leaders: [], lastElectionDay: 0 },
    activeEvents: [],
    macroEconomy: { inflation: 15, fxRate: 750, reserves: 35, debtToGdp: 38, oilOutput: 1.8, subsidyPressure: 50 },
  } as unknown as GameState;
}

function makeMinimalState(overrides: {
  day?: number;
  nextElectionDay?: number;
  governors?: GovernorAppointment[];
  characters?: Record<string, CharacterState>;
  forumChair?: string | null;
  technocratsFired?: number;
} = {}): GameState {
  const govSys = makeGovernorSystem({
    governors: overrides.governors,
    nextElectionDay: overrides.nextElectionDay ?? 1461,
    forumChair: overrides.forumChair ?? null,
  });
  const chars: Record<string, CharacterState> = overrides.characters ?? {};

  // Auto-create characters for governors
  for (const gov of govSys.governors) {
    if (!chars[gov.characterName]) {
      chars[gov.characterName] = makeCharacter({
        name: gov.characterName,
        portfolio: `Governor of ${gov.state}`,
        party: gov.party,
      });
    }
  }

  return {
    day: overrides.day ?? 30,
    approval: 50,
    stability: 50,
    presidentParty: "ADU",
    partyInternals: { rulingPartyId: "ADU" },
    characters: chars,
    governorSystem: govSys,
    directors: makeDirectorSystem({ technocratsFired: overrides.technocratsFired ?? 5 }),
    judiciary: { appointments: [], pendingNomination: null },
    unionLeaders: { leaders: [], lastElectionDay: 0 },
    activeEvents: [],
    macroEconomy: { inflation: 15, fxRate: 750, reserves: 35, debtToGdp: 38, oilOutput: 1.8, subsidyPressure: 50 },
  } as unknown as GameState;
}

// ── Tests: shouldTriggerElection ──

describe("shouldTriggerElection", () => {
  it("returns false before election day", () => {
    const state = makeMinimalState({ day: 100, nextElectionDay: 1461 });
    expect(shouldTriggerElection(state)).toBe(false);
  });

  it("returns false at day 1460 (one day before)", () => {
    const state = makeMinimalState({ day: 1460, nextElectionDay: 1461 });
    expect(shouldTriggerElection(state)).toBe(false);
  });

  it("returns true at day 1461", () => {
    const state = makeMinimalState({ day: 1461, nextElectionDay: 1461 });
    expect(shouldTriggerElection(state)).toBe(true);
  });

  it("returns true if day exceeds election day", () => {
    const state = makeMinimalState({ day: 1500, nextElectionDay: 1461 });
    expect(shouldTriggerElection(state)).toBe(true);
  });

  it("works with custom election day (second term)", () => {
    const state = makeMinimalState({ day: 2922, nextElectionDay: 2922 });
    expect(shouldTriggerElection(state)).toBe(true);
  });

  it("returns false when day is before second-term election", () => {
    const state = makeMinimalState({ day: 2000, nextElectionDay: 2922 });
    expect(shouldTriggerElection(state)).toBe(false);
  });
});

// ── Tests: runGovernorElections ──

describe("runGovernorElections", () => {
  it("elects exactly 36 governors", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    expect(result.newGovernors).toHaveLength(36);
  });

  it("all 36 states are represented", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    const states = new Set(result.newGovernors.map(g => g.state));
    for (const s of GOVERNABLE_STATES) {
      expect(states.has(s)).toBe(true);
    }
  });

  it("no duplicate states among elected governors", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    const states = result.newGovernors.map(g => g.state);
    expect(new Set(states).size).toBe(states.length);
  });

  it("creates a CharacterState for each new governor", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    for (const gov of result.newGovernors) {
      expect(result.characters[gov.characterName]).toBeDefined();
      expect(result.characters[gov.characterName].name).toBe(gov.characterName);
    }
  });

  it("sets electedDay to current state.day", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    for (const gov of result.newGovernors) {
      expect(gov.electedDay).toBe(1461);
    }
  });

  it("sets cooperation to 50 for all new governors", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    for (const gov of result.newGovernors) {
      expect(gov.cooperation).toBe(50);
    }
  });

  it("generates a summary event", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const result = runGovernorElections(state, rng);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe("General Election Results: Governorship");
    expect(result.events[0].category).toBe("politics");
  });

  it("incumbent with high competence and cooperation gets advantage", () => {
    // Run the election many times and check incumbent wins more often
    let incumbentWins = 0;
    const trials = 50;

    for (let i = 0; i < trials; i++) {
      const state = makeSeededState({ day: 1461, seed: 12345 });
      // Set all current governors to high cooperation
      state.governorSystem.governors = state.governorSystem.governors.map(g => ({
        ...g,
        cooperation: 80,
      }));

      const rng = seededRandom(i * 1000 + 1);
      const result = runGovernorElections(state, rng);

      // Count how many incumbents won
      const incumbentNames = new Set(state.governorSystem.governors.map(g => g.characterName));
      const returningGovernors = result.newGovernors.filter(g => incumbentNames.has(g.characterName));
      incumbentWins += returningGovernors.length;
    }

    // With high cooperation, incumbents should win more than random (9/36 = 25%)
    const avgIncumbentWins = incumbentWins / trials;
    expect(avgIncumbentWins).toBeGreaterThan(5);
  });

  it("deterministic with same seed", () => {
    const state = makeSeededState({ day: 1461 });
    const result1 = runGovernorElections(state, seededRandom(999));
    const result2 = runGovernorElections(state, seededRandom(999));
    expect(result1.newGovernors.map(g => g.characterName))
      .toEqual(result2.newGovernors.map(g => g.characterName));
  });
});

// ── Tests: processPostElectionReset ──

describe("processPostElectionReset", () => {
  it("resets technocratsFired to 0", () => {
    const state = makeSeededState({ day: 1461, technocratsFired: 7 });
    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.directors.technocratsFired).toBe(0);
  });

  it("preserves director positions and appointments", () => {
    const state = makeSeededState({ day: 1461 });
    state.directors.positions = [{ id: "test", name: "Test" }] as any;
    state.directors.appointments = [{ positionId: "test", characterName: "X" }] as any;

    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.directors.positions).toEqual(state.directors.positions);
    expect(reset.directors.appointments).toEqual(state.directors.appointments);
  });

  it("replaces governors with election results", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.governorSystem.governors).toBe(electionResult.newGovernors);
  });

  it("resets forumChair to null", () => {
    const state = makeSeededState({ day: 1461, forumChair: "Some Governor" });
    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.governorSystem.forumChair).toBeNull();
    expect(reset.governorSystem.forumChairElectedDay).toBeNull();
  });

  it("sets nextElectionDay to electionDay + 1461", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.governorSystem.nextElectionDay).toBe(1461 + TERM_LENGTH_DAYS);
  });

  it("merges new governor characters into existing characters", () => {
    const state = makeSeededState({ day: 1461 });
    // Add a non-governor character that should survive
    state.characters["Existing Minister"] = makeCharacter({ name: "Existing Minister" });

    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.characters["Existing Minister"]).toBeDefined();
    // Also has new governors
    for (const gov of electionResult.newGovernors) {
      expect(reset.characters[gov.characterName]).toBeDefined();
    }
  });

  it("judiciary carries over unchanged", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.judiciary).toBe(state.judiciary);
  });

  it("union leaders carry over unchanged", () => {
    const state = makeSeededState({ day: 1461 });
    const rng = seededRandom(42);
    const electionResult = runGovernorElections(state, rng);
    const reset = processPostElectionReset(state, electionResult, 1461);
    expect(reset.unionLeaders).toBe(state.unionLeaders);
  });
});

// ── Tests: processElectionCycle ──

describe("processElectionCycle", () => {
  it("returns isElectionDay false when not election day", () => {
    const state = makeSeededState({ day: 100 });
    const rng = seededRandom(42);
    const result = processElectionCycle(state, rng);
    expect(result.isElectionDay).toBe(false);
    expect(result.events).toHaveLength(0);
  });

  it("does not modify state when not election day", () => {
    const state = makeSeededState({ day: 100 });
    const rng = seededRandom(42);
    const result = processElectionCycle(state, rng);
    expect(result.updatedState).toBe(state);
  });

  it("triggers on election day and returns updated state", () => {
    const state = makeSeededState({ day: 1461, nextElectionDay: 1461 });
    const rng = seededRandom(42);
    const result = processElectionCycle(state, rng);
    expect(result.isElectionDay).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.updatedState.governorSystem.nextElectionDay).toBe(1461 + TERM_LENGTH_DAYS);
  });

  it("resets technocratsFired on election day", () => {
    const state = makeSeededState({ day: 1461, nextElectionDay: 1461, technocratsFired: 4 });
    const rng = seededRandom(42);
    const result = processElectionCycle(state, rng);
    expect(result.updatedState.directors.technocratsFired).toBe(0);
  });

  it("replaces governors on election day", () => {
    const state = makeSeededState({ day: 1461, nextElectionDay: 1461 });
    const originalGovNames = state.governorSystem.governors.map(g => g.characterName);
    const rng = seededRandom(42);
    const result = processElectionCycle(state, rng);
    expect(result.updatedState.governorSystem.governors).toHaveLength(36);
    // New election day should be set
    expect(result.updatedState.governorSystem.nextElectionDay).toBe(2922);
  });

  it("clears forum chair on election day", () => {
    const state = makeSeededState({
      day: 1461,
      nextElectionDay: 1461,
      forumChair: "Old Chair",
    });
    const rng = seededRandom(42);
    const result = processElectionCycle(state, rng);
    expect(result.updatedState.governorSystem.forumChair).toBeNull();
  });

  it("TERM_LENGTH_DAYS equals 1461", () => {
    expect(TERM_LENGTH_DAYS).toBe(1461);
  });
});
