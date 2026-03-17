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
  getPatronageEffects,
  getGodfatherVoteModifier,
  generateNuclearEvent,
  checkGodfatherAppointment,
  checkGodfatherDismissal,
  processAllyAmplification,
} from "./godfatherEngine";
import { GODFATHER_PROFILES } from "./godfatherProfiles";

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

// ── patronageIndex ─────────────────────────────────────────────────

describe("patronageIndex", () => {
  it("should have no penalty in Clean tier (0-20)", () => {
    const effects = getPatronageEffects(15);
    expect(effects.tier).toBe("clean");
    expect(effects.approvalCeiling).toBeUndefined();
    expect(effects.scandalRisk).toBe(0);
    expect(effects.stabilityPenalty).toBe(0);
  });

  it("should have minor scandal risk in Pragmatic tier (21-45)", () => {
    const effects = getPatronageEffects(30);
    expect(effects.tier).toBe("pragmatic");
    expect(effects.approvalCeiling).toBeUndefined();
    expect(effects.scandalRisk).toBe(0.05);
  });

  it("should cap approval at 60 in Compromised tier (46-70)", () => {
    const effects = getPatronageEffects(55);
    expect(effects.tier).toBe("compromised");
    expect(effects.approvalCeiling).toBe(60);
    expect(effects.scandalRisk).toBe(0.15);
    expect(effects.stabilityPenalty).toBe(-1);
  });

  it("should cap approval at 50 in Captured tier (71-100)", () => {
    const effects = getPatronageEffects(80);
    expect(effects.tier).toBe("captured");
    expect(effects.approvalCeiling).toBe(50);
    expect(effects.scandalRisk).toBe(0.30);
    expect(effects.stabilityPenalty).toBe(-2);
  });

  it("should handle boundary values", () => {
    expect(getPatronageEffects(0).tier).toBe("clean");
    expect(getPatronageEffects(20).tier).toBe("clean");
    expect(getPatronageEffects(21).tier).toBe("pragmatic");
    expect(getPatronageEffects(45).tier).toBe("pragmatic");
    expect(getPatronageEffects(46).tier).toBe("compromised");
    expect(getPatronageEffects(70).tier).toBe("compromised");
    expect(getPatronageEffects(71).tier).toBe("captured");
    expect(getPatronageEffects(100).tier).toBe("captured");
  });
});

// ── legislative integration ──────────────────────────────────────────

describe("legislative integration", () => {
  it("should provide positive vote modifier from friendly godfather", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "friendly" as const };
    const modifier = getGodfatherVoteModifier(gf, gf.interests[0] || "economy");
    expect(modifier.house).toBeGreaterThan(0);
    expect(modifier.senate).toBeGreaterThanOrEqual(0);
  });

  it("hostile godfather should provide negative votes", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "hostile" as const };
    const modifier = getGodfatherVoteModifier(gf, gf.interests[0] || "economy");
    expect(modifier.house).toBeLessThan(0);
  });

  it("neutral godfather should provide zero votes", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "neutral" as const };
    const modifier = getGodfatherVoteModifier(gf, "economy");
    expect(modifier.house).toBe(0);
    expect(modifier.senate).toBe(0);
  });

  it("neutralized godfather should provide zero votes", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "friendly" as const, neutralized: true };
    const modifier = getGodfatherVoteModifier(gf, "economy");
    expect(modifier.house).toBe(0);
  });

  it("matching interest should amplify modifier", () => {
    const gf = { ...GODFATHER_PROFILES[0], disposition: "friendly" as const, interests: ["economy"] };
    const matching = getGodfatherVoteModifier(gf, "economy");
    const nonMatching = getGodfatherVoteModifier(gf, "security");
    expect(Math.abs(matching.house)).toBeGreaterThan(Math.abs(nonMatching.house));
  });
});

// ── nuclear events ──────────────────────────────────────────────────

describe("nuclear events", () => {
  it("should generate capital-flight for business-oligarch at stage 4", () => {
    const oligarch = { ...GODFATHER_PROFILES.find((g) => g.archetype === "business-oligarch")!, escalationStage: 4 as const };
    const event = generateNuclearEvent(oligarch);
    expect(event.type).toBe("capital-flight");
    expect(event.effects.length).toBeGreaterThan(0);
  });

  it("should generate coup-signals for military-elder", () => {
    const elder = { ...GODFATHER_PROFILES.find((g) => g.archetype === "military-elder")!, escalationStage: 4 as const };
    const event = generateNuclearEvent(elder);
    expect(event.type).toBe("coup-signals");
  });

  it("should generate party-split for party-boss", () => {
    const boss = { ...GODFATHER_PROFILES.find((g) => g.archetype === "party-boss")!, escalationStage: 4 as const };
    const event = generateNuclearEvent(boss);
    expect(event.type).toBe("party-split");
  });

  it("should generate general-strike for labour-civil", () => {
    const labour = { ...GODFATHER_PROFILES.find((g) => g.archetype === "labour-civil")!, escalationStage: 4 as const };
    const event = generateNuclearEvent(labour);
    expect(event.type).toBe("general-strike");
  });

  it("each event should have title, description, and effects", () => {
    for (const archetype of ["business-oligarch", "military-elder", "party-boss", "labour-civil", "religious-leader", "regional-strongman", "media-mogul"] as const) {
      const gf = { ...GODFATHER_PROFILES.find((g) => g.archetype === archetype)!, escalationStage: 4 as const };
      const event = generateNuclearEvent(gf);
      expect(event.title).toBeTruthy();
      expect(event.description).toBeTruthy();
      expect(event.effects.length).toBeGreaterThan(0);
    }
  });
});

// ── checkGodfatherAppointment ────────────────────────────────────────

describe("checkGodfatherAppointment", () => {
  it("reduces favourDebt by 1 when appointee zone matches godfather zone", () => {
    const gf = makeGodfather({
      zone: "NW",
      favourDebt: 3,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        militaryInterests: ["chief-army-staff"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = checkGodfatherAppointment(state, "chief-army-staff", "NW");
    expect(result.patronage!.godfathers[0].favourDebt).toBe(2);
  });

  it("increases escalation on zone mismatch when godfather has active escalation", () => {
    const gf = makeGodfather({
      zone: "NW",
      escalationStage: 2,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        diplomaticInterests: ["amb-saudi"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = checkGodfatherAppointment(state, "amb-saudi", "SW");
    expect(result.patronage!.godfathers[0].escalationStage).toBe(3);
  });

  it("does nothing for positions no godfather cares about", () => {
    const gf = makeGodfather({
      zone: "NW",
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        militaryInterests: ["chief-army-staff"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = checkGodfatherAppointment(state, "amb-brazil", "SW");
    expect(result.patronage).toBeUndefined();
  });

  it("does not escalate on zone mismatch when godfather has no active escalation", () => {
    const gf = makeGodfather({
      zone: "NW",
      escalationStage: 0,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        directorInterests: ["cbn-governor"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = checkGodfatherAppointment(state, "cbn-governor", "SE");
    // No change because escalation is 0
    expect(result.patronage).toBeUndefined();
  });

  it("handles cabinetCandidates interest", () => {
    const gf = makeGodfather({
      zone: "NC",
      favourDebt: 5,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: ["finance"],
        connections: [],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = checkGodfatherAppointment(state, "finance", "NC");
    expect(result.patronage!.godfathers[0].favourDebt).toBe(4);
  });
});

// ── checkGodfatherDismissal ──────────────────────────────────────────

describe("checkGodfatherDismissal", () => {
  it("generates pressure event when godfather has interest and disposition is Neutral", () => {
    const gf = makeGodfather({
      disposition: "neutral",
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        militaryInterests: ["chief-army-staff"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const events = checkGodfatherDismissal(state, "chief-army-staff");
    expect(events.length).toBe(1);
    expect(events[0].title).toContain("Test Godfather");
    expect(events[0].source).toBe("godfather-pressure");
  });

  it("does not fire when godfather disposition is friendly", () => {
    const gf = makeGodfather({
      disposition: "friendly",
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        militaryInterests: ["chief-army-staff"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const events = checkGodfatherDismissal(state, "chief-army-staff");
    expect(events.length).toBe(0);
  });

  it("event has Consult and Ignore choices", () => {
    const gf = makeGodfather({
      disposition: "hostile",
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        diplomaticInterests: ["amb-saudi"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const events = checkGodfatherDismissal(state, "amb-saudi");
    expect(events.length).toBe(1);
    const choices = events[0].choices;
    expect(choices.length).toBe(2);
    expect(choices[0].label).toBe("Consult");
    expect(choices[1].label).toBe("Ignore");
  });
});

// ── processAllyAmplification ────────────────────────────────────────

describe("processAllyAmplification", () => {
  it("generates sympathy event from ally when godfather at stage 3+", () => {
    const gf = makeGodfather({
      escalationStage: 3,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        traditionalRulerAllies: ["sultan-sokoto"],
        religiousLeaderAllies: ["pres-muslim-society"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    // RNG always returns 0 (below 0.4 threshold) — all allies fire
    const result = processAllyAmplification(state, () => 0);
    expect(result.events.length).toBe(2);
    expect(result.events[0].type).toBe("ally-sympathy");
    expect(result.events[0].allyId).toBe("sultan-sokoto");
    expect(result.events[1].allyId).toBe("pres-muslim-society");
  });

  it("does not trigger below stage 3", () => {
    const gf = makeGodfather({
      escalationStage: 2,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        traditionalRulerAllies: ["sultan-sokoto"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = processAllyAmplification(state, () => 0);
    expect(result.events.length).toBe(0);
  });

  it("fires at ~40% probability over many seeds", () => {
    const gf = makeGodfather({
      escalationStage: 4,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        traditionalRulerAllies: ["sultan-sokoto"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });

    let fires = 0;
    const trials = 500;
    for (let i = 0; i < trials; i++) {
      // Simple deterministic rng based on index
      const result = processAllyAmplification(state, () => i / trials);
      if (result.events.length > 0) fires++;
    }
    // Should fire ~40% of the time (200/500)
    // Allow some tolerance: between 35% and 45%
    expect(fires / trials).toBeGreaterThanOrEqual(0.35);
    expect(fires / trials).toBeLessThanOrEqual(0.45);
  });

  it("does not trigger for neutralized godfathers", () => {
    const gf = makeGodfather({
      escalationStage: 4,
      neutralized: true,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
        traditionalRulerAllies: ["sultan-sokoto"],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = processAllyAmplification(state, () => 0);
    expect(result.events.length).toBe(0);
  });

  it("handles godfather with no allies gracefully", () => {
    const gf = makeGodfather({
      escalationStage: 3,
      stable: {
        governors: [],
        legislativeBloc: { house: 0, senate: 0 },
        cabinetCandidates: [],
        connections: [],
      },
    });
    const state = mockGameState({
      patronage: makePatronageState({ godfathers: [gf] }),
    });
    const result = processAllyAmplification(state, () => 0);
    expect(result.events.length).toBe(0);
  });
});
