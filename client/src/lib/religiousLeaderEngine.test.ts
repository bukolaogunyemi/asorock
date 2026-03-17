import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { ReligiousLeaderPosition, ReligiousLeaderAppointment, ReligiousLeaderSystemState } from "./religiousLeaderTypes";
import type { GameState, CharacterState, ActiveEvent } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  seedReligiousLeaders,
  computeInterfaithHarmony,
  processReligiousLeaderEvents,
  processReligiousLeaders,
  generateFestivalEvents,
  processInterfaithSummit,
  generatePolicyReactions,
  RELIGIOUS_SENSITIVITY_MAP,
} from "./religiousLeaderEngine";
import { RELIGIOUS_LEADER_POSITIONS } from "./religiousLeaderTypes";
import { RELIGIOUS_LEADER_CANDIDATES } from "./religiousLeaderPool";

// ── Helpers ──

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 50, diplomacy: 70, security: 30, communications: 50,
      legal: 50, administration: 60, technology: 30, management: 50, politics: 45,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 70, leadership: 70, ambition: 50,
      integrity: 80, resilience: 70, intrigue: 30, discretion: 60,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Leader",
    portfolio: overrides.portfolio ?? "President, Christian Association of Nigeria",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Christian Leaders",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TL",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makePosition(overrides: Partial<ReligiousLeaderPosition> = {}): ReligiousLeaderPosition {
  return {
    id: overrides.id ?? "pres-christian-society",
    title: overrides.title ?? "President, Christian Association of Nigeria",
    religion: overrides.religion ?? "Christianity",
    description: overrides.description ?? "Head of CAN",
    influenceWeight: overrides.influenceWeight ?? 1.0,
  };
}

function makeAppointment(overrides: Partial<ReligiousLeaderAppointment> = {}): ReligiousLeaderAppointment {
  return {
    positionId: overrides.positionId ?? "pres-christian-society",
    characterName: overrides.characterName ?? "Test Leader",
    appointedDay: overrides.appointedDay ?? 0,
  };
}

function makeReligiousLeaderState(
  positions: ReligiousLeaderPosition[] = [makePosition()],
  appointments: ReligiousLeaderAppointment[] = [makeAppointment()],
): ReligiousLeaderSystemState {
  return { positions, appointments, interfaithHarmony: 50 };
}

function makeTestState(overrides: {
  day?: number;
  positions?: ReligiousLeaderPosition[];
  appointments?: ReligiousLeaderAppointment[];
  characters?: Record<string, CharacterState>;
  religiousLeaders?: ReligiousLeaderSystemState;
  activeEvents?: ActiveEvent[];
} = {}): GameState {
  const positions = overrides.positions ?? [
    makePosition(),
    makePosition({ id: "pres-muslim-society", title: "President, Supreme Council for Islamic Affairs", religion: "Islam" }),
  ];
  const appointments = overrides.appointments ?? [
    makeAppointment(),
    makeAppointment({ positionId: "pres-muslim-society", characterName: "Test Muslim Leader" }),
  ];
  const characters = overrides.characters ?? {
    "Test Leader": makeCharacter(),
    "Test Muslim Leader": makeCharacter({
      name: "Test Muslim Leader",
      portfolio: "President, Supreme Council for Islamic Affairs",
      faction: "Islamic Leaders",
    }),
  };

  return {
    day: overrides.day ?? 30,
    religiousLeaders: overrides.religiousLeaders ?? makeReligiousLeaderState(positions, appointments),
    characters,
    activeEvents: overrides.activeEvents ?? [],
    inbox: [],
  } as unknown as GameState;
}

// ── Position definitions ──

describe("Religious leader position definitions", () => {
  it("has 2 religious leader positions", () => {
    expect(RELIGIOUS_LEADER_POSITIONS).toHaveLength(2);
  });

  it("has one Christian and one Muslim position", () => {
    const religions = RELIGIOUS_LEADER_POSITIONS.map(p => p.religion);
    expect(religions).toContain("Christianity");
    expect(religions).toContain("Islam");
  });

  it("both positions have influenceWeight 1.0", () => {
    for (const pos of RELIGIOUS_LEADER_POSITIONS) {
      expect(pos.influenceWeight).toBe(1.0);
    }
  });
});

// ── Candidate pool ──

describe("RELIGIOUS_LEADER_CANDIDATES pool", () => {
  it("has 10 candidates total", () => {
    expect(RELIGIOUS_LEADER_CANDIDATES).toHaveLength(10);
  });

  it("has 5 Christian and 5 Muslim candidates", () => {
    const christian = RELIGIOUS_LEADER_CANDIDATES.filter(c => c.qualifiedFor.includes("pres-christian-society"));
    const muslim = RELIGIOUS_LEADER_CANDIDATES.filter(c => c.qualifiedFor.includes("pres-muslim-society"));
    expect(christian).toHaveLength(5);
    expect(muslim).toHaveLength(5);
  });

  it("all candidates have correct competency field structure", () => {
    const profKeys = ["economics", "diplomacy", "security", "media", "legal", "administration", "technology"];
    const persKeys = ["loyalty", "charisma", "leadership", "ambition", "integrity", "resilience", "intrigue"];

    for (const c of RELIGIOUS_LEADER_CANDIDATES) {
      expect(Object.keys(c.competencies.professional).sort()).toEqual(profKeys.sort());
      expect(Object.keys(c.competencies.personal).sort()).toEqual(persKeys.sort());
    }
  });

  it("all candidates have influence in 70-95 range", () => {
    for (const c of RELIGIOUS_LEADER_CANDIDATES) {
      expect(c.influence).toBeGreaterThanOrEqual(70);
      expect(c.influence).toBeLessThanOrEqual(95);
    }
  });

  it("has mix of dispositions", () => {
    const dispositions = new Set(RELIGIOUS_LEADER_CANDIDATES.map(c => c.disposition));
    expect(dispositions.size).toBeGreaterThanOrEqual(2);
  });
});

// ── seedReligiousLeaders ──

describe("seedReligiousLeaders", () => {
  it("fills both positions", () => {
    const result = seedReligiousLeaders(42);
    expect(result.state.appointments).toHaveLength(2);
    const filled = result.state.appointments.filter(a => a.characterName);
    expect(filled.length).toBe(2);
  });

  it("creates character entries for appointed leaders", () => {
    const result = seedReligiousLeaders(42);
    for (const appt of result.state.appointments) {
      expect(result.characters[appt.characterName]).toBeDefined();
    }
  });

  it("assigns Christian candidate to Christian position and Muslim to Muslim", () => {
    const result = seedReligiousLeaders(42);
    for (const appt of result.state.appointments) {
      const char = result.characters[appt.characterName];
      if (appt.positionId === "pres-christian-society") {
        expect(char.religion).toBe("Christianity");
      } else {
        expect(char.religion).toBe("Islam");
      }
    }
  });

  it("initializes interfaithHarmony at 50", () => {
    const result = seedReligiousLeaders(42);
    expect(result.state.interfaithHarmony).toBe(50);
  });

  it("produces different results with different seeds", () => {
    // Run many seeds — with only 5 candidates per position, results may sometimes match
    const results = new Set<string>();
    for (let seed = 0; seed < 50; seed++) {
      const result = seedReligiousLeaders(seed);
      const names = result.state.appointments.map(a => a.characterName).sort().join(",");
      results.add(names);
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

// ── computeInterfaithHarmony ──

describe("computeInterfaithHarmony", () => {
  it("returns 80 when both leaders are Friendly", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });
    expect(computeInterfaithHarmony(state)).toBe(80);
  });

  it("returns 50 when both leaders are Neutral", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Neutral" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Neutral" }),
      },
    });
    expect(computeInterfaithHarmony(state)).toBe(50);
  });

  it("returns low value when both leaders are hostile", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Hostile" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Hostile" }),
      },
    });
    expect(computeInterfaithHarmony(state)).toBeLessThanOrEqual(20);
  });

  it("returns moderate value with mixed relationships", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Wary" }),
      },
    });
    const harmony = computeInterfaithHarmony(state);
    expect(harmony).toBeGreaterThan(30);
    expect(harmony).toBeLessThan(80);
  });
});

// ── processReligiousLeaderEvents ──

describe("processReligiousLeaderEvents", () => {
  it("returns empty arrays most of the time (1.5% chance)", () => {
    const state = makeTestState();
    let emptyCount = 0;
    for (let i = 0; i < 100; i++) {
      const rng = seededRandom(i);
      const result = processReligiousLeaderEvents(state, rng);
      if (result.events.length === 0 && result.inboxMessages.length === 0) {
        emptyCount++;
      }
    }
    // Should be empty the vast majority of the time
    expect(emptyCount).toBeGreaterThan(80);
  });

  it("generates criticism events for Wary leaders", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Wary" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Wary" }),
      },
    });

    let foundEvent = false;
    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = processReligiousLeaderEvents(state, rng);
      if (result.events.length > 0) {
        foundEvent = true;
        expect(result.events[0].title).toContain("Express Concern");
        break;
      }
    }
    expect(foundEvent).toBe(true);
  });

  it("generates inbox messages for Friendly leaders", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });

    let foundMessage = false;
    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = processReligiousLeaderEvents(state, rng);
      if (result.inboxMessages.length > 0) {
        foundMessage = true;
        expect(result.inboxMessages[0].subject).toContain("Prayers");
        break;
      }
    }
    expect(foundMessage).toBe(true);
  });
});

// ── processReligiousLeaders ──

describe("processReligiousLeaders", () => {
  it("returns updated religious leader state with interfaith harmony", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processReligiousLeaders(state, rng);
    expect(result.updatedReligiousLeaders).toBeDefined();
    expect(typeof result.interfaithHarmony).toBe("number");
    expect(result.interfaithHarmony).toBeGreaterThanOrEqual(0);
    expect(result.interfaithHarmony).toBeLessThanOrEqual(100);
  });

  it("returns arrays for events, consequences, inbox", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processReligiousLeaders(state, rng);
    expect(Array.isArray(result.newEvents)).toBe(true);
    expect(Array.isArray(result.consequences)).toBe(true);
    expect(Array.isArray(result.inboxMessages)).toBe(true);
  });

  it("generates consequences when interfaith harmony is very low and day divisible by 30", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Leader": makeCharacter({ relationship: "Hostile" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Hostile" }),
      },
    });
    const rng = seededRandom(42);
    const result = processReligiousLeaders(state, rng);
    // Harmony < 25 with both hostile (10 each → avg 10)
    expect(result.interfaithHarmony).toBeLessThan(25);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT generate tension consequence when harmony is moderate", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });
    const rng = seededRandom(42);
    const result = processReligiousLeaders(state, rng);
    // harmony = 80, no tension consequence
    const tensionConsequences = result.consequences.filter(c => c.id.startsWith("religious-tension"));
    expect(tensionConsequences).toHaveLength(0);
  });
});

// ── generateFestivalEvents (Task 12) ──

describe("generateFestivalEvents", () => {
  it("generates festival event on day 90", () => {
    const state = makeTestState({ day: 90 });
    const result = generateFestivalEvents(state);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toContain("Religious Observance");
  });

  it("does NOT generate on non-90-multiple days", () => {
    const state = makeTestState({ day: 45 });
    const result = generateFestivalEvents(state);
    expect(result.events).toHaveLength(0);
  });

  it("does NOT generate on day 0", () => {
    const state = makeTestState({ day: 0 });
    const result = generateFestivalEvents(state);
    expect(result.events).toHaveLength(0);
  });

  it("alternates Christian (cycle 0) and Muslim (cycle 1)", () => {
    // Day 90 → cycle 1 → Muslim
    const state90 = makeTestState({ day: 90 });
    const result90 = generateFestivalEvents(state90);
    expect(result90.events[0].title).toContain("Muslim");

    // Day 180 → cycle 0 → Christian
    const state180 = makeTestState({ day: 180 });
    const result180 = generateFestivalEvents(state180);
    expect(result180.events[0].title).toContain("Christian");
  });

  it("has 3 choices: Attend, Send Message, No Acknowledgment", () => {
    const state = makeTestState({ day: 90 });
    const result = generateFestivalEvents(state);
    expect(result.events[0].choices).toHaveLength(3);
    const labels = result.events[0].choices.map(c => c.label);
    expect(labels.some(l => l.includes("Attend"))).toBe(true);
    expect(labels.some(l => l.includes("Message"))).toBe(true);
    expect(labels.some(l => l.includes("No Acknowledgment"))).toBe(true);
  });

  it("Attend gives +10 rel, +3 approval, -1 PC", () => {
    const state = makeTestState({ day: 90 });
    const result = generateFestivalEvents(state);
    const attendChoice = result.events[0].choices.find(c => c.label.includes("Attend"));
    expect(attendChoice).toBeDefined();
    const effects = attendChoice!.consequences[0].effects;
    expect(effects.find(e => e.target === "character")?.delta).toBe(10);
    expect(effects.find(e => e.target === "approval")?.delta).toBe(3);
    expect(effects.find(e => e.target === "politicalCapital")?.delta).toBe(-1);
  });

  it("No Acknowledgment gives -8 rel, -2 approval", () => {
    const state = makeTestState({ day: 90 });
    const result = generateFestivalEvents(state);
    const ignoreChoice = result.events[0].choices.find(c => c.label.includes("No Acknowledgment"));
    expect(ignoreChoice).toBeDefined();
    const effects = ignoreChoice!.consequences[0].effects;
    expect(effects.find(e => e.target === "character")?.delta).toBe(-8);
    expect(effects.find(e => e.target === "approval")?.delta).toBe(-2);
  });

  it("Send Message gives +4 rel, +1 approval", () => {
    const state = makeTestState({ day: 90 });
    const result = generateFestivalEvents(state);
    const messageChoice = result.events[0].choices.find(c => c.label.includes("Message"));
    expect(messageChoice).toBeDefined();
    const effects = messageChoice!.consequences[0].effects;
    expect(effects.find(e => e.target === "character")?.delta).toBe(4);
    expect(effects.find(e => e.target === "approval")?.delta).toBe(1);
  });
});

// ── processInterfaithSummit (Task 12) ──

describe("processInterfaithSummit", () => {
  it("succeeds when both leaders are Friendly (both > 50)", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });
    const result = processInterfaithSummit(state);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const stabEffect = result.consequences[0].effects.find(e => e.target === "stability");
    expect(stabEffect?.delta).toBe(2);
    expect(result.updatedReligiousLeaders.interfaithHarmony).toBeGreaterThan(50);
    expect(result.updatedReligiousLeaders.lastSummitDay).toBe(30);
  });

  it("is a disaster when both leaders are Hostile (both < 30)", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Hostile" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Hostile" }),
      },
    });
    const result = processInterfaithSummit(state);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const stabEffect = result.consequences[0].effects.find(e => e.target === "stability");
    expect(stabEffect?.delta).toBe(-4);
    const approvalEffect = result.consequences[0].effects.find(e => e.target === "approval");
    expect(approvalEffect?.delta).toBe(-5);
  });

  it("partial failure when one leader is Hostile", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Hostile" }),
      },
    });
    const result = processInterfaithSummit(state);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const approvalEffect = result.consequences[0].effects.find(e => e.target === "approval");
    expect(approvalEffect?.delta).toBe(-3);
  });

  it("respects 60-day cooldown", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });
    const result1 = processInterfaithSummit(state);
    expect(result1.updatedReligiousLeaders.lastSummitDay).toBe(30);

    // Try again at day 50 — only 20 days later
    const state2 = {
      ...state,
      day: 50,
      religiousLeaders: result1.updatedReligiousLeaders,
    } as unknown as GameState;
    const result2 = processInterfaithSummit(state2);
    expect(result2.consequences).toHaveLength(0);
  });

  it("allows summit after 60 days", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });
    const result1 = processInterfaithSummit(state);
    const state2 = {
      ...state,
      day: 95, // 65 days later — past cooldown
      religiousLeaders: result1.updatedReligiousLeaders,
    } as unknown as GameState;
    const result2 = processInterfaithSummit(state2);
    expect(result2.consequences.length).toBeGreaterThanOrEqual(1);
  });

  it("updates interfaithHarmony in returned state", () => {
    const state = makeTestState({
      characters: {
        "Test Leader": makeCharacter({ relationship: "Friendly" }),
        "Test Muslim Leader": makeCharacter({ name: "Test Muslim Leader", relationship: "Friendly" }),
      },
    });
    const result = processInterfaithSummit(state);
    // Both > 50 → harmony +10
    expect(result.updatedReligiousLeaders.interfaithHarmony).toBe(60); // 50 + 10
  });
});

// ── generatePolicyReactions (Task 13) ──

describe("generatePolicyReactions", () => {
  it("generates positive reaction for welfare policy change", () => {
    const state = makeTestState({
      day: 30,
    });
    // Add policyLevers to state
    (state as any).policyLevers = { cashTransfers: { position: "moderate" } };
    const prevPolicy = { cashTransfers: "minimal" };

    const result = generatePolicyReactions(state, prevPolicy);
    expect(result.inboxMessages.length).toBeGreaterThanOrEqual(1);
    expect(result.inboxMessages[0].subject).toContain("Welcome");
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const charEffect = result.consequences[0].effects.find(e => e.target === "character");
    expect(charEffect?.delta).toBe(5);
  });

  it("generates negative reaction for education policy change", () => {
    const state = makeTestState({ day: 30 });
    (state as any).policyLevers = { educationBudgetSplit: { position: "basic-heavy" } };
    const prevPolicy = { educationBudgetSplit: "balanced" };

    const result = generatePolicyReactions(state, prevPolicy);
    expect(result.inboxMessages.length).toBeGreaterThanOrEqual(1);
    expect(result.inboxMessages[0].subject).toContain("Criticise");
    const charEffect = result.consequences[0].effects.find(e => e.target === "character");
    expect(charEffect?.delta).toBe(-5);
  });

  it("does nothing when no policy has changed", () => {
    const state = makeTestState({ day: 30 });
    (state as any).policyLevers = { cashTransfers: { position: "minimal" } };
    const prevPolicy = { cashTransfers: "minimal" };

    const result = generatePolicyReactions(state, prevPolicy);
    expect(result.inboxMessages).toHaveLength(0);
    expect(result.consequences).toHaveLength(0);
  });

  it("does nothing when previousPolicyState is undefined", () => {
    const state = makeTestState({ day: 30 });
    const result = generatePolicyReactions(state, undefined);
    expect(result.inboxMessages).toHaveLength(0);
  });

  it("RELIGIOUS_SENSITIVITY_MAP has entries for education, cash transfers, land reform", () => {
    expect(RELIGIOUS_SENSITIVITY_MAP.educationBudgetSplit).toBeDefined();
    expect(RELIGIOUS_SENSITIVITY_MAP.cashTransfers).toBeDefined();
    expect(RELIGIOUS_SENSITIVITY_MAP.landReform).toBeDefined();
  });

  it("border policy affects only Muslim leader", () => {
    const state = makeTestState({ day: 30 });
    (state as any).policyLevers = { borderPolicy: { position: "fortress" } };
    const prevPolicy = { borderPolicy: "standard" };

    const result = generatePolicyReactions(state, prevPolicy);
    // Should only generate message from Muslim leader
    if (result.inboxMessages.length > 0) {
      expect(result.inboxMessages[0].subject).toContain("Muslim");
      // Should only have 1 consequence (for Muslim leader only)
      expect(result.consequences).toHaveLength(1);
    }
  });
});
