// client/src/lib/godfatherEngine.test.ts
import { describe, it, expect } from "vitest";
import type { Godfather, PatronageState } from "./godfatherTypes";
import type { GameState } from "./gameTypes";
import {
  advanceEscalation,
  checkTriggerWindows,
  processGodfatherTurn,
  neutralizeGodfather,
  defaultPatronageState,
} from "./godfatherEngine";

// ── Helpers ──────────────────────────────────────────────────────────

function makeGodfather(overrides: Partial<Godfather> = {}): Godfather {
  return {
    id: "gf-test",
    name: "Test Godfather",
    archetype: "business-oligarch",
    zone: "NC",
    description: "A test godfather",
    traits: { aggression: 50, loyalty: 50, greed: 50, visibility: 50 },
    disposition: "neutral",
    dealStyle: "contract",
    interests: [],
    stable: {
      governors: [],
      legislativeBloc: { house: 0, senate: 0 },
      cabinetCandidates: [],
      connections: [],
    },
    escalationStage: 0,
    favourDebt: 0,
    activeContracts: [],
    neutralized: false,
    influenceScore: 50,
    ...overrides,
  };
}

function mockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 100,
    approval: 50,
    stability: 50,
    politicalCapital: 60,
    partyLoyalty: 70,
    legislature: {
      activeBills: [],
      senateMajority: "ruling",
      houseMajority: "ruling",
      sessionActive: true,
      billsPassed: 0,
      billsBlocked: 0,
    },
    ...overrides,
  } as any;
}

function makePatronageState(overrides: Partial<PatronageState> = {}): PatronageState {
  return {
    godfathers: [makeGodfather()],
    patronageIndex: 0,
    activeDeals: 0,
    neutralizedGodfathers: [],
    approachCooldowns: {},
    ...overrides,
  };
}

// ── advanceEscalation ────────────────────────────────────────────────

describe("advanceEscalation", () => {
  it("advances stage from 0 to 1", () => {
    const gf = makeGodfather({ escalationStage: 0 });
    const result = advanceEscalation(gf);
    expect(result.escalationStage).toBe(1);
  });

  it("advances stage from 2 to 3", () => {
    const gf = makeGodfather({ escalationStage: 2 });
    const result = advanceEscalation(gf);
    expect(result.escalationStage).toBe(3);
  });

  it("caps at stage 4", () => {
    const gf = makeGodfather({ escalationStage: 4 });
    const result = advanceEscalation(gf);
    expect(result.escalationStage).toBe(4);
  });

  it("does not mutate the original godfather", () => {
    const gf = makeGodfather({ escalationStage: 1 });
    advanceEscalation(gf);
    expect(gf.escalationStage).toBe(1);
  });

  it("preserves other godfather fields", () => {
    const gf = makeGodfather({
      escalationStage: 0,
      traits: { aggression: 90, loyalty: 20, greed: 80, visibility: 60 },
    });
    const result = advanceEscalation(gf);
    expect(result.traits.aggression).toBe(90);
    expect(result.name).toBe("Test Godfather");
  });
});

// ── checkTriggerWindows ──────────────────────────────────────────────

describe("checkTriggerWindows", () => {
  it("returns empty array when no triggers active", () => {
    const state = mockGameState();
    const triggers = checkTriggerWindows(state);
    expect(triggers).toEqual([]);
  });

  it("detects budget-season when economy bill with critical stakes is active", () => {
    const state = mockGameState({
      legislature: {
        activeBills: [
          {
            id: "bill-1",
            title: "Budget Bill",
            description: "Annual budget",
            subjectTag: "economy",
            stakes: "critical",
            sponsor: "executive",
            houseStage: "first-reading",
            senateStage: "none",
            houseSupport: { yes: 0, no: 0, undecided: 0 },
            senateSupport: { yes: 0, no: 0, undecided: 0 },
            leversBought: [],
            introducedDay: 1,
            passedHouse: false,
            passedSenate: false,
            signed: false,
            vetoed: false,
            dead: false,
            effects: [],
          },
        ],
        senateMajority: "ruling",
        houseMajority: "ruling",
        sessionActive: true,
        billsPassed: 0,
        billsBlocked: 0,
      },
    } as any);
    const triggers = checkTriggerWindows(state);
    expect(triggers).toContain("budget-season");
  });

  it("does not detect budget-season for economy bill with routine stakes", () => {
    const state = mockGameState({
      legislature: {
        activeBills: [
          {
            id: "bill-1",
            subjectTag: "economy",
            stakes: "routine",
          },
        ],
      },
    } as any);
    const triggers = checkTriggerWindows(state);
    expect(triggers).not.toContain("budget-season");
  });

  it("detects election-approach when day > 900", () => {
    const state = mockGameState({ day: 950 });
    const triggers = checkTriggerWindows(state);
    expect(triggers).toContain("election-approach");
  });

  it("does not detect election-approach when day <= 900", () => {
    const state = mockGameState({ day: 900 });
    const triggers = checkTriggerWindows(state);
    expect(triggers).not.toContain("election-approach");
  });

  it("detects low-approval when approval < 35", () => {
    const state = mockGameState({ approval: 30 });
    const triggers = checkTriggerWindows(state);
    expect(triggers).toContain("low-approval");
  });

  it("detects low-stability when stability < 30", () => {
    const state = mockGameState({ stability: 25 });
    const triggers = checkTriggerWindows(state);
    expect(triggers).toContain("low-stability");
  });

  it("detects impeachment-threat when approval < 20 and stability < 25", () => {
    const state = mockGameState({ approval: 15, stability: 20 });
    const triggers = checkTriggerWindows(state);
    expect(triggers).toContain("impeachment-threat");
    // Should also include the individual triggers
    expect(triggers).toContain("low-approval");
    expect(triggers).toContain("low-stability");
  });

  it("does not detect impeachment-threat when only approval is low", () => {
    const state = mockGameState({ approval: 15, stability: 50 });
    const triggers = checkTriggerWindows(state);
    expect(triggers).not.toContain("impeachment-threat");
  });
});

// ── processGodfatherTurn ─────────────────────────────────────────────

describe("processGodfatherTurn", () => {
  it("returns correct structure", () => {
    const state = mockGameState();
    const patronage = makePatronageState();
    const result = processGodfatherTurn(state, patronage);
    expect(result).toHaveProperty("patronageState");
    expect(result).toHaveProperty("approaches");
    expect(result).toHaveProperty("events");
    expect(Array.isArray(result.approaches)).toBe(true);
    expect(Array.isArray(result.events)).toBe(true);
  });

  it("generates approach when cooldown has expired", () => {
    const state = mockGameState({ day: 100 });
    const patronage = makePatronageState({
      approachCooldowns: { "gf-test": 50 }, // last approach day 50, cooldown 30 = eligible at 80
    });
    const result = processGodfatherTurn(state, patronage);
    expect(result.approaches.length).toBeGreaterThanOrEqual(1);
  });

  it("does not generate approach when cooldown active", () => {
    const state = mockGameState({ day: 100 });
    const patronage = makePatronageState({
      approachCooldowns: { "gf-test": 95 }, // last approach day 95, cooldown 30 = eligible at 125
    });
    const result = processGodfatherTurn(state, patronage);
    expect(result.approaches.length).toBe(0);
  });

  it("skips neutralized godfathers", () => {
    const gf = makeGodfather({ neutralized: true });
    const state = mockGameState({ day: 100 });
    const patronage = makePatronageState({
      godfathers: [gf],
      approachCooldowns: {},
    });
    const result = processGodfatherTurn(state, patronage);
    expect(result.approaches.length).toBe(0);
  });

  it("generates approach for godfather with no prior cooldown entry", () => {
    const state = mockGameState({ day: 100 });
    const patronage = makePatronageState({
      approachCooldowns: {}, // no entry means never approached, should be eligible
    });
    const result = processGodfatherTurn(state, patronage);
    expect(result.approaches.length).toBeGreaterThanOrEqual(1);
  });

  it("uses reduced cooldown (15 days) during trigger windows", () => {
    const state = mockGameState({ day: 100, approval: 30 }); // low-approval trigger
    const patronage = makePatronageState({
      approachCooldowns: { "gf-test": 82 }, // 18 days ago — would fail 30-day cooldown but pass 15-day
    });
    const result = processGodfatherTurn(state, patronage);
    expect(result.approaches.length).toBeGreaterThanOrEqual(1);
  });

  it("updates cooldown after generating approach", () => {
    const state = mockGameState({ day: 100 });
    const patronage = makePatronageState({
      approachCooldowns: {},
    });
    const result = processGodfatherTurn(state, patronage);
    expect(result.patronageState.approachCooldowns["gf-test"]).toBe(100);
  });
});

// ── neutralizeGodfather ──────────────────────────────────────────────

describe("neutralizeGodfather", () => {
  it("sets godfather as neutralized", () => {
    const patronage = makePatronageState();
    const result = neutralizeGodfather(patronage, "gf-test", "intelligence");
    const gf = result.godfathers.find((g) => g.id === "gf-test");
    expect(gf?.neutralized).toBe(true);
  });

  it("adds to neutralizedGodfathers list", () => {
    const patronage = makePatronageState();
    const result = neutralizeGodfather(patronage, "gf-test", "political");
    expect(result.neutralizedGodfathers).toContain("gf-test");
  });

  it("reduces patronageIndex by 10", () => {
    const patronage = makePatronageState({ patronageIndex: 25 });
    const result = neutralizeGodfather(patronage, "gf-test", "godfather-vs-godfather");
    expect(result.patronageIndex).toBe(15);
  });

  it("does not reduce patronageIndex below 0", () => {
    const patronage = makePatronageState({ patronageIndex: 5 });
    const result = neutralizeGodfather(patronage, "gf-test", "intelligence");
    expect(result.patronageIndex).toBe(0);
  });

  it("does not mutate original state", () => {
    const patronage = makePatronageState({ patronageIndex: 20 });
    neutralizeGodfather(patronage, "gf-test", "intelligence");
    expect(patronage.patronageIndex).toBe(20);
    expect(patronage.godfathers[0].neutralized).toBe(false);
  });
});

// ── defaultPatronageState ────────────────────────────────────────────

describe("defaultPatronageState", () => {
  it("initializes with all 24 godfather profiles", () => {
    const state = defaultPatronageState();
    expect(state.godfathers.length).toBe(24);
  });

  it("starts with patronageIndex at 0", () => {
    const state = defaultPatronageState();
    expect(state.patronageIndex).toBe(0);
  });

  it("starts with 0 activeDeals", () => {
    const state = defaultPatronageState();
    expect(state.activeDeals).toBe(0);
  });

  it("starts with empty neutralizedGodfathers", () => {
    const state = defaultPatronageState();
    expect(state.neutralizedGodfathers).toEqual([]);
  });

  it("starts with empty approachCooldowns", () => {
    const state = defaultPatronageState();
    expect(state.approachCooldowns).toEqual({});
  });
});
