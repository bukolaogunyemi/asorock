import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { GameState, CharacterState } from "./gameTypes";
import type { GovernorSystemState } from "./governorTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  seedGovernorSystem,
  processGovernorCooperation,
  electGovernorsForumChair,
  processGovernors,
} from "./governorEngine";
import { GOVERNABLE_STATES } from "./governorPool";

// ── Helpers ──

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

function makeState(overrides: {
  day?: number;
  approval?: number;
  stability?: number;
  characters?: Record<string, CharacterState>;
  governorSystem?: Partial<GovernorSystemState>;
  presidentParty?: string;
  partyInternals?: any;
} = {}): GameState {
  const govSys = makeGovernorSystem(overrides.governorSystem);
  const chars: Record<string, CharacterState> = overrides.characters ?? {};

  // Auto-create characters for governors if not provided
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
    approval: overrides.approval ?? 50,
    stability: overrides.stability ?? 50,
    presidentParty: overrides.presidentParty ?? "ADU",
    partyInternals: overrides.partyInternals ?? { rulingPartyId: "ADU" },
    characters: chars,
    governorSystem: govSys,
    activeEvents: [],
    macroEconomy: { inflation: 15, fxRate: 750, reserves: 35, debtToGdp: 38, oilOutput: 1.8, subsidyPressure: 50 },
  } as unknown as GameState;
}

// ── Tests: seedGovernorSystem ──

describe("seedGovernorSystem", () => {
  it("creates exactly 36 governor appointments", () => {
    const { state } = seedGovernorSystem(12345);
    expect(state.governors).toHaveLength(36);
  });

  it("assigns all 36 different states", () => {
    const { state } = seedGovernorSystem(12345);
    const states = state.governors.map(g => g.state);
    const unique = new Set(states);
    expect(unique.size).toBe(36);
  });

  it("covers all GOVERNABLE_STATES", () => {
    const { state } = seedGovernorSystem(12345);
    const govStates = new Set(state.governors.map(g => g.state));
    for (const s of GOVERNABLE_STATES) {
      expect(govStates.has(s)).toBe(true);
    }
  });

  it("creates a CharacterState for each governor", () => {
    const { state, characters } = seedGovernorSystem(12345);
    for (const gov of state.governors) {
      expect(characters[gov.characterName]).toBeDefined();
      expect(characters[gov.characterName].name).toBe(gov.characterName);
    }
  });

  it("character portfolios are Governor of {state}", () => {
    const { state, characters } = seedGovernorSystem(12345);
    for (const gov of state.governors) {
      expect(characters[gov.characterName].portfolio).toBe(`Governor of ${gov.state}`);
    }
  });

  it("all governors start with cooperation 50", () => {
    const { state } = seedGovernorSystem(12345);
    for (const gov of state.governors) {
      expect(gov.cooperation).toBe(50);
    }
  });

  it("sets nextElectionDay to 1461", () => {
    const { state } = seedGovernorSystem(12345);
    expect(state.nextElectionDay).toBe(1461);
  });

  it("forum chair starts as null", () => {
    const { state } = seedGovernorSystem(12345);
    expect(state.forumChair).toBeNull();
    expect(state.forumChairElectedDay).toBeNull();
  });

  it("produces deterministic results for the same seed", () => {
    const r1 = seedGovernorSystem(99999);
    const r2 = seedGovernorSystem(99999);
    expect(r1.state.governors.map(g => g.characterName)).toEqual(
      r2.state.governors.map(g => g.characterName),
    );
  });

  it("produces different results for different seeds", () => {
    const r1 = seedGovernorSystem(11111);
    const r2 = seedGovernorSystem(22222);
    const names1 = r1.state.governors.map(g => g.characterName);
    const names2 = r2.state.governors.map(g => g.characterName);
    const allSame = names1.every((n, i) => n === names2[i]);
    expect(allSame).toBe(false);
  });

  it("no duplicate character names across governors", () => {
    const { state } = seedGovernorSystem(12345);
    const names = state.governors.map(g => g.characterName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("each governor has a valid party string", () => {
    const { state } = seedGovernorSystem(12345);
    for (const gov of state.governors) {
      expect(gov.party).toBeTruthy();
      expect(typeof gov.party).toBe("string");
    }
  });
});

// ── Tests: processGovernorCooperation ──

describe("processGovernorCooperation", () => {
  it("same-party governors drift cooperation upward", () => {
    const state = makeState({
      approval: 50,
      governorSystem: {
        governors: [
          { state: "Lagos", characterName: "Gov Same", party: "ADU", electedDay: 0, term: 1, cooperation: 50 },
        ],
      },
    });

    // Run many times and check average drift is positive
    let totalDrift = 0;
    for (let seed = 0; seed < 100; seed++) {
      const result = processGovernorCooperation(state, seededRandom(seed));
      totalDrift += result.updatedGovernors[0].cooperation - 50;
    }
    expect(totalDrift / 100).toBeGreaterThan(0);
  });

  it("different-party governors drift cooperation downward", () => {
    const state = makeState({
      approval: 50,
      governorSystem: {
        governors: [
          { state: "Lagos", characterName: "Gov Diff", party: "PFC", electedDay: 0, term: 1, cooperation: 50 },
        ],
      },
    });

    let totalDrift = 0;
    for (let seed = 0; seed < 100; seed++) {
      const result = processGovernorCooperation(state, seededRandom(seed));
      totalDrift += result.updatedGovernors[0].cooperation - 50;
    }
    expect(totalDrift / 100).toBeLessThan(0);
  });

  it("high presidential approval boosts all governor cooperation", () => {
    const highApproval = makeState({
      approval: 75,
      governorSystem: {
        governors: [
          { state: "Lagos", characterName: "Gov X", party: "PFC", electedDay: 0, term: 1, cooperation: 50 },
        ],
      },
    });
    const lowApproval = makeState({
      approval: 30,
      governorSystem: {
        governors: [
          { state: "Lagos", characterName: "Gov X", party: "PFC", electedDay: 0, term: 1, cooperation: 50 },
        ],
      },
    });

    const rng = seededRandom(42);
    const highResult = processGovernorCooperation(highApproval, rng);
    const rng2 = seededRandom(42);
    const lowResult = processGovernorCooperation(lowApproval, rng2);

    expect(highResult.updatedGovernors[0].cooperation).toBeGreaterThan(
      lowResult.updatedGovernors[0].cooperation,
    );
  });

  it("cooperation is clamped to 0-100", () => {
    const state = makeState({
      approval: 90,
      governorSystem: {
        governors: [
          { state: "Lagos", characterName: "Gov Max", party: "ADU", electedDay: 0, term: 1, cooperation: 99.5 },
          { state: "Kano", characterName: "Gov Min", party: "PFC", electedDay: 0, term: 1, cooperation: 0.5 },
        ],
      },
    });

    for (let seed = 0; seed < 50; seed++) {
      const result = processGovernorCooperation(state, seededRandom(seed));
      for (const gov of result.updatedGovernors) {
        expect(gov.cooperation).toBeGreaterThanOrEqual(0);
        expect(gov.cooperation).toBeLessThanOrEqual(100);
      }
    }
  });

  it("generates warning event when cooperation drops below 25", () => {
    const state = makeState({
      governorSystem: {
        governors: [
          { state: "Rivers", characterName: "Gov Rebel", party: "NDM", electedDay: 0, term: 1, cooperation: 20 },
        ],
      },
    });

    // cooperation 20 - 0.5 (diff party) + noise, likely stays below 25
    let warningFound = false;
    for (let seed = 0; seed < 100; seed++) {
      const result = processGovernorCooperation(state, seededRandom(seed));
      if (result.events.some(e => e.title.includes("becoming uncooperative"))) {
        warningFound = true;
        break;
      }
    }
    expect(warningFound).toBe(true);
  });

  it("generates critical event when cooperation drops below 10", () => {
    const state = makeState({
      approval: 20,
      governorSystem: {
        governors: [
          { state: "Rivers", characterName: "Gov Hostile", party: "NDM", electedDay: 0, term: 1, cooperation: 5 },
        ],
      },
    });

    let criticalFound = false;
    for (let seed = 0; seed < 100; seed++) {
      const result = processGovernorCooperation(state, seededRandom(seed));
      if (result.events.some(e => e.severity === "critical" && e.title.includes("openly hostile"))) {
        criticalFound = true;
        break;
      }
    }
    expect(criticalFound).toBe(true);
  });
});

// ── Tests: electGovernorsForumChair ──

describe("electGovernorsForumChair", () => {
  it("generates a forum chair election event", () => {
    const { state: govState, characters } = seedGovernorSystem(12345);
    const state = makeState({
      day: 28,
      characters,
      governorSystem: govState,
    });

    const event = electGovernorsForumChair(state, seededRandom(42));
    expect(event.title).toBe("Governors' Forum: Chairman Election");
    expect(event.category).toBe("politics");
    expect(event.source).toBe("contextual");
    expect(event.severity).toBe("info");
  });

  it("has exactly 3 choices (one per candidate)", () => {
    const { state: govState, characters } = seedGovernorSystem(12345);
    const state = makeState({
      day: 28,
      characters,
      governorSystem: govState,
    });

    const event = electGovernorsForumChair(state, seededRandom(42));
    expect(event.choices).toHaveLength(3);
  });

  it("each choice label includes Endorse, name, party, and state", () => {
    const { state: govState, characters } = seedGovernorSystem(12345);
    const state = makeState({
      day: 28,
      characters,
      governorSystem: govState,
    });

    const event = electGovernorsForumChair(state, seededRandom(42));
    for (const choice of event.choices) {
      expect(choice.label).toMatch(/^Endorse .+ \(.+, .+\)$/);
    }
  });

  it("choices have consequences with stability effect", () => {
    const { state: govState, characters } = seedGovernorSystem(12345);
    const state = makeState({
      day: 28,
      characters,
      governorSystem: govState,
    });

    const event = electGovernorsForumChair(state, seededRandom(42));
    for (const choice of event.choices) {
      expect(choice.consequences.length).toBeGreaterThan(0);
      const allEffects = choice.consequences.flatMap(c => c.effects);
      const hasStability = allEffects.some(e => e.target === "stability");
      expect(hasStability).toBe(true);
    }
  });
});

// ── Tests: processGovernors ──

describe("processGovernors", () => {
  it("returns correct shape with updatedGovernorSystem, newEvents, consequences", () => {
    const state = makeState();
    const result = processGovernors(state, seededRandom(42));

    expect(result.updatedGovernorSystem).toBeDefined();
    expect(result.updatedGovernorSystem.governors).toBeDefined();
    expect(Array.isArray(result.newEvents)).toBe(true);
    expect(Array.isArray(result.consequences)).toBe(true);
  });

  it("triggers forum chair election at day 28", () => {
    const { state: govState, characters } = seedGovernorSystem(12345);
    const state = makeState({
      day: 28,
      characters,
      governorSystem: govState,
    });

    const result = processGovernors(state, seededRandom(42));
    const chairEvent = result.newEvents.find(e => e.title === "Governors' Forum: Chairman Election");
    expect(chairEvent).toBeDefined();
  });

  it("does not trigger forum chair election on other days", () => {
    const state = makeState({ day: 30 });
    const result = processGovernors(state, seededRandom(42));
    const chairEvent = result.newEvents.find(e => e.title === "Governors' Forum: Chairman Election");
    expect(chairEvent).toBeUndefined();
  });

  it("does not trigger forum chair election if already elected", () => {
    const state = makeState({
      day: 28,
      governorSystem: {
        forumChair: "Some Governor",
        forumChairElectedDay: 14,
      },
    });
    const result = processGovernors(state, seededRandom(42));
    const chairEvent = result.newEvents.find(e => e.title === "Governors' Forum: Chairman Election");
    expect(chairEvent).toBeUndefined();
  });

  it("updates cooperation values each turn", () => {
    const state = makeState({
      governorSystem: {
        governors: [
          { state: "Lagos", characterName: "Gov A", party: "ADU", electedDay: 0, term: 1, cooperation: 50 },
          { state: "Kano", characterName: "Gov B", party: "PFC", electedDay: 0, term: 1, cooperation: 50 },
        ],
      },
    });

    const result = processGovernors(state, seededRandom(42));
    // Cooperation should have changed from initial values due to drift
    const govA = result.updatedGovernorSystem.governors.find(g => g.state === "Lagos");
    const govB = result.updatedGovernorSystem.governors.find(g => g.state === "Kano");
    expect(govA).toBeDefined();
    expect(govB).toBeDefined();
    // At least one should have changed
    const aChanged = govA!.cooperation !== 50;
    const bChanged = govB!.cooperation !== 50;
    expect(aChanged || bChanged).toBe(true);
  });

  it("preserves governorSystem fields like nextElectionDay", () => {
    const state = makeState({
      governorSystem: { nextElectionDay: 1461 },
    });
    const result = processGovernors(state, seededRandom(42));
    expect(result.updatedGovernorSystem.nextElectionDay).toBe(1461);
  });
});
