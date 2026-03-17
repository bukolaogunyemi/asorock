import { describe, it, expect } from "vitest";
import type { CharacterState, GameState } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import type { NPCLink } from "./affinityRegistry";
import {
  computeAffinity,
  processAppointmentRipple,
  processCoalitionPressure,
  processRivalryEruptions,
  processGenderFriction,
  seedNPCLinks,
  cleanupNPCLinks,
} from "./affinityRegistry";

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

function makeMinimalState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 100,
    characters: {},
    npcLinks: [],
    patronage: {
      godfathers: [],
      patronageIndex: 0,
      activeDeals: 0,
      neutralizedGodfathers: [],
      approachCooldowns: {},
    },
    military: { positions: [], appointments: [] },
    directors: { positions: [], appointments: [] },
    diplomats: { posts: [], appointments: [], vacantPostWarnings: [] },
    traditionalRulers: { positions: [], appointments: [], royalCouncilSupport: 50 },
    religiousLeaders: { positions: [], appointments: [], interfaithHarmony: 50 },
    cabinetAppointments: {},
    ...overrides,
  } as unknown as GameState;
}

// ══════════════════════════════════════════════════════════════
// Task 16: computeAffinity tests
// ══════════════════════════════════════════════════════════════

describe("computeAffinity", () => {
  it("returns 0 for characters with no shared attributes", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "Technocrats",
      religion: "Christianity", ethnicity: "Yoruba", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Kano", faction: "Northern Caucus",
      religion: "Islam", ethnicity: "Hausa", gender: "Female",
    });
    expect(computeAffinity(charA, charB)).toBe(0);
  });

  it("returns +5 for same zone only", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "F1",
      religion: "Christianity", ethnicity: "Yoruba", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Ogun", faction: "F2",
      religion: "Islam", ethnicity: "Hausa", gender: "Female",
    });
    // Lagos and Ogun are both SW
    expect(computeAffinity(charA, charB)).toBe(5);
  });

  it("returns +7 for same faction only", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "Technocrats",
      religion: "Christianity", ethnicity: "Yoruba", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Kano", faction: "Technocrats",
      religion: "Islam", ethnicity: "Hausa", gender: "Female",
    });
    expect(computeAffinity(charA, charB)).toBe(7);
  });

  it("returns +3 for same religion only", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "F1",
      religion: "Islam", ethnicity: "Yoruba", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Kano", faction: "F2",
      religion: "Islam", ethnicity: "Hausa", gender: "Female",
    });
    expect(computeAffinity(charA, charB)).toBe(3);
  });

  it("returns +6 for same ethnicity only", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "F1",
      religion: "Christianity", ethnicity: "Igbo", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Kano", faction: "F2",
      religion: "Islam", ethnicity: "Igbo", gender: "Female",
    });
    expect(computeAffinity(charA, charB)).toBe(6);
  });

  it("returns +3 for same gender only", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "F1",
      religion: "Christianity", ethnicity: "Yoruba", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Kano", faction: "F2",
      religion: "Islam", ethnicity: "Hausa", gender: "Male",
    });
    expect(computeAffinity(charA, charB)).toBe(3);
  });

  it("caps at +20 for maximum overlap", () => {
    const charA = makeCharacter({
      name: "A", state: "Lagos", faction: "Technocrats",
      religion: "Christianity", ethnicity: "Yoruba", gender: "Male",
    });
    const charB = makeCharacter({
      name: "B", state: "Ogun", faction: "Technocrats",
      religion: "Christianity", ethnicity: "Yoruba", gender: "Male",
    });
    // zone=5 + faction=7 + religion=3 + ethnicity=6 + gender=3 = 24 → capped at 20
    expect(computeAffinity(charA, charB)).toBe(20);
  });

  it("handles missing fields gracefully", () => {
    const charA = makeCharacter({ name: "A" });
    const charB = makeCharacter({ name: "B" });
    // No state/religion/ethnicity/gender set via overrides — faction matches
    expect(computeAffinity(charA, charB)).toBeGreaterThanOrEqual(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Task 17: processAppointmentRipple tests
// ══════════════════════════════════════════════════════════════

describe("processAppointmentRipple", () => {
  it("produces positive consequences when appointing someone with mentor link", () => {
    const state = makeMinimalState({
      characters: {
        "Mentor Guy": makeCharacter({ name: "Mentor Guy" }),
        "Appointee": makeCharacter({ name: "Appointee" }),
      },
      npcLinks: [
        { characterA: "Mentor Guy", systemA: "godfathers", characterB: "Appointee", systemB: "military", type: "mentor", strength: 3 },
      ],
    });

    const result = processAppointmentRipple(state, "Appointee", "appoint", false);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const mentorEffect = result.consequences.find((c) =>
      c.effects.some((e) => e.characterName === "Mentor Guy"),
    );
    expect(mentorEffect).toBeDefined();
    expect(mentorEffect!.effects[0].delta).toBe(5);
  });

  it("produces negative consequences when dismissing someone with ally link", () => {
    const state = makeMinimalState({
      characters: {
        "Ally Person": makeCharacter({ name: "Ally Person" }),
        "Dismissed": makeCharacter({ name: "Dismissed" }),
      },
      npcLinks: [
        { characterA: "Ally Person", systemA: "godfathers", characterB: "Dismissed", systemB: "cabinet", type: "ally", strength: 2 },
      ],
    });

    const result = processAppointmentRipple(state, "Dismissed", "dismiss", false);
    const allyEffect = result.consequences.find((c) =>
      c.effects.some((e) => e.characterName === "Ally Person"),
    );
    expect(allyEffect).toBeDefined();
    expect(allyEffect!.effects[0].delta).toBe(-5);
  });

  it("rival link: appointment causes -3, dismissal causes +3", () => {
    const state = makeMinimalState({
      characters: {
        "Rival": makeCharacter({ name: "Rival" }),
        "Target": makeCharacter({ name: "Target" }),
      },
      npcLinks: [
        { characterA: "Rival", systemA: "godfathers", characterB: "Target", systemB: "military", type: "rival", strength: 2 },
      ],
    });

    const appointResult = processAppointmentRipple(state, "Target", "appoint", false);
    expect(appointResult.consequences[0].effects[0].delta).toBe(-3);

    const dismissResult = processAppointmentRipple(state, "Target", "dismiss", false);
    expect(dismissResult.consequences[0].effects[0].delta).toBe(3);
  });

  it("kinship link: appointment causes +2, dismissal causes -3", () => {
    const state = makeMinimalState({
      characters: {
        "Kin": makeCharacter({ name: "Kin" }),
        "Target": makeCharacter({ name: "Target" }),
      },
      npcLinks: [
        { characterA: "Kin", systemA: "cabinet", characterB: "Target", systemB: "military", type: "kinship", strength: 1 },
      ],
    });

    const appointResult = processAppointmentRipple(state, "Target", "appoint", false);
    expect(appointResult.consequences[0].effects[0].delta).toBe(2);

    const dismissResult = processAppointmentRipple(state, "Target", "dismiss", false);
    expect(dismissResult.consequences[0].effects[0].delta).toBe(-3);
  });

  it("generates gender solidarity boost for female high-prestige appointment", () => {
    const state = makeMinimalState({ characters: {} });

    const result = processAppointmentRipple(state, "Jane Doe", "appoint", true, "Female");
    const genderConsequence = result.consequences.find((c) =>
      c.id.includes("gender-solidarity"),
    );
    expect(genderConsequence).toBeDefined();
    expect(genderConsequence!.effects[0].delta).toBe(1);
    expect(genderConsequence!.effects[0].target).toBe("approval");
  });

  it("generates negative gender consequence for female high-prestige dismissal", () => {
    const state = makeMinimalState({ characters: {} });

    const result = processAppointmentRipple(state, "Jane Doe", "dismiss", true, "Female");
    const genderConsequence = result.consequences.find((c) =>
      c.id.includes("gender-solidarity"),
    );
    expect(genderConsequence).toBeDefined();
    expect(genderConsequence!.effects[0].delta).toBe(-1);
  });

  it("no gender consequence for male appointment even if high prestige", () => {
    const state = makeMinimalState({ characters: {} });

    const result = processAppointmentRipple(state, "John Doe", "appoint", true, "Male");
    const genderConsequence = result.consequences.find((c) =>
      c.id.includes("gender-solidarity"),
    );
    expect(genderConsequence).toBeUndefined();
  });

  it("no gender consequence for female non-prestige appointment", () => {
    const state = makeMinimalState({ characters: {} });

    const result = processAppointmentRipple(state, "Jane Doe", "appoint", false, "Female");
    const genderConsequence = result.consequences.find((c) =>
      c.id.includes("gender-solidarity"),
    );
    expect(genderConsequence).toBeUndefined();
  });
});

// ══════════════════════════════════════════════════════════════
// Task 18: Coalition Pressure, Rivalry Eruptions, Gender Friction
// ══════════════════════════════════════════════════════════════

describe("processCoalitionPressure", () => {
  it("generates no events when no godfathers are at stage 3+", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [
          { id: "gf1", name: "GF1", escalationStage: 2, neutralized: false, stable: { governors: [], legislativeBloc: { house: 0, senate: 0 }, cabinetCandidates: [], connections: [] } },
        ],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      npcLinks: [
        { characterA: "GF1", systemA: "godfathers", characterB: "Ally", systemB: "traditional-rulers", type: "ally", strength: 3 },
      ],
    });

    const result = processCoalitionPressure(state, () => 0);
    expect(result.events).toHaveLength(0);
  });

  it("generates sympathy events for stage 3+ godfather with linked allies at high strength", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [
          { id: "gf1", name: "GF1", escalationStage: 3, neutralized: false, stable: { governors: [], legislativeBloc: { house: 0, senate: 0 }, cabinetCandidates: [], connections: [] } },
        ],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      npcLinks: [
        { characterA: "GF1", systemA: "godfathers", characterB: "Sultan", systemB: "traditional-rulers", type: "patron-client", strength: 3 },
      ],
    });

    // rng returns 0.1 < 0.4 threshold for strength 3
    const result = processCoalitionPressure(state, () => 0.1);
    expect(result.events.length).toBeGreaterThanOrEqual(1);
    expect(result.events[0].title).toContain("Sultan");
  });

  it("skips neutralized godfathers", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [
          { id: "gf1", name: "GF1", escalationStage: 4, neutralized: true, stable: { governors: [], legislativeBloc: { house: 0, senate: 0 }, cabinetCandidates: [], connections: [] } },
        ],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      npcLinks: [
        { characterA: "GF1", systemA: "godfathers", characterB: "Ally", systemB: "traditional-rulers", type: "ally", strength: 3 },
      ],
    });

    const result = processCoalitionPressure(state, () => 0);
    expect(result.events).toHaveLength(0);
  });

  it("uses strength-weighted probability — strength 1 needs rng < 0.1", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [
          { id: "gf1", name: "GF1", escalationStage: 3, neutralized: false, stable: { governors: [], legislativeBloc: { house: 0, senate: 0 }, cabinetCandidates: [], connections: [] } },
        ],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      npcLinks: [
        { characterA: "GF1", systemA: "godfathers", characterB: "WeakAlly", systemB: "traditional-rulers", type: "ally", strength: 1 },
      ],
    });

    // rng returns 0.15 — above 0.1 threshold for strength 1
    const noResult = processCoalitionPressure(state, () => 0.15);
    expect(noResult.events).toHaveLength(0);

    // rng returns 0.05 — below 0.1 threshold
    const yesResult = processCoalitionPressure(state, () => 0.05);
    expect(yesResult.events).toHaveLength(1);
  });
});

describe("processRivalryEruptions", () => {
  it("generates no events when rng is above 0.02", () => {
    const state = makeMinimalState({
      characters: {
        "A": makeCharacter({ name: "A" }),
        "B": makeCharacter({ name: "B" }),
      },
      npcLinks: [
        { characterA: "A", systemA: "godfathers", characterB: "B", systemB: "godfathers", type: "rival", strength: 2 },
      ],
    });

    const result = processRivalryEruptions(state, () => 0.5);
    expect(result.events).toHaveLength(0);
  });

  it("generates conflict event when rng < 0.02 for a rival link", () => {
    const state = makeMinimalState({
      characters: {
        "OoniOfIfe": makeCharacter({ name: "OoniOfIfe" }),
        "ObaOfBenin": makeCharacter({ name: "ObaOfBenin" }),
      },
      npcLinks: [
        { characterA: "OoniOfIfe", systemA: "traditional-rulers", characterB: "ObaOfBenin", systemB: "traditional-rulers", type: "rival", strength: 2 },
      ],
    });

    const result = processRivalryEruptions(state, () => 0.01);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].choices).toHaveLength(3);
    expect(result.events[0].choices[0].label).toContain("OoniOfIfe");
    expect(result.events[0].choices[1].label).toContain("ObaOfBenin");
    expect(result.events[0].choices[2].label).toBe("Stay neutral");
  });

  it("ignores non-rival links", () => {
    const state = makeMinimalState({
      characters: {
        "A": makeCharacter({ name: "A" }),
        "B": makeCharacter({ name: "B" }),
      },
      npcLinks: [
        { characterA: "A", systemA: "godfathers", characterB: "B", systemB: "godfathers", type: "ally", strength: 3 },
      ],
    });

    const result = processRivalryEruptions(state, () => 0.001);
    expect(result.events).toHaveLength(0);
  });
});

describe("processGenderFriction", () => {
  it("generates no events when no women are in high-prestige positions", () => {
    const state = makeMinimalState({
      characters: {
        "John": makeCharacter({ name: "John", gender: "Male" }),
      },
      military: {
        positions: [],
        appointments: [{ positionId: "chief-army-staff", characterName: "John", appointedDay: 1 }],
      } as any,
    });

    const result = processGenderFriction(state, () => 0);
    expect(result.events).toHaveLength(0);
  });

  it("generates friction event when woman in high-prestige + low-integrity critic", () => {
    const state = makeMinimalState({
      characters: {
        "Jane": makeCharacter({ name: "Jane", gender: "Female" }),
        "Emir": makeCharacter({
          name: "Emir", gender: "Male",
          competencies: makeCompetencies({ personal: { integrity: 30 } }),
        }),
      },
      military: {
        positions: [],
        appointments: [{ positionId: "chief-naval-staff", characterName: "Jane", appointedDay: 1 }],
      } as any,
      traditionalRulers: {
        positions: [],
        appointments: [{ positionId: "emir-kano", characterName: "Emir", appointedDay: 1 }],
        royalCouncilSupport: 50,
      },
    });

    // rng always returns 0.01 < 0.04 threshold
    const result = processGenderFriction(state, () => 0.01);
    expect(result.events.length).toBeGreaterThanOrEqual(1);
    expect(result.events[0].choices).toHaveLength(3);
    expect(result.events[0].choices[0].label).toBe("Rebuke publicly");
  });

  it("skips critics with integrity >= 50", () => {
    const state = makeMinimalState({
      characters: {
        "Jane": makeCharacter({ name: "Jane", gender: "Female" }),
        "Emir": makeCharacter({
          name: "Emir", gender: "Male",
          competencies: makeCompetencies({ personal: { integrity: 55 } }),
        }),
      },
      military: {
        positions: [],
        appointments: [{ positionId: "chief-army-staff", characterName: "Jane", appointedDay: 1 }],
      } as any,
      traditionalRulers: {
        positions: [],
        appointments: [{ positionId: "emir-kano", characterName: "Emir", appointedDay: 1 }],
        royalCouncilSupport: 50,
      },
    });

    const result = processGenderFriction(state, () => 0.01);
    expect(result.events).toHaveLength(0);
  });

  it("does not generate friction if rng >= 0.04", () => {
    const state = makeMinimalState({
      characters: {
        "Jane": makeCharacter({ name: "Jane", gender: "Female" }),
        "Emir": makeCharacter({
          name: "Emir", gender: "Male",
          competencies: makeCompetencies({ personal: { integrity: 30 } }),
        }),
      },
      military: {
        positions: [],
        appointments: [{ positionId: "chief-army-staff", characterName: "Jane", appointedDay: 1 }],
      } as any,
      traditionalRulers: {
        positions: [],
        appointments: [{ positionId: "emir-kano", characterName: "Emir", appointedDay: 1 }],
        royalCouncilSupport: 50,
      },
    });

    const result = processGenderFriction(state, () => 0.5);
    expect(result.events).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════════
// Task 19: seedNPCLinks and cleanupNPCLinks
// ══════════════════════════════════════════════════════════════

describe("seedNPCLinks", () => {
  it("creates patron-client links from godfather traditional ruler allies", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [
          {
            id: "gf1", name: "Big Chief", zone: "NW", archetype: "business-oligarch",
            escalationStage: 0, neutralized: false, interests: [],
            stable: {
              governors: [], legislativeBloc: { house: 0, senate: 0 },
              cabinetCandidates: [], connections: [],
              traditionalRulerAllies: ["sultan-sokoto"],
              religiousLeaderAllies: [],
            },
            description: "A powerful figure",
            traits: { aggression: 50, loyalty: 50, greed: 50, visibility: 50 },
            disposition: "neutral", dealStyle: "contract", favourDebt: 0,
            activeContracts: [], influenceScore: 70,
          },
        ],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      traditionalRulers: {
        positions: [],
        appointments: [{ positionId: "sultan-sokoto", characterName: "Sultan Abubakar", appointedDay: 1 }],
        royalCouncilSupport: 50,
      },
      characters: {
        "Sultan Abubakar": makeCharacter({ name: "Sultan Abubakar", state: "Sokoto" }),
      },
    });

    const links = seedNPCLinks(state);
    const patronLinks = links.filter((l) => l.type === "patron-client");
    expect(patronLinks.length).toBeGreaterThanOrEqual(1);
    expect(patronLinks[0].characterA).toBe("Big Chief");
    expect(patronLinks[0].characterB).toBe("Sultan Abubakar");
    expect(patronLinks[0].strength).toBe(3);
  });

  it("creates rival links between oligarchs in different zones", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [
          {
            id: "gf1", name: "OligarchA", zone: "NW", archetype: "business-oligarch",
            escalationStage: 0, neutralized: false, interests: ["petroleum-policy"],
            stable: { governors: [], legislativeBloc: { house: 0, senate: 0 }, cabinetCandidates: [], connections: [] },
            description: "", traits: { aggression: 50, loyalty: 50, greed: 50, visibility: 50 },
            disposition: "neutral", dealStyle: "contract", favourDebt: 0, activeContracts: [], influenceScore: 70,
          },
          {
            id: "gf2", name: "OligarchB", zone: "SS", archetype: "business-oligarch",
            escalationStage: 0, neutralized: false, interests: ["petroleum-policy"],
            stable: { governors: [], legislativeBloc: { house: 0, senate: 0 }, cabinetCandidates: [], connections: [] },
            description: "", traits: { aggression: 50, loyalty: 50, greed: 50, visibility: 50 },
            disposition: "neutral", dealStyle: "contract", favourDebt: 0, activeContracts: [], influenceScore: 70,
          },
        ],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      characters: {},
    });

    const links = seedNPCLinks(state);
    const rivalLinks = links.filter((l) => l.type === "rival");
    expect(rivalLinks.length).toBeGreaterThanOrEqual(1);
    expect(rivalLinks[0].characterA).toBe("OligarchA");
    expect(rivalLinks[0].characterB).toBe("OligarchB");
  });

  it("supplements kinship links if fewer than 5 found from descriptions", () => {
    const state = makeMinimalState({
      patronage: {
        godfathers: [],
        patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {},
      } as any,
      characters: {
        "CharA": makeCharacter({ name: "CharA", state: "Lagos", faction: "F1" }),
        "CharB": makeCharacter({ name: "CharB", state: "Ogun", faction: "F2" }),
        "CharC": makeCharacter({ name: "CharC", state: "Lagos", faction: "F3" }),
        "CharD": makeCharacter({ name: "CharD", state: "Ogun", faction: "F4" }),
        "CharE": makeCharacter({ name: "CharE", state: "Lagos", faction: "F5" }),
        "CharF": makeCharacter({ name: "CharF", state: "Ogun", faction: "F6" }),
      },
    });

    const links = seedNPCLinks(state);
    const kinshipLinks = links.filter((l) => l.type === "kinship");
    expect(kinshipLinks.length).toBeGreaterThanOrEqual(5);
  });
});

describe("cleanupNPCLinks", () => {
  const baseLinks: NPCLink[] = [
    { characterA: "Alice", systemA: "cabinet", characterB: "Bob", systemB: "military", type: "ally", strength: 2 },
    { characterA: "Charlie", systemA: "godfathers", characterB: "Alice", systemB: "cabinet", type: "kinship", strength: 1 },
    { characterA: "Dave", systemA: "diplomats", characterB: "Eve", systemB: "directors", type: "rival", strength: 2 },
  ];

  it("removes all links referencing the character on death/retirement", () => {
    const result = cleanupNPCLinks(baseLinks, "Alice", "remove");
    expect(result).toHaveLength(1);
    expect(result[0].characterA).toBe("Dave");
  });

  it("preserves unrelated links", () => {
    const result = cleanupNPCLinks(baseLinks, "Alice", "remove");
    expect(result.every((l) => l.characterA !== "Alice" && l.characterB !== "Alice")).toBe(true);
  });

  it("updates system references on career transition", () => {
    const result = cleanupNPCLinks(baseLinks, "Alice", "transition", "godfathers");
    const aliceLinks = result.filter((l) => l.characterA === "Alice" || l.characterB === "Alice");
    expect(aliceLinks).toHaveLength(2);
    // First link: Alice is characterA
    const linkAsA = aliceLinks.find((l) => l.characterA === "Alice");
    expect(linkAsA?.systemA).toBe("godfathers");
    // Second link: Alice is characterB
    const linkAsB = aliceLinks.find((l) => l.characterB === "Alice");
    expect(linkAsB?.systemB).toBe("godfathers");
  });

  it("does not modify links for unrelated characters", () => {
    const result = cleanupNPCLinks(baseLinks, "NonExistent", "remove");
    expect(result).toHaveLength(3);
  });

  it("transition with no newSystem keeps original system values", () => {
    const result = cleanupNPCLinks(baseLinks, "Alice", "transition");
    const aliceLink = result.find((l) => l.characterA === "Alice");
    expect(aliceLink?.systemA).toBe("cabinet"); // unchanged — no newSystem
  });
});
