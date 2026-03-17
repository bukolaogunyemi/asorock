// client/src/lib/legislativeElections.test.ts
import { describe, it, expect } from "vitest";
import {
  generateLeadershipElectionEvent,
  generateSenateElections,
  generateHouseElections,
  fillPostElectionPositions,
  seedLegislature,
  processLegislatureLeadership,
} from "./legislativeElections";
import { defaultLegislativeState } from "./legislativeEngine";
import type { GameState } from "./gameTypes";

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeRng(seed = 42): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Minimal GameState stub with required fields for legislative elections */
function stubState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 1,
    legislature: defaultLegislativeState(),
    characters: {},
    activeEvents: [],
    presidentParty: "ADU",
    ...overrides,
  } as unknown as GameState;
}

// ── generateLeadershipElectionEvent ─────────────────────────────────────────

describe("generateLeadershipElectionEvent", () => {
  const candidates = [
    { name: "Sen. Alpha", party: "ADU", state: "Kano", bio: "A veteran senator." },
    { name: "Sen. Beta", party: "PFC", state: "Lagos", bio: "A rising star." },
    { name: "Sen. Gamma", party: "ADU", state: "Borno", bio: "A party loyalist." },
  ];

  it("generates an event with correct title for senate", () => {
    const event = generateLeadershipElectionEvent("senate", "Senate President", candidates, 14);
    expect(event.title).toBe("Senate: Senate President Election");
    expect(event.category).toBe("politics");
    expect(event.source).toBe("contextual");
    expect(event.severity).toBe("info");
  });

  it("generates an event with correct title for house", () => {
    const event = generateLeadershipElectionEvent("house", "Speaker of the House", candidates, 21);
    expect(event.title).toBe("House: Speaker of the House Election");
  });

  it("creates one choice per candidate", () => {
    const event = generateLeadershipElectionEvent("senate", "Senate President", candidates, 14);
    expect(event.choices).toHaveLength(3);
  });

  it("each choice has an endorsement label", () => {
    const event = generateLeadershipElectionEvent("senate", "Senate President", candidates, 14);
    expect(event.choices[0].label).toContain("Endorse Sen. Alpha");
    expect(event.choices[0].label).toContain("ADU");
    expect(event.choices[0].label).toContain("Kano");
  });

  it("each choice costs 2 political capital", () => {
    const event = generateLeadershipElectionEvent("senate", "Senate President", candidates, 14);
    for (const choice of event.choices) {
      const pcEffect = choice.consequences[0].effects.find((e) => e.target === "politicalCapital");
      expect(pcEffect).toBeDefined();
      expect(pcEffect!.delta).toBe(-2);
    }
  });

  it("sets createdDay from the day parameter", () => {
    const event = generateLeadershipElectionEvent("senate", "Senate President", candidates, 14);
    expect(event.createdDay).toBe(14);
  });

  it("generates unique IDs for each choice", () => {
    const event = generateLeadershipElectionEvent("senate", "Senate President", candidates, 14);
    const ids = event.choices.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── generateSenateElections ─────────────────────────────────────────────────

describe("generateSenateElections", () => {
  it("returns 2 events for Senate President and Deputy Senate President", () => {
    const state = stubState({ day: 14 });
    const events = generateSenateElections(state, makeRng());
    expect(events).toHaveLength(2);
    expect(events[0].title).toContain("Senate President");
    expect(events[1].title).toContain("Deputy Senate President");
  });

  it("each event has 4 candidates", () => {
    const state = stubState({ day: 14 });
    const events = generateSenateElections(state, makeRng());
    for (const event of events) {
      expect(event.choices).toHaveLength(4);
    }
  });

  it("Senate President candidates are from ruling/allied parties", () => {
    const state = stubState({ day: 14 });
    const events = generateSenateElections(state, makeRng());
    const spEvent = events[0];
    for (const choice of spEvent.choices) {
      // Label contains party abbreviation
      const hasAlliedParty = ["ADU", "TLA", "PAP"].some((p) => choice.label.includes(p));
      expect(hasAlliedParty).toBe(true);
    }
  });

  it("Deputy SP candidates come from different zones than SP candidates", () => {
    const state = stubState({ day: 14 });
    const events = generateSenateElections(state, makeRng());
    // The DSP candidates should exist and be different from SP candidates
    const spNames = events[0].choices.map((c) => c.label);
    const dspNames = events[1].choices.map((c) => c.label);
    // At least verify they are not the same set of names
    expect(spNames).not.toEqual(dspNames);
  });

  it("events have correct category and source", () => {
    const state = stubState({ day: 14 });
    const events = generateSenateElections(state, makeRng());
    for (const event of events) {
      expect(event.category).toBe("politics");
      expect(event.source).toBe("contextual");
    }
  });
});

// ── generateHouseElections ──────────────────────────────────────────────────

describe("generateHouseElections", () => {
  it("returns 2 events for Speaker and Deputy Speaker", () => {
    const state = stubState({ day: 21 });
    const events = generateHouseElections(state, makeRng());
    expect(events).toHaveLength(2);
    expect(events[0].title).toContain("Speaker of the House");
    expect(events[1].title).toContain("Deputy Speaker");
  });

  it("each event has 4 candidates", () => {
    const state = stubState({ day: 21 });
    const events = generateHouseElections(state, makeRng());
    for (const event of events) {
      expect(event.choices).toHaveLength(4);
    }
  });

  it("Speaker candidates are from ruling/allied parties", () => {
    const state = stubState({ day: 21 });
    const events = generateHouseElections(state, makeRng());
    const speakerEvent = events[0];
    for (const choice of speakerEvent.choices) {
      const hasAlliedParty = ["ADU", "TLA", "PAP"].some((p) => choice.label.includes(p));
      expect(hasAlliedParty).toBe(true);
    }
  });

  it("Deputy Speaker candidates differ from Speaker candidates", () => {
    const state = stubState({ day: 21 });
    const events = generateHouseElections(state, makeRng());
    const speakerNames = events[0].choices.map((c) => c.label);
    const dsNames = events[1].choices.map((c) => c.label);
    expect(speakerNames).not.toEqual(dsNames);
  });
});

// ── fillPostElectionPositions ───────────────────────────────────────────────

describe("fillPostElectionPositions", () => {
  it("fills 8 floor leader positions (4 senate + 4 house)", () => {
    const state = stubState({ day: 28 });
    const { leaders } = fillPostElectionPositions(state, makeRng());
    expect(leaders).toHaveLength(8);
  });

  it("senate leaders include Majority Leader, Minority Leader, Chief Whip, Minority Whip", () => {
    const state = stubState({ day: 28 });
    const { leaders } = fillPostElectionPositions(state, makeRng());
    const senatePositions = leaders
      .filter((l) => l.chamber === "senate")
      .map((l) => l.position);
    expect(senatePositions).toContain("Senate Majority Leader");
    expect(senatePositions).toContain("Senate Minority Leader");
    expect(senatePositions).toContain("Senate Chief Whip");
    expect(senatePositions).toContain("Senate Minority Whip");
  });

  it("house leaders include Majority Leader, Minority Leader, Chief Whip, Minority Whip", () => {
    const state = stubState({ day: 28 });
    const { leaders } = fillPostElectionPositions(state, makeRng());
    const housePositions = leaders
      .filter((l) => l.chamber === "house")
      .map((l) => l.position);
    expect(housePositions).toContain("House Majority Leader");
    expect(housePositions).toContain("House Minority Leader");
    expect(housePositions).toContain("House Chief Whip");
    expect(housePositions).toContain("House Minority Whip");
  });

  it("all leaders have character names", () => {
    const state = stubState({ day: 28 });
    const { leaders } = fillPostElectionPositions(state, makeRng());
    for (const leader of leaders) {
      expect(leader.characterName).toBeTruthy();
    }
  });

  it("no duplicate names across all leaders", () => {
    const state = stubState({ day: 28 });
    const { leaders } = fillPostElectionPositions(state, makeRng());
    const names = leaders.map((l) => l.characterName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("creates CharacterState entries for all leaders", () => {
    const state = stubState({ day: 28 });
    const { leaders, characters } = fillPostElectionPositions(state, makeRng());
    for (const leader of leaders) {
      expect(characters[leader.characterName]).toBeDefined();
      expect(characters[leader.characterName].portfolio).toBe(leader.position);
    }
  });

  it("ruling party positions go to ADU/allied members", () => {
    const state = stubState({ day: 28 });
    const { leaders, characters } = fillPostElectionPositions(state, makeRng());
    const majorityLeader = leaders.find((l) => l.position === "Senate Majority Leader");
    expect(majorityLeader).toBeDefined();
    const charState = characters[majorityLeader!.characterName];
    expect(["ADU", "TLA", "PAP"]).toContain(charState.party);
  });

  it("opposition positions go to non-ruling-party members", () => {
    const state = stubState({ day: 28 });
    const { leaders, characters } = fillPostElectionPositions(state, makeRng());
    const minorityLeader = leaders.find((l) => l.position === "Senate Minority Leader");
    expect(minorityLeader).toBeDefined();
    const charState = characters[minorityLeader!.characterName];
    expect(["ADU", "TLA", "PAP"]).not.toContain(charState.party);
  });
});

// ── seedLegislature ─────────────────────────────────────────────────────────

describe("seedLegislature", () => {
  it("returns an initial leadership state with empty leaders", () => {
    const result = seedLegislature(12345);
    expect(result.leadership.senateLeaders).toEqual([]);
    expect(result.leadership.houseLeaders).toEqual([]);
    expect(result.leadership.leadershipElectionsDone).toBe(false);
    expect(result.leadership.committeesFilled).toBe(false);
  });

  it("creates character entries for top senators", () => {
    const result = seedLegislature(12345);
    const charNames = Object.keys(result.characters);
    expect(charNames.length).toBeGreaterThanOrEqual(20);
    // At least some should be senators
    const senatorChars = Object.values(result.characters).filter(
      (c) => c.portfolio === "Senator",
    );
    expect(senatorChars.length).toBeGreaterThan(0);
  });

  it("creates character entries for top house reps", () => {
    const result = seedLegislature(12345);
    const repChars = Object.values(result.characters).filter(
      (c) => c.portfolio === "House Representative",
    );
    expect(repChars.length).toBeGreaterThan(0);
  });

  it("each character has competencies", () => {
    const result = seedLegislature(12345);
    for (const char of Object.values(result.characters)) {
      expect(char.competencies).toBeDefined();
      expect(char.competencies.personal.loyalty).toBeGreaterThan(0);
    }
  });

  it("is deterministic with the same seed", () => {
    const r1 = seedLegislature(999);
    const r2 = seedLegislature(999);
    expect(Object.keys(r1.characters)).toEqual(Object.keys(r2.characters));
  });
});

// ── processLegislatureLeadership ────────────────────────────────────────────

describe("processLegislatureLeadership", () => {
  it("generates no events before day 14", () => {
    const state = stubState({ day: 10 });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.newEvents).toHaveLength(0);
  });

  it("generates senate events on day 14", () => {
    const state = stubState({ day: 14 });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.newEvents.length).toBe(2);
    expect(result.newEvents[0].title).toContain("Senate President");
    expect(result.newEvents[1].title).toContain("Deputy Senate President");
  });

  it("generates house events on day 21", () => {
    const state = stubState({ day: 21 });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.newEvents.length).toBe(2);
    expect(result.newEvents[0].title).toContain("Speaker");
    expect(result.newEvents[1].title).toContain("Deputy Speaker");
  });

  it("does not generate senate events if leaders already exist", () => {
    const leadership = {
      senateLeaders: [
        { characterName: "Test", position: "Senate President", chamber: "senate" as const, electedDay: 14 },
      ],
      houseLeaders: [],
      leadershipElectionsDone: false,
      committeesFilled: false,
    };
    const state = stubState({
      day: 14,
      legislature: { ...defaultLegislativeState(), leadership },
    });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.newEvents).toHaveLength(0);
  });

  it("fills positions on day 28", () => {
    const state = stubState({ day: 28 });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.updatedLeadership.committeesFilled).toBe(true);
    expect(result.updatedLeadership.leadershipElectionsDone).toBe(true);
  });

  it("does not re-fill positions once committees are filled", () => {
    const leadership = {
      senateLeaders: [],
      houseLeaders: [],
      leadershipElectionsDone: true,
      committeesFilled: true,
    };
    const state = stubState({
      day: 35,
      legislature: { ...defaultLegislativeState(), leadership },
    });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.newEvents).toHaveLength(0);
    expect(Object.keys(result.newCharacters)).toHaveLength(0);
  });

  it("creates new character entries when filling positions", () => {
    const state = stubState({ day: 28 });
    const result = processLegislatureLeadership(state, makeRng());
    expect(Object.keys(result.newCharacters).length).toBeGreaterThan(0);
  });

  it("returns empty consequences", () => {
    const state = stubState({ day: 14 });
    const result = processLegislatureLeadership(state, makeRng());
    expect(result.consequences).toHaveLength(0);
  });

  it("day 15-20 produces no events (between senate and house elections)", () => {
    for (let day = 15; day <= 20; day++) {
      const state = stubState({ day });
      const result = processLegislatureLeadership(state, makeRng());
      expect(result.newEvents).toHaveLength(0);
    }
  });

  it("day 22-27 produces no events (between house elections and fill)", () => {
    for (let day = 22; day <= 27; day++) {
      const state = stubState({ day });
      const result = processLegislatureLeadership(state, makeRng());
      expect(result.newEvents).toHaveLength(0);
    }
  });
});
