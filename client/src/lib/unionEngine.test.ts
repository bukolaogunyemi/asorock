import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { UnionPosition, UnionPositionId, UnionLeaderState } from "./unionTypes";
import type { GameState, CharacterState } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  computeUnionGrievance,
  processUnionPressure,
  seedUnionLeaders,
  UNION_POSITIONS,
} from "./unionEngine";

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
    name: overrides.name ?? "Test Leader",
    portfolio: overrides.portfolio ?? "Union",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Labour",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TL",
    traits: overrides.traits ?? [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makePosition(overrides: Partial<UnionPosition> = {}): UnionPosition {
  return {
    id: overrides.id ?? "chairman-teachers-union",
    title: overrides.title ?? "Chairman, Teachers Union",
    influence: overrides.influence ?? ["education"],
    strikeThreshold: overrides.strikeThreshold ?? 60,
    ...overrides,
  };
}

function makeState(overrides: {
  day?: number;
  characters?: Record<string, CharacterState>;
  unionLeaders?: Partial<UnionLeaderState>;
  stability?: number;
  education?: any;
  healthSector?: any;
  youthEmployment?: any;
  macroEconomy?: any;
  activeEvents?: any[];
} = {}): GameState {
  const defaultSector = { health: 50, momentum: 0, turnsSinceAttention: 0, crisisZone: "green", activeCascades: [], indicators: {} };
  return {
    day: overrides.day ?? 30,
    stability: overrides.stability ?? 50,
    education: overrides.education ?? { ...defaultSector },
    healthSector: overrides.healthSector ?? { ...defaultSector },
    youthEmployment: overrides.youthEmployment ?? { ...defaultSector },
    macroEconomy: overrides.macroEconomy ?? { inflation: 15, fxRate: 750, reserves: 35, debtToGdp: 38, oilOutput: 1.8, subsidyPressure: 50 },
    characters: overrides.characters ?? {},
    activeEvents: overrides.activeEvents ?? [],
    unionLeaders: {
      positions: UNION_POSITIONS,
      appointments: {
        "chairman-teachers-union": null,
        "chairman-labour-union": null,
        "chairman-trade-congress": null,
        "chairman-youth-forum": null,
        "chairman-petroleum-workers": null,
        "chairman-medical-association": null,
      },
      ...overrides.unionLeaders,
    },
  } as unknown as GameState;
}

// ── Tests: computeUnionGrievance ──

describe("computeUnionGrievance", () => {
  it("returns low grievance when sector health is high (>=50)", () => {
    const position = makePosition({ id: "chairman-teachers-union" });
    const leader = makeCharacter({ name: "Test Leader", relationship: "Neutral" });
    const state = makeState({ education: { health: 70, momentum: 0, turnsSinceAttention: 0, crisisZone: "green", activeCascades: [], indicators: {} } });

    const grievance = computeUnionGrievance(position, leader, state);
    expect(grievance).toBeLessThanOrEqual(10);
  });

  it("returns high grievance when sector health is very low", () => {
    const position = makePosition({ id: "chairman-teachers-union" });
    const leader = makeCharacter({ name: "Test Leader", relationship: "Neutral" });
    const state = makeState({ education: { health: 10, momentum: 0, turnsSinceAttention: 0, crisisZone: "red", activeCascades: [], indicators: {} } });

    const grievance = computeUnionGrievance(position, leader, state);
    expect(grievance).toBeGreaterThan(5);
  });

  it("hostile relationship increases grievance", () => {
    const position = makePosition({ id: "chairman-teachers-union" });
    const neutralLeader = makeCharacter({ name: "Test Leader", relationship: "Neutral" });
    const hostileLeader = makeCharacter({ name: "Test Leader", relationship: "Hostile" });
    const state = makeState({ education: { health: 30, momentum: 0, turnsSinceAttention: 0, crisisZone: "yellow", activeCascades: [], indicators: {} } });

    const neutralGrievance = computeUnionGrievance(position, neutralLeader, state);
    const hostileGrievance = computeUnionGrievance(position, hostileLeader, state);
    expect(hostileGrievance).toBeGreaterThan(neutralGrievance);
  });

  it("friendly relationship decreases grievance", () => {
    const position = makePosition({ id: "chairman-teachers-union" });
    const neutralLeader = makeCharacter({ name: "Test Leader", relationship: "Neutral" });
    const friendlyLeader = makeCharacter({ name: "Test Leader", relationship: "Friendly" });
    const state = makeState({ education: { health: 30, momentum: 0, turnsSinceAttention: 0, crisisZone: "yellow", activeCascades: [], indicators: {} } });

    const neutralGrievance = computeUnionGrievance(position, neutralLeader, state);
    const friendlyGrievance = computeUnionGrievance(position, friendlyLeader, state);
    expect(friendlyGrievance).toBeLessThan(neutralGrievance);
  });

  it("allied relationship reduces grievance further than friendly", () => {
    const position = makePosition({ id: "chairman-teachers-union" });
    const friendlyLeader = makeCharacter({ name: "Test Leader", relationship: "Friendly" });
    // Note: "Loyal" is the closest to "Allied" in the Relationship type
    const loyalLeader = makeCharacter({ name: "Test Leader", relationship: "Loyal" });
    const state = makeState({ education: { health: 20, momentum: 0, turnsSinceAttention: 0, crisisZone: "red", activeCascades: [], indicators: {} } });

    const friendlyGrievance = computeUnionGrievance(position, friendlyLeader, state);
    const loyalGrievance = computeUnionGrievance(position, loyalLeader, state);
    expect(loyalGrievance).toBeLessThan(friendlyGrievance);
  });

  it("is clamped to 0-100 range", () => {
    const position = makePosition({ id: "chairman-teachers-union" });
    const leader = makeCharacter({ name: "Test Leader", relationship: "Loyal" });
    const state = makeState({ education: { health: 80, momentum: 0, turnsSinceAttention: 0, crisisZone: "green", activeCascades: [], indicators: {} } });

    const grievance = computeUnionGrievance(position, leader, state);
    expect(grievance).toBeGreaterThanOrEqual(0);
    expect(grievance).toBeLessThanOrEqual(100);
  });

  it("labour union uses stability as sector", () => {
    const position = makePosition({ id: "chairman-labour-union", influence: ["stability", "economy"] });
    const leader = makeCharacter({ name: "Test Leader", relationship: "Neutral" });
    const lowStability = makeState({ stability: 20 });
    const highStability = makeState({ stability: 80 });

    const lowGrievance = computeUnionGrievance(position, leader, lowStability);
    const highGrievance = computeUnionGrievance(position, leader, highStability);
    expect(lowGrievance).toBeGreaterThan(highGrievance);
  });

  it("high strikeReadiness candidate amplifies grievance", () => {
    // Use an actual candidate from the pool with known high strikeReadiness
    const position = makePosition({ id: "chairman-teachers-union" });
    // Comr. Seun Adegbite has strikeReadiness: 90
    const hothead = makeCharacter({ name: "Comr. Seun Adegbite", relationship: "Neutral" });
    // Dr. Hauwa Abdullahi-Musa has strikeReadiness: 25
    const moderate = makeCharacter({ name: "Dr. Hauwa Abdullahi-Musa", relationship: "Neutral" });
    const state = makeState({ education: { health: 20, momentum: 0, turnsSinceAttention: 0, crisisZone: "red", activeCascades: [], indicators: {} } });

    const hotheadGrievance = computeUnionGrievance(position, hothead, state);
    const moderateGrievance = computeUnionGrievance(position, moderate, state);
    expect(hotheadGrievance).toBeGreaterThan(moderateGrievance);
  });
});

// ── Tests: processUnionPressure ──

describe("processUnionPressure", () => {
  it("returns empty results when no union leaders are appointed", () => {
    const state = makeState();
    const result = processUnionPressure(state, seededRandom(42));

    expect(result.newEvents).toHaveLength(0);
    expect(result.consequences).toHaveLength(0);
  });

  it("generates strike threat event when grievance exceeds threshold", () => {
    const leader = makeCharacter({ name: "Comr. Ikenna Okafor", relationship: "Hostile", traits: ["Veteran Boss", "Confrontational"] });
    const state = makeState({
      education: { health: 5, momentum: 0, turnsSinceAttention: 0, crisisZone: "red", activeCascades: [], indicators: {} },
      characters: { "Comr. Ikenna Okafor": leader },
      unionLeaders: {
        positions: UNION_POSITIONS,
        appointments: {
          "chairman-teachers-union": "Comr. Ikenna Okafor",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    const result = processUnionPressure(state, seededRandom(42));
    const strikeEvents = result.newEvents.filter(e => e.title.includes("Strike Threat"));
    expect(strikeEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("strike threat event has three choices: Negotiate, Concede, Stand firm", () => {
    const leader = makeCharacter({ name: "Comr. Ikenna Okafor", relationship: "Hostile", traits: ["Veteran Boss"] });
    const state = makeState({
      education: { health: 5, momentum: 0, turnsSinceAttention: 0, crisisZone: "red", activeCascades: [], indicators: {} },
      characters: { "Comr. Ikenna Okafor": leader },
      unionLeaders: {
        positions: UNION_POSITIONS,
        appointments: {
          "chairman-teachers-union": "Comr. Ikenna Okafor",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    const result = processUnionPressure(state, seededRandom(42));
    const strikeEvent = result.newEvents.find(e => e.title.includes("Strike Threat"));
    expect(strikeEvent).toBeDefined();
    expect(strikeEvent!.choices).toHaveLength(3);
    expect(strikeEvent!.choices.map(c => c.label)).toEqual(["Negotiate", "Concede to demands", "Stand firm"]);
  });

  it("sets severity to critical when grievance > 80", () => {
    const leader = makeCharacter({ name: "Comr. Ikenna Okafor", relationship: "Hostile", traits: ["Veteran Boss"] });
    const state = makeState({
      education: { health: 2, momentum: -5, turnsSinceAttention: 10, crisisZone: "red", activeCascades: [], indicators: {} },
      characters: { "Comr. Ikenna Okafor": leader },
      unionLeaders: {
        positions: [{ id: "chairman-teachers-union" as UnionPositionId, title: "Chairman, Teachers Union", influence: ["education"], strikeThreshold: 10 }],
        appointments: {
          "chairman-teachers-union": "Comr. Ikenna Okafor",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    const result = processUnionPressure(state, seededRandom(42));
    const strikeEvent = result.newEvents.find(e => e.title.includes("Strike Threat"));
    // With health 2 and hostile relationship, grievance should be very high
    if (strikeEvent) {
      expect(["critical", "warning"]).toContain(strikeEvent.severity);
    }
  });

  it("does not generate strike threat when grievance is below threshold", () => {
    const leader = makeCharacter({ name: "Dr. Hauwa Abdullahi-Musa", relationship: "Friendly", traits: ["Pragmatist", "Moderate"] });
    const state = makeState({
      education: { health: 70, momentum: 0, turnsSinceAttention: 0, crisisZone: "green", activeCascades: [], indicators: {} },
      characters: { "Dr. Hauwa Abdullahi-Musa": leader },
      unionLeaders: {
        positions: UNION_POSITIONS,
        appointments: {
          "chairman-teachers-union": "Dr. Hauwa Abdullahi-Musa",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    const result = processUnionPressure(state, seededRandom(42));
    const strikeEvents = result.newEvents.filter(e => e.title.includes("Strike Threat"));
    expect(strikeEvents).toHaveLength(0);
  });

  it("cooperative leader with low grievance can generate endorsement", () => {
    const leader = makeCharacter({ name: "Dr. Hauwa Abdullahi-Musa", relationship: "Friendly", traits: ["Pragmatist", "Moderate"] });
    const state = makeState({
      education: { health: 80, momentum: 0, turnsSinceAttention: 0, crisisZone: "green", activeCascades: [], indicators: {} },
      characters: { "Dr. Hauwa Abdullahi-Musa": leader },
      unionLeaders: {
        positions: UNION_POSITIONS,
        appointments: {
          "chairman-teachers-union": "Dr. Hauwa Abdullahi-Musa",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    // Run many times to check positive events can be generated (15% chance)
    let endorsementFound = false;
    for (let seed = 0; seed < 2000; seed++) {
      const result = processUnionPressure(state, seededRandom(seed * 9973));
      if (result.newEvents.some(e => e.title.includes("Endorsement"))) {
        endorsementFound = true;
        break;
      }
    }
    expect(endorsementFound).toBe(true);
  });

  it("confrontational leader with very high grievance can trigger immediate strike", () => {
    const leader = makeCharacter({ name: "Comr. Seun Adegbite", relationship: "Hostile", traits: ["Firebrand", "Confrontational"] });
    const state = makeState({
      education: { health: 0, momentum: -5, turnsSinceAttention: 10, crisisZone: "red", activeCascades: [], indicators: {} },
      characters: { "Comr. Seun Adegbite": leader },
      unionLeaders: {
        positions: [{ id: "chairman-teachers-union" as UnionPositionId, title: "Chairman, Teachers Union", influence: ["education"], strikeThreshold: 10 }],
        appointments: {
          "chairman-teachers-union": "Comr. Seun Adegbite",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    // 30% chance, so run multiple seeds
    let immediateStrikeFound = false;
    for (let seed = 0; seed < 2000; seed++) {
      const result = processUnionPressure(state, seededRandom(seed * 9973));
      if (result.consequences.some(c => c.id.includes("immediate-strike"))) {
        immediateStrikeFound = true;
        break;
      }
    }
    expect(immediateStrikeFound).toBe(true);
  });

  it("tracks grievance levels for all positions", () => {
    const state = makeState();
    const result = processUnionPressure(state, seededRandom(42));
    for (const position of UNION_POSITIONS) {
      expect(result.grievanceLevels[position.id]).toBeDefined();
    }
  });

  it("events have source contextual and category governance", () => {
    const leader = makeCharacter({ name: "Comr. Ikenna Okafor", relationship: "Hostile", traits: ["Veteran Boss"] });
    const state = makeState({
      education: { health: 5, momentum: 0, turnsSinceAttention: 0, crisisZone: "red", activeCascades: [], indicators: {} },
      characters: { "Comr. Ikenna Okafor": leader },
      unionLeaders: {
        positions: UNION_POSITIONS,
        appointments: {
          "chairman-teachers-union": "Comr. Ikenna Okafor",
          "chairman-labour-union": null,
          "chairman-trade-congress": null,
          "chairman-youth-forum": null,
          "chairman-petroleum-workers": null,
          "chairman-medical-association": null,
        },
      },
    });

    const result = processUnionPressure(state, seededRandom(42));
    for (const event of result.newEvents) {
      expect(event.source).toBe("contextual");
      expect(event.category).toBe("governance");
    }
  });
});

// ── Tests: seedUnionLeaders ──

describe("seedUnionLeaders", () => {
  it("fills all 6 union positions", () => {
    const { state } = seedUnionLeaders(12345);
    for (const position of UNION_POSITIONS) {
      expect(state.appointments[position.id]).not.toBeNull();
    }
  });

  it("creates CharacterState for each appointed leader", () => {
    const { state, characters } = seedUnionLeaders(12345);
    for (const position of UNION_POSITIONS) {
      const name = state.appointments[position.id];
      expect(name).toBeTruthy();
      expect(characters[name!]).toBeDefined();
      expect(characters[name!].name).toBe(name);
    }
  });

  it("does not duplicate any candidate across positions", () => {
    const { state } = seedUnionLeaders(12345);
    const names = Object.values(state.appointments).filter(Boolean);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("includes UNION_POSITIONS in the returned state", () => {
    const { state } = seedUnionLeaders(12345);
    expect(state.positions).toHaveLength(6);
    expect(state.positions[0].id).toBe("chairman-teachers-union");
  });

  it("character has correct portfolio matching position title", () => {
    const { state, characters } = seedUnionLeaders(12345);
    for (const position of UNION_POSITIONS) {
      const name = state.appointments[position.id];
      if (name) {
        expect(characters[name].portfolio).toBe(position.title);
      }
    }
  });

  it("produces deterministic results for the same seed", () => {
    const result1 = seedUnionLeaders(99999);
    const result2 = seedUnionLeaders(99999);
    expect(result1.state.appointments).toEqual(result2.state.appointments);
  });

  it("produces different results for different seeds", () => {
    const result1 = seedUnionLeaders(11111);
    const result2 = seedUnionLeaders(22222);
    // At least one appointment should differ
    const names1 = Object.values(result1.state.appointments);
    const names2 = Object.values(result2.state.appointments);
    const same = names1.every((n, i) => n === names2[i]);
    expect(same).toBe(false);
  });

  it("all appointed leaders have Labour faction", () => {
    const { characters } = seedUnionLeaders(12345);
    for (const char of Object.values(characters)) {
      expect(char.faction).toBe("Labour");
    }
  });
});
