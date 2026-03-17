import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { TraditionalRulerPosition, TraditionalRulerAppointment, TraditionalRulerSystemState } from "./traditionalRulerTypes";
import type { GameState, CharacterState, ActiveEvent } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  seedTraditionalRulers,
  computeRoyalCouncilSupport,
  processTraditionalRulerEvents,
  processTraditionalRulers,
  generateAudienceEvents,
  processStateVisit,
  generatePublicStatements,
} from "./traditionalRulerEngine";
import { TRADITIONAL_RULER_POSITIONS } from "./traditionalRulerTypes";
import { TRADITIONAL_RULER_CANDIDATES } from "./traditionalRulerPool";

// ── Helpers ──

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 50, diplomacy: 60, security: 30, communications: 45,
      legal: 50, administration: 65, technology: 25, management: 50, politics: 50,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 70, leadership: 75, ambition: 45,
      integrity: 72, resilience: 68, intrigue: 30, discretion: 55,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Ruler",
    portfolio: overrides.portfolio ?? "Sultan of Sokoto",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Traditional Institution",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TR",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makePosition(overrides: Partial<TraditionalRulerPosition> = {}): TraditionalRulerPosition {
  return {
    id: overrides.id ?? "sultan-sokoto",
    title: overrides.title ?? "Sultan of Sokoto",
    state: overrides.state ?? "Sokoto",
    zone: overrides.zone ?? "NW",
    tier: overrides.tier ?? "paramount",
    influenceWeight: overrides.influenceWeight ?? 1.0,
    description: overrides.description ?? "Test position",
  };
}

function makeAppointment(overrides: Partial<TraditionalRulerAppointment> = {}): TraditionalRulerAppointment {
  return {
    positionId: overrides.positionId ?? "sultan-sokoto",
    characterName: overrides.characterName ?? "Test Ruler",
    appointedDay: overrides.appointedDay ?? 0,
  };
}

function makeTraditionalRulerState(
  positions: TraditionalRulerPosition[] = [makePosition()],
  appointments: TraditionalRulerAppointment[] = [makeAppointment()],
): TraditionalRulerSystemState {
  return { positions, appointments, royalCouncilSupport: 50 };
}

function makeTestState(overrides: {
  day?: number;
  positions?: TraditionalRulerPosition[];
  appointments?: TraditionalRulerAppointment[];
  characters?: Record<string, CharacterState>;
  traditionalRulers?: TraditionalRulerSystemState;
  activeEvents?: ActiveEvent[];
  stability?: number;
  agriculture?: { health: number };
} = {}): GameState {
  const positions = overrides.positions ?? [makePosition()];
  const appointments = overrides.appointments ?? [makeAppointment()];
  const characters = overrides.characters ?? {
    "Test Ruler": makeCharacter(),
  };

  return {
    day: overrides.day ?? 30,
    traditionalRulers: overrides.traditionalRulers ?? makeTraditionalRulerState(positions, appointments),
    characters,
    activeEvents: overrides.activeEvents ?? [],
    inbox: [],
    stability: overrides.stability ?? 60,
    agriculture: overrides.agriculture ?? { health: 70 },
  } as unknown as GameState;
}

// ── Position definitions ──

describe("Traditional ruler position definitions", () => {
  it("has 50 positions total", () => {
    expect(TRADITIONAL_RULER_POSITIONS).toHaveLength(50);
  });

  it("has 8 paramount positions", () => {
    const paramount = TRADITIONAL_RULER_POSITIONS.filter(p => p.tier === "paramount");
    expect(paramount).toHaveLength(8);
  });

  it("has first-class positions", () => {
    const firstClass = TRADITIONAL_RULER_POSITIONS.filter(p => p.tier === "first-class");
    expect(firstClass.length).toBeGreaterThanOrEqual(18);
  });

  it("has second-class positions", () => {
    const secondClass = TRADITIONAL_RULER_POSITIONS.filter(p => p.tier === "second-class");
    expect(secondClass.length).toBeGreaterThanOrEqual(20);
  });

  it("all position IDs are unique", () => {
    const ids = TRADITIONAL_RULER_POSITIONS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all 6 geopolitical zones", () => {
    const zones = new Set(TRADITIONAL_RULER_POSITIONS.map(p => p.zone));
    expect(zones.size).toBe(6);
  });

  it("paramount positions have influenceWeight >= 0.8", () => {
    const paramount = TRADITIONAL_RULER_POSITIONS.filter(p => p.tier === "paramount");
    for (const pos of paramount) {
      expect(pos.influenceWeight).toBeGreaterThanOrEqual(0.8);
    }
  });

  it("second-class positions have influenceWeight <= 0.5", () => {
    const secondClass = TRADITIONAL_RULER_POSITIONS.filter(p => p.tier === "second-class");
    for (const pos of secondClass) {
      expect(pos.influenceWeight).toBeLessThanOrEqual(0.5);
    }
  });

  it("Sultan of Sokoto has the highest influenceWeight (1.0)", () => {
    const sultan = TRADITIONAL_RULER_POSITIONS.find(p => p.id === "sultan-sokoto");
    expect(sultan).toBeDefined();
    expect(sultan!.influenceWeight).toBe(1.0);
  });
});

// ── Candidate pool ──

describe("TRADITIONAL_RULER_CANDIDATES pool", () => {
  it("has at least 170 candidates", () => {
    expect(TRADITIONAL_RULER_CANDIDATES.length).toBeGreaterThanOrEqual(170);
  });

  it("paramount positions each have at least 5 candidates", () => {
    const paramount = TRADITIONAL_RULER_POSITIONS.filter(p => p.tier === "paramount");
    for (const pos of paramount) {
      const qualified = TRADITIONAL_RULER_CANDIDATES.filter(c =>
        c.qualifiedFor.includes(pos.id),
      );
      expect(qualified.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("all candidates have correct competency field structure", () => {
    const profKeys = ["economics", "diplomacy", "security", "media", "legal", "administration", "technology"];
    const persKeys = ["loyalty", "charisma", "leadership", "ambition", "integrity", "resilience", "intrigue"];

    for (const c of TRADITIONAL_RULER_CANDIDATES) {
      expect(Object.keys(c.competencies.professional).sort()).toEqual(profKeys.sort());
      expect(Object.keys(c.competencies.personal).sort()).toEqual(persKeys.sort());
    }
  });

  it("all candidates have influence in valid range", () => {
    for (const c of TRADITIONAL_RULER_CANDIDATES) {
      expect(c.influence).toBeGreaterThanOrEqual(40);
      expect(c.influence).toBeLessThanOrEqual(95);
    }
  });

  it("has mix of dispositions", () => {
    const dispositions = new Set(TRADITIONAL_RULER_CANDIDATES.map(c => c.disposition));
    expect(dispositions.has("supportive")).toBe(true);
    expect(dispositions.has("neutral")).toBe(true);
    expect(dispositions.has("critical")).toBe(true);
  });

  it("all candidates have valid zones", () => {
    const validZones = new Set(["NW", "NE", "NC", "SW", "SE", "SS"]);
    for (const c of TRADITIONAL_RULER_CANDIDATES) {
      expect(validZones.has(c.zone)).toBe(true);
    }
  });
});

// ── seedTraditionalRulers ──

describe("seedTraditionalRulers", () => {
  it("fills positions that have qualified candidates", () => {
    const result = seedTraditionalRulers(42);
    // At least 34 positions should be filled (those with candidates)
    expect(result.state.appointments.length).toBeGreaterThanOrEqual(34);
    const filled = result.state.appointments.filter(a => a.characterName);
    expect(filled.length).toBeGreaterThanOrEqual(34);
  });

  it("creates character entries for all appointed rulers", () => {
    const result = seedTraditionalRulers(42);
    for (const appt of result.state.appointments) {
      if (appt.characterName) {
        expect(result.characters[appt.characterName]).toBeDefined();
      }
    }
  });

  it("does not assign the same candidate to multiple positions", () => {
    const result = seedTraditionalRulers(42);
    const names = result.state.appointments
      .filter(a => a.characterName)
      .map(a => a.characterName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("initializes royalCouncilSupport at 50", () => {
    const result = seedTraditionalRulers(42);
    expect(result.state.royalCouncilSupport).toBe(50);
  });

  it("characters have 'Traditional Institution' faction", () => {
    const result = seedTraditionalRulers(42);
    for (const char of Object.values(result.characters)) {
      expect(char.faction).toBe("Traditional Institution");
    }
  });

  it("produces different results with different seeds", () => {
    const result1 = seedTraditionalRulers(42);
    const result2 = seedTraditionalRulers(999);
    const names1 = result1.state.appointments.map(a => a.characterName).sort();
    const names2 = result2.state.appointments.map(a => a.characterName).sort();
    expect(names1).not.toEqual(names2);
  });
});

// ── computeRoyalCouncilSupport ──

describe("computeRoyalCouncilSupport", () => {
  it("returns 80 for a Friendly ruler", () => {
    const state = makeTestState({
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Friendly" }),
      },
    });
    expect(computeRoyalCouncilSupport(state)).toBe(80);
  });

  it("returns 50 for a Neutral ruler", () => {
    const state = makeTestState({
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Neutral" }),
      },
    });
    expect(computeRoyalCouncilSupport(state)).toBe(50);
  });

  it("returns 30 for a Wary ruler", () => {
    const state = makeTestState({
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Wary" }),
      },
    });
    expect(computeRoyalCouncilSupport(state)).toBe(30);
  });

  it("weighs paramount rulers more heavily than second-class", () => {
    const paramountPos = makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 });
    const secondClassPos = makePosition({ id: "emir-gwandu", influenceWeight: 0.45 });

    const state = makeTestState({
      positions: [paramountPos, secondClassPos],
      appointments: [
        makeAppointment({ positionId: "sultan-sokoto", characterName: "Paramount Ruler" }),
        makeAppointment({ positionId: "emir-gwandu", characterName: "Second Class Ruler" }),
      ],
      characters: {
        "Paramount Ruler": makeCharacter({ name: "Paramount Ruler", relationship: "Friendly" }),
        "Second Class Ruler": makeCharacter({ name: "Second Class Ruler", relationship: "Hostile" }),
      },
    });

    const support = computeRoyalCouncilSupport(state);
    // Paramount (1.0 * 80) + Second-class (0.45 * 10) = 84.5 / 1.45 ≈ 58
    expect(support).toBeGreaterThan(50);
  });

  it("returns 50 when no appointments exist", () => {
    const state = makeTestState({
      appointments: [],
      characters: {},
    });
    expect(computeRoyalCouncilSupport(state)).toBe(50);
  });
});

// ── processTraditionalRulerEvents ──

describe("processTraditionalRulerEvents", () => {
  it("returns empty arrays most of the time (2% chance)", () => {
    const state = makeTestState();
    let emptyCount = 0;
    for (let i = 0; i < 100; i++) {
      const rng = seededRandom(i);
      const result = processTraditionalRulerEvents(state, rng);
      if (result.events.length === 0 && result.inboxMessages.length === 0) {
        emptyCount++;
      }
    }
    expect(emptyCount).toBeGreaterThan(80);
  });

  it("generates criticism events for Wary rulers", () => {
    const state = makeTestState({
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Wary" }),
      },
    });

    let foundEvent = false;
    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = processTraditionalRulerEvents(state, rng);
      if (result.events.length > 0) {
        foundEvent = true;
        expect(result.events[0].title).toContain("Royal Criticism");
        break;
      }
    }
    expect(foundEvent).toBe(true);
  });

  it("criticism events offer audience/ignore/proxy choices", () => {
    const state = makeTestState({
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Wary" }),
      },
    });

    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = processTraditionalRulerEvents(state, rng);
      if (result.events.length > 0) {
        expect(result.events[0].choices.length).toBe(3);
        const labels = result.events[0].choices.map(c => c.label);
        expect(labels.some(l => l.includes("audience"))).toBe(true);
        expect(labels.some(l => l.includes("Ignore"))).toBe(true);
        break;
      }
    }
  });

  it("generates inbox messages for Friendly rulers", () => {
    const state = makeTestState({
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Friendly" }),
      },
    });

    let foundMessage = false;
    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = processTraditionalRulerEvents(state, rng);
      if (result.inboxMessages.length > 0) {
        foundMessage = true;
        expect(result.inboxMessages[0].subject).toContain("Royal Endorsement");
        break;
      }
    }
    expect(foundMessage).toBe(true);
  });
});

// ── processTraditionalRulers ──

describe("processTraditionalRulers", () => {
  it("returns updated state with royalCouncilSupport", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processTraditionalRulers(state, rng);
    expect(result.updatedTraditionalRulers).toBeDefined();
    expect(typeof result.royalCouncilSupport).toBe("number");
    expect(result.royalCouncilSupport).toBeGreaterThanOrEqual(0);
    expect(result.royalCouncilSupport).toBeLessThanOrEqual(100);
  });

  it("returns arrays for events, consequences, inbox", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processTraditionalRulers(state, rng);
    expect(Array.isArray(result.newEvents)).toBe(true);
    expect(Array.isArray(result.consequences)).toBe(true);
    expect(Array.isArray(result.inboxMessages)).toBe(true);
  });

  it("generates consequences when support is very low and day divisible by 30", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Hostile" }),
      },
    });
    const rng = seededRandom(42);
    const result = processTraditionalRulers(state, rng);
    // Support should be 10 (Hostile) which is < 30
    expect(result.royalCouncilSupport).toBeLessThan(30);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
  });

  it("does NOT generate tension consequence when support is adequate", () => {
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Friendly" }),
      },
    });
    const rng = seededRandom(42);
    const result = processTraditionalRulers(state, rng);
    const tensionConsequences = result.consequences.filter(c => c.id.startsWith("trad-ruler-low-support"));
    expect(tensionConsequences).toHaveLength(0);
  });
});

// ── generateAudienceEvents (Task 10) ──

describe("generateAudienceEvents", () => {
  it("generates audience events for paramount rulers at 5% chance", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });

    let foundEvent = false;
    for (let i = 0; i < 5000; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      if (result.events.length > 0) {
        foundEvent = true;
        expect(result.events[0].title).toContain("Royal Audience Request");
        break;
      }
    }
    expect(foundEvent).toBe(true);
  });

  it("generates audience events for first-class rulers at 2% chance", () => {
    const firstClassPos = makePosition({ id: "emir-kano", tier: "first-class", influenceWeight: 0.7 });
    const state = makeTestState({
      positions: [firstClassPos],
      appointments: [makeAppointment({ positionId: "emir-kano", characterName: "Test Ruler" })],
    });

    let foundEvent = false;
    for (let i = 0; i < 10000; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      if (result.events.length > 0) {
        foundEvent = true;
        break;
      }
    }
    expect(foundEvent).toBe(true);
  });

  it("skips second-class rulers (never generates audience events)", () => {
    const secondClassPos = makePosition({ id: "emir-gwandu", tier: "second-class", influenceWeight: 0.45 });
    const state = makeTestState({
      positions: [secondClassPos],
      appointments: [makeAppointment({ positionId: "emir-gwandu", characterName: "Test Ruler" })],
    });

    for (let i = 0; i < 200; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      expect(result.events).toHaveLength(0);
    }
  });

  it("audience event has 3 choices: Grant, Proxy, Decline", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });

    for (let i = 0; i < 5000; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      if (result.events.length > 0) {
        expect(result.events[0].choices).toHaveLength(3);
        const labels = result.events[0].choices.map(c => c.label);
        expect(labels.some(l => l.includes("Grant"))).toBe(true);
        expect(labels.some(l => l.includes("Proxy"))).toBe(true);
        expect(labels.some(l => l.includes("Decline"))).toBe(true);
        break;
      }
    }
  });

  it("Grant Audience gives +8 character, +2 approval, -1 PC", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });

    for (let i = 0; i < 5000; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      if (result.events.length > 0) {
        const grantChoice = result.events[0].choices.find(c => c.label.includes("Grant"));
        expect(grantChoice).toBeDefined();
        const effects = grantChoice!.consequences[0].effects;
        expect(effects.find(e => e.target === "character")?.delta).toBe(8);
        expect(effects.find(e => e.target === "approval")?.delta).toBe(2);
        expect(effects.find(e => e.target === "politicalCapital")?.delta).toBe(-1);
        break;
      }
    }
  });

  it("Decline gives -10 character, -1 approval", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });

    for (let i = 0; i < 5000; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      if (result.events.length > 0) {
        const declineChoice = result.events[0].choices.find(c => c.label.includes("Decline"));
        expect(declineChoice).toBeDefined();
        const effects = declineChoice!.consequences[0].effects;
        expect(effects.find(e => e.target === "character")?.delta).toBe(-10);
        expect(effects.find(e => e.target === "approval")?.delta).toBe(-1);
        break;
      }
    }
  });

  it("uses security topic when stability < 40", () => {
    const state = makeTestState({
      stability: 30,
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0, zone: "NW" })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });

    for (let i = 0; i < 5000; i++) {
      const rng = seededRandom(i);
      const result = generateAudienceEvents(state, rng);
      if (result.events.length > 0) {
        expect(result.events[0].description).toContain("security");
        break;
      }
    }
  });
});

// ── processStateVisit (Task 11) ──

describe("processStateVisit", () => {
  it("generates visit consequences with +12 relationship, +3 approval, -2 PC", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });
    const result = processStateVisit(state, "sultan-sokoto");
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const visitConsequence = result.consequences[0];
    const effects = visitConsequence.effects;
    expect(effects.find(e => e.target === "character")?.delta).toBe(12);
    expect(effects.find(e => e.target === "approval")?.delta).toBe(3);
    expect(effects.find(e => e.target === "politicalCapital")?.delta).toBe(-2);
  });

  it("respects 14-day cooldown", () => {
    const state = makeTestState({
      day: 20,
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler", appointedDay: 0 })],
    });
    // First visit
    const result1 = processStateVisit(state, "sultan-sokoto");
    expect(result1.consequences.length).toBeGreaterThanOrEqual(1);

    // Apply the updated state and try again at day 25 (only 5 days later)
    const state2 = {
      ...state,
      day: 25,
      traditionalRulers: result1.updatedTraditionalRulers,
    } as unknown as GameState;
    const result2 = processStateVisit(state2, "sultan-sokoto");
    expect(result2.consequences).toHaveLength(0);
  });

  it("allows visit after 14 days have passed", () => {
    const state = makeTestState({
      day: 20,
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler", appointedDay: 0 })],
    });
    const result1 = processStateVisit(state, "sultan-sokoto");
    const state2 = {
      ...state,
      day: 35, // 15 days later — past cooldown
      traditionalRulers: result1.updatedTraditionalRulers,
    } as unknown as GameState;
    const result2 = processStateVisit(state2, "sultan-sokoto");
    expect(result2.consequences.length).toBeGreaterThanOrEqual(1);
  });

  it("adds +2 stability when zone stability < 50", () => {
    const state = makeTestState({
      stability: 40,
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });
    const result = processStateVisit(state, "sultan-sokoto");
    const visitConsequence = result.consequences[0];
    const stabilityEffect = visitConsequence.effects.find(e => e.target === "stability");
    expect(stabilityEffect).toBeDefined();
    expect(stabilityEffect!.delta).toBe(2);
  });

  it("does NOT add stability boost when stability >= 50", () => {
    const state = makeTestState({
      stability: 60,
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
    });
    const result = processStateVisit(state, "sultan-sokoto");
    const visitConsequence = result.consequences[0];
    const stabilityEffect = visitConsequence.effects.find(e => e.target === "stability");
    expect(stabilityEffect).toBeUndefined();
  });

  it("generates endorsement when relationship is Friendly (> 70)", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Friendly" }),
      },
    });
    const result = processStateVisit(state, "sultan-sokoto");
    // Should have visit consequence + endorsement consequence
    expect(result.consequences.length).toBe(2);
    const endorsement = result.consequences.find(c => c.id.includes("endorsement"));
    expect(endorsement).toBeDefined();
    expect(endorsement!.effects.find(e => e.target === "approval")?.delta).toBe(4);
    expect(result.inboxMessages.length).toBe(1);
  });

  it("does NOT generate endorsement when relationship is Neutral", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Neutral" }),
      },
    });
    const result = processStateVisit(state, "sultan-sokoto");
    expect(result.consequences).toHaveLength(1); // Only visit consequence
  });

  it("returns no-op for invalid ruler ID", () => {
    const state = makeTestState();
    const result = processStateVisit(state, "nonexistent-ruler");
    expect(result.consequences).toHaveLength(0);
    expect(result.events).toHaveLength(0);
  });
});

// ── generatePublicStatements (Task 11) ──

describe("generatePublicStatements", () => {
  it("generates endorsement for Friendly/Loyal paramount rulers (3% chance)", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", tier: "paramount", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Friendly" }),
      },
    });

    let foundEndorsement = false;
    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = generatePublicStatements(state, rng);
      if (result.inboxMessages.length > 0) {
        foundEndorsement = true;
        expect(result.inboxMessages[0].subject).toContain("Public Endorsement");
        expect(result.consequences.length).toBeGreaterThanOrEqual(1);
        break;
      }
    }
    expect(foundEndorsement).toBe(true);
  });

  it("generates criticism for Wary/Hostile rulers (5% chance)", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "sultan-sokoto", tier: "paramount", influenceWeight: 1.0 })],
      appointments: [makeAppointment({ positionId: "sultan-sokoto", characterName: "Test Ruler" })],
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Hostile" }),
      },
    });

    let foundCriticism = false;
    for (let i = 0; i < 2000; i++) {
      const rng = seededRandom(i);
      const result = generatePublicStatements(state, rng);
      if (result.inboxMessages.length > 0) {
        foundCriticism = true;
        expect(result.inboxMessages[0].subject).toContain("Public Criticism");
        // Should have stability -1 consequence
        const stabEffect = result.consequences[0]?.effects.find(e => e.target === "stability");
        expect(stabEffect?.delta).toBe(-1);
        break;
      }
    }
    expect(foundCriticism).toBe(true);
  });

  it("skips second-class rulers", () => {
    const state = makeTestState({
      positions: [makePosition({ id: "emir-gwandu", tier: "second-class", influenceWeight: 0.45 })],
      appointments: [makeAppointment({ positionId: "emir-gwandu", characterName: "Test Ruler" })],
      characters: {
        "Test Ruler": makeCharacter({ relationship: "Friendly" }),
      },
    });

    for (let i = 0; i < 200; i++) {
      const rng = seededRandom(i);
      const result = generatePublicStatements(state, rng);
      expect(result.inboxMessages).toHaveLength(0);
    }
  });
});
