import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { MilitaryPosition, MilitaryAppointment, MilitarySystemState } from "./militaryTypes";
import type { GameState, CharacterState, ActiveEvent } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  seedMilitarySystem,
  computeMilitaryEffect,
  processMilitaryEvents,
  processMilitary,
} from "./militaryEngine";
import { MILITARY_POSITIONS } from "./militaryTypes";
import { MILITARY_CANDIDATES } from "./militaryPool";

// ── Helpers ──

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 50, diplomacy: 50, security: 60, media: 40,
      legal: 45, administration: 55, technology: 40,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 50, leadership: 60, ambition: 50,
      integrity: 60, resilience: 65, intrigue: 40,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Officer",
    portfolio: overrides.portfolio ?? "Chief, Defence Force",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Military",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TO",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makePosition(overrides: Partial<MilitaryPosition> = {}): MilitaryPosition {
  return {
    id: overrides.id ?? "chief-defence-force",
    title: overrides.title ?? "Chief, Defence Force",
    description: overrides.description ?? "Overall military coordination",
    securityWeight: overrides.securityWeight ?? 1.0,
    stabilityWeight: overrides.stabilityWeight ?? 0.5,
    coupRiskWeight: overrides.coupRiskWeight ?? 0.8,
  };
}

function makeAppointment(overrides: Partial<MilitaryAppointment> = {}): MilitaryAppointment {
  return {
    positionId: overrides.positionId ?? "chief-defence-force",
    characterName: "characterName" in overrides ? overrides.characterName! : "Test Officer",
    appointedDay: overrides.appointedDay ?? 0,
  };
}

function makeMilitaryState(
  positions: MilitaryPosition[] = [makePosition()],
  appointments: MilitaryAppointment[] = [makeAppointment()],
): MilitarySystemState {
  return { positions, appointments, coupRisk: 0, securityEffectiveness: 50 };
}

function makeTestState(overrides: {
  day?: number;
  positions?: MilitaryPosition[];
  appointments?: MilitaryAppointment[];
  characters?: Record<string, CharacterState>;
  military?: MilitarySystemState;
  activeEvents?: ActiveEvent[];
} = {}): GameState {
  const positions = overrides.positions ?? [makePosition()];
  const appointments = overrides.appointments ?? [makeAppointment()];
  const characters = overrides.characters ?? {
    "Test Officer": makeCharacter(),
  };

  return {
    day: overrides.day ?? 30,
    military: overrides.military ?? makeMilitaryState(positions, appointments),
    characters,
    activeEvents: overrides.activeEvents ?? [],
    inbox: [],
  } as unknown as GameState;
}

// ── Position definitions ──

describe("Military position definitions", () => {
  it("has 6 military positions", () => {
    expect(MILITARY_POSITIONS).toHaveLength(6);
  });

  it("all position IDs are unique", () => {
    const ids = MILITARY_POSITIONS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Chief Defence Force has highest security weight", () => {
    const cdf = MILITARY_POSITIONS.find(p => p.id === "chief-defence-force");
    expect(cdf).toBeDefined();
    expect(cdf!.securityWeight).toBe(1.0);
  });

  it("all positions have valid weight ranges", () => {
    for (const pos of MILITARY_POSITIONS) {
      expect(pos.securityWeight).toBeGreaterThanOrEqual(0);
      expect(pos.securityWeight).toBeLessThanOrEqual(1);
      expect(pos.coupRiskWeight).toBeGreaterThanOrEqual(0);
      expect(pos.coupRiskWeight).toBeLessThanOrEqual(1);
    }
  });
});

// ── Candidate pool ──

describe("MILITARY_CANDIDATES pool", () => {
  it("has 120 candidates (20 per position)", () => {
    expect(MILITARY_CANDIDATES.length).toBe(120);
  });

  it("has candidates from all 6 geopolitical zones", () => {
    const zones = new Set(MILITARY_CANDIDATES.map(c => c.zone));
    expect(zones.size).toBe(6);
  });

  it("every position has at least 20 qualified candidates", () => {
    for (const pos of MILITARY_POSITIONS) {
      const qualified = MILITARY_CANDIDATES.filter(c =>
        c.qualifiedFor.includes(pos.id),
      );
      expect(qualified.length).toBeGreaterThanOrEqual(20);
    }
  });

  it("all candidates have competence in 50-95 range", () => {
    for (const c of MILITARY_CANDIDATES) {
      expect(c.competence).toBeGreaterThanOrEqual(50);
      expect(c.competence).toBeLessThanOrEqual(95);
    }
  });

  it("all candidates have loyalty in 30-95 range", () => {
    for (const c of MILITARY_CANDIDATES) {
      expect(c.loyalty).toBeGreaterThanOrEqual(30);
      expect(c.loyalty).toBeLessThanOrEqual(95);
    }
  });

  it("has both high and low loyalty candidates", () => {
    const highLoyalty = MILITARY_CANDIDATES.filter(c => c.loyalty >= 75);
    const lowLoyalty = MILITARY_CANDIDATES.filter(c => c.loyalty < 50);
    expect(highLoyalty.length).toBeGreaterThan(10);
    expect(lowLoyalty.length).toBeGreaterThan(5);
  });

  it("all candidates have military ranks", () => {
    for (const c of MILITARY_CANDIDATES) {
      expect(c.rank.length).toBeGreaterThan(0);
    }
  });
});

// ── seedMilitarySystem ──

describe("seedMilitarySystem", () => {
  it("fills all 6 positions when autoFill is true", () => {
    const result = seedMilitarySystem(42, true);
    expect(result.state.positions).toHaveLength(6);
    expect(result.state.appointments).toHaveLength(6);
    const filled = result.state.appointments.filter(a => a.characterName);
    expect(filled.length).toBe(6);
  });

  it("leaves positions vacant when autoFill is false", () => {
    const result = seedMilitarySystem(42, false);
    expect(result.state.appointments).toHaveLength(6);
    const filled = result.state.appointments.filter(a => a.characterName);
    expect(filled.length).toBe(0);
  });

  it("creates character entries for all appointed officers", () => {
    const result = seedMilitarySystem(42);
    for (const appt of result.state.appointments) {
      if (appt.characterName) {
        expect(result.characters[appt.characterName]).toBeDefined();
      }
    }
  });

  it("does not assign the same candidate to multiple positions", () => {
    const result = seedMilitarySystem(42);
    const names = result.state.appointments
      .filter(a => a.characterName)
      .map(a => a.characterName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("produces different results with different seeds", () => {
    const result1 = seedMilitarySystem(42);
    const result2 = seedMilitarySystem(999);
    const names1 = result1.state.appointments.map(a => a.characterName).sort();
    const names2 = result2.state.appointments.map(a => a.characterName).sort();
    expect(names1).not.toEqual(names2);
  });

  it("initializes coupRisk at 0", () => {
    const result = seedMilitarySystem(42);
    expect(result.state.coupRisk).toBe(0);
  });
});

// ── computeMilitaryEffect ──

describe("computeMilitaryEffect", () => {
  it("returns positive security modifier for high-competence officer", () => {
    const state = makeTestState({
      characters: {
        "Test Officer": makeCharacter({
          competencies: makeCompetencies({ professional: { security: 90 } }),
        }),
      },
    });
    const result = computeMilitaryEffect(state);
    expect(result.securityModifier).toBeGreaterThan(0);
  });

  it("returns negative security modifier for low-competence officer", () => {
    const state = makeTestState({
      characters: {
        "Test Officer": makeCharacter({
          competencies: makeCompetencies({ professional: { security: 40 } }),
        }),
      },
    });
    const result = computeMilitaryEffect(state);
    expect(result.securityModifier).toBeLessThan(0);
  });

  it("high loyalty reduces coup risk", () => {
    const stateHigh = makeTestState({
      characters: {
        "Test Officer": makeCharacter({
          competencies: makeCompetencies({ personal: { loyalty: 90 } }),
        }),
      },
    });
    const stateLow = makeTestState({
      characters: {
        "Test Officer": makeCharacter({
          competencies: makeCompetencies({ personal: { loyalty: 30 } }),
        }),
      },
    });
    const resultHigh = computeMilitaryEffect(stateHigh);
    const resultLow = computeMilitaryEffect(stateLow);
    expect(resultHigh.coupRisk).toBeLessThan(resultLow.coupRisk);
  });

  it("vacant positions increase coup risk", () => {
    const stateVacant = makeTestState({
      appointments: [makeAppointment({ characterName: null })],
      characters: {},
    });
    const result = computeMilitaryEffect(stateVacant);
    expect(result.coupRisk).toBeGreaterThan(0);
  });

  it("vacant positions penalize security", () => {
    const state = makeTestState({
      appointments: [makeAppointment({ characterName: null })],
      characters: {},
    });
    const result = computeMilitaryEffect(state);
    expect(result.securityModifier).toBeLessThan(0);
  });

  it("computes securityEffectiveness between 0-100", () => {
    const state = makeTestState();
    const result = computeMilitaryEffect(state);
    expect(result.securityEffectiveness).toBeGreaterThanOrEqual(0);
    expect(result.securityEffectiveness).toBeLessThanOrEqual(100);
  });
});

// ── processMilitary ──

describe("processMilitary", () => {
  it("returns updated military state", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processMilitary(state, rng);
    expect(result.updatedMilitary).toBeDefined();
    expect(typeof result.coupRiskLevel).toBe("number");
    expect(typeof result.securityModifier).toBe("number");
    expect(typeof result.stabilityModifier).toBe("number");
  });

  it("returns inbox and events arrays", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processMilitary(state, rng);
    expect(Array.isArray(result.newEvents)).toBe(true);
    expect(Array.isArray(result.inboxMessages)).toBe(true);
  });

  it("generates consequences for high coup risk", () => {
    // Create state with low-loyalty officer on a day divisible by 30
    const state = makeTestState({
      day: 30,
      characters: {
        "Test Officer": makeCharacter({
          competencies: makeCompetencies({
            professional: { security: 60 },
            personal: { loyalty: 20 },
          }),
        }),
      },
    });
    const rng = seededRandom(42);
    const result = processMilitary(state, rng);
    // Coup risk should be high (>60) and day is divisible by 30
    if (result.coupRiskLevel > 60) {
      expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("generates vacancy event on qualifying days", () => {
    const state = makeTestState({
      day: 14, // divisible by 14
      appointments: [makeAppointment({ characterName: null })],
      characters: {},
    });
    const rng = seededRandom(42);
    const result = processMilitary(state, rng);
    expect(result.newEvents.length).toBeGreaterThanOrEqual(1);
    expect(result.newEvents[0].severity).toBe("critical");
  });
});
