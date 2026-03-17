import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { GameState, CharacterState, ActiveEvent } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import type { LifecycleEvent } from "./lifecycleTypes";
import {
  effectiveAge,
  processAging,
  ageCharacters,
  processLifecycle,
  checkCareerMobility,
} from "./lifecycleEngine";
import { LIFECYCLE_CHECK_INTERVAL, RETIREMENT_AGE_THRESHOLDS } from "./lifecycleTypes";

// ── Helpers ──

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 50, diplomacy: 60, security: 50, communications: 45,
      legal: 50, administration: 55, technology: 40, management: 50, politics: 50,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 55, leadership: 65, ambition: 50,
      integrity: 60, resilience: 60, intrigue: 30, discretion: 50,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Character",
    portfolio: overrides.portfolio ?? "Test Position",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Technocrats",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TC",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    age: overrides.age ?? 55,
    ...overrides,
  };
}

function makeTestState(overrides: {
  day?: number;
  characters?: Record<string, CharacterState>;
  diplomatAppts?: Array<{ postId: string; characterName: string; appointedDay?: number }>;
  militaryAppts?: Array<{ positionId: string; characterName: string; appointedDay?: number }>;
  directorAppts?: Array<{ positionId: string; characterName: string; appointedDay?: number }>;
  traditionalRulerAppts?: Array<{ positionId: string; characterName: string; appointedDay?: number }>;
  religiousLeaderAppts?: Array<{ positionId: string; characterName: string; appointedDay?: number }>;
} = {}): GameState {
  return {
    day: overrides.day ?? 30,
    characters: overrides.characters ?? { "Test Character": makeCharacter() },
    diplomats: {
      posts: [],
      appointments: (overrides.diplomatAppts ?? []).map(a => ({
        ...a,
        appointedDay: a.appointedDay ?? 0,
        rotationDueDay: 1095,
        vacantSinceDay: null,
      })),
      incidents: [],
      diplomaticEffectiveness: 50,
    },
    military: {
      positions: [],
      appointments: (overrides.militaryAppts ?? []).map(a => ({
        ...a,
        appointedDay: a.appointedDay ?? 0,
      })),
    },
    directors: {
      positions: [],
      appointments: (overrides.directorAppts ?? []).map(a => ({
        ...a,
        appointedDay: a.appointedDay ?? 0,
      })),
    },
    traditionalRulers: {
      positions: [],
      appointments: (overrides.traditionalRulerAppts ?? []).map(a => ({
        ...a,
        appointedDay: a.appointedDay ?? 0,
      })),
      royalCouncilSupport: 50,
    },
    religiousLeaders: {
      positions: [],
      appointments: (overrides.religiousLeaderAppts ?? []).map(a => ({
        ...a,
        appointedDay: a.appointedDay ?? 0,
      })),
      interfaithHarmony: 50,
    },
    activeEvents: [],
    inbox: [],
  } as unknown as GameState;
}

// ── effectiveAge ──

describe("effectiveAge", () => {
  it("returns base age when no time has passed", () => {
    expect(effectiveAge(55, 0, 0)).toBe(55);
  });

  it("increments age after 365 days", () => {
    expect(effectiveAge(55, 0, 365)).toBe(56);
  });

  it("does not increment before 365 days", () => {
    expect(effectiveAge(55, 0, 364)).toBe(55);
  });

  it("increments twice after 730 days", () => {
    expect(effectiveAge(55, 0, 730)).toBe(57);
  });

  it("accounts for appointment day offset", () => {
    expect(effectiveAge(55, 100, 465)).toBe(56); // 365 days since appointment
    expect(effectiveAge(55, 100, 464)).toBe(55); // 364 days since appointment
  });
});

// ── processAging ──

describe("processAging", () => {
  it("returns empty array when day is not yearly boundary", () => {
    const state = makeTestState({ day: 100 });
    expect(processAging(state)).toEqual([]);
  });

  it("returns character names on yearly boundary", () => {
    const state = makeTestState({
      day: 365,
      characters: {
        "Alice": makeCharacter({ name: "Alice", age: 50 }),
        "Bob": makeCharacter({ name: "Bob", age: 60 }),
      },
    });
    const result = processAging(state);
    expect(result).toContain("Alice");
    expect(result).toContain("Bob");
    expect(result).toHaveLength(2);
  });

  it("skips characters without age", () => {
    const state = makeTestState({
      day: 365,
      characters: {
        "WithAge": makeCharacter({ name: "WithAge", age: 50 }),
        "NoAge": makeCharacter({ name: "NoAge", age: undefined }),
      },
    });
    const result = processAging(state);
    expect(result).toContain("WithAge");
    expect(result).not.toContain("NoAge");
  });
});

// ── ageCharacters ──

describe("ageCharacters", () => {
  it("increments age for all characters with age", () => {
    const chars: Record<string, CharacterState> = {
      "Alice": makeCharacter({ name: "Alice", age: 50 }),
      "Bob": makeCharacter({ name: "Bob", age: 60 }),
    };
    const result = ageCharacters(chars);
    expect(result.Alice.age).toBe(51);
    expect(result.Bob.age).toBe(61);
  });

  it("does not modify characters without age", () => {
    const chars: Record<string, CharacterState> = {
      "NoAge": makeCharacter({ name: "NoAge", age: undefined }),
    };
    const result = ageCharacters(chars);
    expect(result.NoAge.age).toBeUndefined();
  });

  it("does not mutate original objects", () => {
    const chars: Record<string, CharacterState> = {
      "Alice": makeCharacter({ name: "Alice", age: 50 }),
    };
    const result = ageCharacters(chars);
    expect(chars.Alice.age).toBe(50);
    expect(result.Alice.age).toBe(51);
  });
});

// ── processLifecycle — no-op on non-check days ──

describe("processLifecycle timing", () => {
  it("returns empty result on non-check days", () => {
    const state = makeTestState({ day: 15 }); // Not divisible by 30
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    expect(result.exits).toHaveLength(0);
    expect(result.transitions).toHaveLength(0);
    expect(result.newEvents).toHaveLength(0);
  });

  it("processes on check interval days", () => {
    const state = makeTestState({
      day: LIFECYCLE_CHECK_INTERVAL,
      characters: { "Old General": makeCharacter({ name: "Old General", age: 63 }) },
      militaryAppts: [{ positionId: "chief-army-force", characterName: "Old General" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    // Should trigger military retirement (age 63 >= threshold 62)
    expect(result.exits.length).toBeGreaterThanOrEqual(1);
  });
});

// ── Retirement age checks ──

describe("processLifecycle — retirement age", () => {
  it("retires military character at age 62+", () => {
    const state = makeTestState({
      day: 30,
      characters: { "Old General": makeCharacter({ name: "Old General", age: 62 }) },
      militaryAppts: [{ positionId: "chief-army-force", characterName: "Old General" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    const milExit = result.exits.find(e => e.characterName === "Old General");
    expect(milExit).toBeDefined();
    expect(milExit!.reason).toBe("retirement-age");
  });

  it("does NOT retire young military character", () => {
    const state = makeTestState({
      day: 30,
      characters: { "Young General": makeCharacter({ name: "Young General", age: 55 }) },
      militaryAppts: [{ positionId: "chief-army-force", characterName: "Young General" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    const milExit = result.exits.find(e => e.characterName === "Young General" && e.reason === "retirement-age");
    expect(milExit).toBeUndefined();
  });

  it("retires director at age 65+", () => {
    const state = makeTestState({
      day: 30,
      characters: { "Old Director": makeCharacter({ name: "Old Director", age: 66 }) },
      directorAppts: [{ positionId: "dir-finance-budget", characterName: "Old Director" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    const dirExit = result.exits.find(e => e.characterName === "Old Director");
    expect(dirExit).toBeDefined();
    expect(dirExit!.reason).toBe("retirement-age");
  });

  it("retires diplomat at age 65+", () => {
    const state = makeTestState({
      day: 30,
      characters: { "Old Diplomat": makeCharacter({ name: "Old Diplomat", age: 66 }) },
      diplomatAppts: [{ postId: "amb-usa", characterName: "Old Diplomat" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    const dipExit = result.exits.find(e => e.characterName === "Old Diplomat");
    expect(dipExit).toBeDefined();
    expect(dipExit!.reason).toBe("retirement-age");
  });
});

// ── Health crisis events ──

describe("processLifecycle — health crisis", () => {
  it("generates health events for very old characters over many iterations", () => {
    let foundHealthEvent = false;
    for (let seed = 0; seed < 5000; seed++) {
      const state = makeTestState({
        day: 30,
        characters: { "Elder": makeCharacter({ name: "Elder", age: 82 }) },
        traditionalRulerAppts: [{ positionId: "sultan-sokoto", characterName: "Elder" }],
      });
      const rng = seededRandom(seed);
      const result = processLifecycle(state, rng);
      const healthExit = result.exits.find(
        e => e.reason === "health-crisis" || e.reason === "death",
      );
      if (healthExit) {
        foundHealthEvent = true;
        break;
      }
    }
    expect(foundHealthEvent).toBe(true);
  });

  it("does NOT generate health events for young characters", () => {
    let foundHealthEvent = false;
    for (let seed = 0; seed < 200; seed++) {
      const state = makeTestState({
        day: 30,
        characters: { "Young": makeCharacter({ name: "Young", age: 45 }) },
        traditionalRulerAppts: [{ positionId: "sultan-sokoto", characterName: "Young" }],
      });
      const rng = seededRandom(seed);
      const result = processLifecycle(state, rng);
      const healthExit = result.exits.find(
        e => e.reason === "health-crisis" || e.reason === "death",
      );
      if (healthExit) foundHealthEvent = true;
    }
    expect(foundHealthEvent).toBe(false);
  });
});

// ── Voluntary retirement ──

describe("processLifecycle — voluntary retirement", () => {
  it("can trigger voluntary retirement for low-ambition, high-integrity elderly characters", () => {
    let foundRetirement = false;
    for (let seed = 0; seed < 1000; seed++) {
      const state = makeTestState({
        day: 30,
        characters: {
          "Humble Senior": makeCharacter({
            name: "Humble Senior",
            age: 63,
            competencies: makeCompetencies({
              personal: { ambition: 20, integrity: 90 },
            }),
          }),
        },
        directorAppts: [{ positionId: "dir-health", characterName: "Humble Senior" }],
      });
      const rng = seededRandom(seed);
      const result = processLifecycle(state, rng);
      const retExit = result.exits.find(e => e.reason === "voluntary-retirement");
      if (retExit) {
        foundRetirement = true;
        break;
      }
    }
    expect(foundRetirement).toBe(true);
  });

  it("does NOT trigger voluntary retirement for traditional rulers", () => {
    let foundRetirement = false;
    for (let seed = 0; seed < 500; seed++) {
      const state = makeTestState({
        day: 30,
        characters: {
          "Old Ruler": makeCharacter({
            name: "Old Ruler",
            age: 75,
            competencies: makeCompetencies({ personal: { ambition: 10 } }),
          }),
        },
        traditionalRulerAppts: [{ positionId: "sultan-sokoto", characterName: "Old Ruler" }],
      });
      const rng = seededRandom(seed);
      const result = processLifecycle(state, rng);
      const retExit = result.exits.find(e => e.reason === "voluntary-retirement");
      if (retExit) foundRetirement = true;
    }
    expect(foundRetirement).toBe(false);
  });
});

// ── Career mobility ──

describe("checkCareerMobility", () => {
  it("returns null for death exits", () => {
    const exit: LifecycleEvent = {
      characterName: "Dead", system: "military", positionId: "chief-army-force",
      reason: "death", day: 100,
    };
    const rng = seededRandom(42);
    expect(checkCareerMobility(exit, makeCharacter({ age: 55 }), rng)).toBeNull();
  });

  it("returns null for scandal exits", () => {
    const exit: LifecycleEvent = {
      characterName: "Disgraced", system: "military", positionId: "chief-army-force",
      reason: "scandal", day: 100,
    };
    const rng = seededRandom(42);
    expect(checkCareerMobility(exit, makeCharacter({ age: 55 }), rng)).toBeNull();
  });

  it("returns null for very old characters", () => {
    const exit: LifecycleEvent = {
      characterName: "Old", system: "military", positionId: "chief-army-force",
      reason: "retirement-age", day: 100,
    };
    const rng = seededRandom(42);
    expect(checkCareerMobility(exit, makeCharacter({ age: 75 }), rng)).toBeNull();
  });

  it("returns null for low-ambition characters", () => {
    const exit: LifecycleEvent = {
      characterName: "Humble", system: "military", positionId: "chief-army-force",
      reason: "voluntary-retirement", day: 100,
    };
    const char = makeCharacter({
      age: 55,
      competencies: makeCompetencies({ personal: { ambition: 20 } }),
    });
    const rng = seededRandom(42);
    expect(checkCareerMobility(exit, char, rng)).toBeNull();
  });

  it("can produce career transition for ambitious military retiree", () => {
    let foundTransition = false;
    for (let seed = 0; seed < 5000; seed++) {
      const exit: LifecycleEvent = {
        characterName: "Ambitious General", system: "military",
        positionId: "chief-army-force", reason: "retirement-age", day: 100,
      };
      const char = makeCharacter({
        name: "Ambitious General",
        age: 58,
        competencies: makeCompetencies({ personal: { ambition: 85 } }),
      });
      const rng = seededRandom(seed);
      const transition = checkCareerMobility(exit, char, rng);
      if (transition) {
        foundTransition = true;
        expect(transition.fromSystem).toBe("military");
        expect(["godfathers", "cabinet"]).toContain(transition.toSystem);
        break;
      }
    }
    expect(foundTransition).toBe(true);
  });
});

// ── Event/inbox generation ──

describe("processLifecycle — event generation", () => {
  it("generates events for non-director exits", () => {
    const state = makeTestState({
      day: 30,
      characters: { "Old General": makeCharacter({ name: "Old General", age: 63 }) },
      militaryAppts: [{ positionId: "chief-army-force", characterName: "Old General" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    expect(result.newEvents.length).toBeGreaterThanOrEqual(1);
    expect(result.newEvents[0].choices.length).toBeGreaterThanOrEqual(2);
  });

  it("generates inbox messages for all exits", () => {
    const state = makeTestState({
      day: 30,
      characters: { "Old General": makeCharacter({ name: "Old General", age: 63 }) },
      militaryAppts: [{ positionId: "chief-army-force", characterName: "Old General" }],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    expect(result.inboxMessages.length).toBeGreaterThanOrEqual(1);
    expect(result.inboxMessages[0].subject).toContain("Old General");
  });

  it("generates stability consequence for 3+ simultaneous exits", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Gen A": makeCharacter({ name: "Gen A", age: 63 }),
        "Gen B": makeCharacter({ name: "Gen B", age: 64 }),
        "Gen C": makeCharacter({ name: "Gen C", age: 65 }),
      },
      militaryAppts: [
        { positionId: "chief-army-force", characterName: "Gen A" },
        { positionId: "chief-naval-force", characterName: "Gen B" },
        { positionId: "chief-air-force", characterName: "Gen C" },
      ],
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    expect(result.exits.length).toBeGreaterThanOrEqual(3);
    expect(result.consequences.some(c => c.id.startsWith("mass-departure"))).toBe(true);
  });
});

// ── Yearly aging integration ──

describe("processLifecycle — yearly aging", () => {
  it("returns aged characters on day 365", () => {
    const state = makeTestState({
      day: 365,
      characters: {
        "Alice": makeCharacter({ name: "Alice", age: 50 }),
      },
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    expect(result.agedCharacters).toContain("Alice");
  });

  it("does NOT return aged characters on non-yearly days", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Alice": makeCharacter({ name: "Alice", age: 50 }),
      },
    });
    const rng = seededRandom(42);
    const result = processLifecycle(state, rng);
    expect(result.agedCharacters).toHaveLength(0);
  });
});
