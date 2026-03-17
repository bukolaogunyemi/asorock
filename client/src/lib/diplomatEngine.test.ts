import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { AmbassadorPost, AmbassadorAppointment, DiplomatSystemState } from "./diplomatTypes";
import type { GameState, CharacterState, ActiveEvent, GameInboxMessage } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  seedDiplomatSystem,
  processDiplomatRotation,
  computeDiplomaticEffect,
  processVacancyEscalation,
  generateDiplomaticIncidents,
  processDiplomats,
} from "./diplomatEngine";
import { HC_DIPLOMAT_CANDIDATES, AMBASSADOR_POSTS } from "./diplomatPool";
import { ALL_DIPLOMAT_POSTS, KEY_BILATERAL_POSTS, INSTITUTION_POSTS, MINOR_EMBASSY_POSTS } from "./diplomatPosts";

// ── Helpers ──

function makeCompetencies(
  overrides: {
    professional?: Partial<CharacterCompetencies["professional"]>;
    personal?: Partial<CharacterCompetencies["personal"]>;
  } = {},
): CharacterCompetencies {
  return {
    professional: {
      economics: 60, diplomacy: 60, security: 60, communications: 60,
      legal: 60, administration: 60, technology: 60, management: 60, politics: 60,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 60, leadership: 60, ambition: 60,
      integrity: 60, resilience: 60, intrigue: 60, discretion: 60,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Test Ambassador",
    portfolio: overrides.portfolio ?? "Ambassador",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: overrides.faction ?? "Foreign Service",
    relationship: overrides.relationship ?? "Neutral",
    avatar: "TA",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    ...overrides,
  };
}

function makePost(overrides: Partial<AmbassadorPost> = {}): AmbassadorPost {
  return {
    id: overrides.id ?? "amb-test",
    title: overrides.title ?? "Ambassador to Test Country",
    country: overrides.country ?? "Test Country",
    region: overrides.region ?? "Africa",
    category: overrides.category ?? "bilateral",
    prestige: overrides.prestige ?? "standard",
    internationalWeight: overrides.internationalWeight ?? 0.5,
    tradeWeight: overrides.tradeWeight ?? 0.4,
    militaryWeight: overrides.militaryWeight ?? 0.2,
    languageRequired: overrides.languageRequired ?? "None",
  };
}

function makeAppointment(overrides: Partial<AmbassadorAppointment> = {}): AmbassadorAppointment {
  return {
    postId: overrides.postId ?? "amb-test",
    // Use `in` check — `null ?? default` returns default (null is nullish)
    characterName: "characterName" in overrides ? overrides.characterName! : "Test Ambassador",
    appointedDay: overrides.appointedDay ?? 1,
    rotationDueDay: overrides.rotationDueDay ?? 900,
    vacantSinceDay: "vacantSinceDay" in overrides ? overrides.vacantSinceDay! : null,
  };
}

function makeDiplomatState(
  posts: AmbassadorPost[] = [],
  appointments: AmbassadorAppointment[] = [],
): DiplomatSystemState {
  return { posts, appointments, incidents: [], diplomaticEffectiveness: 50 };
}

function makeTestState(overrides: {
  day?: number;
  posts?: AmbassadorPost[];
  appointments?: AmbassadorAppointment[];
  characters?: Record<string, CharacterState>;
  diplomats?: DiplomatSystemState;
  activeEvents?: ActiveEvent[];
  inbox?: GameInboxMessage[];
} = {}): GameState {
  const posts = overrides.posts ?? [makePost()];
  const appointments = overrides.appointments ?? [makeAppointment()];
  const characters = overrides.characters ?? {
    "Test Ambassador": makeCharacter(),
  };

  return {
    day: overrides.day ?? 30,
    diplomats: overrides.diplomats ?? makeDiplomatState(posts, appointments),
    characters,
    activeEvents: overrides.activeEvents ?? [],
    inbox: overrides.inbox ?? [],
    internationalReputation: 50,
  } as unknown as GameState;
}

// ── Post definitions ──

describe("Diplomat post definitions", () => {
  it("has 40 key bilateral posts", () => {
    expect(KEY_BILATERAL_POSTS).toHaveLength(40);
  });

  it("has 10 institution posts", () => {
    expect(INSTITUTION_POSTS).toHaveLength(10);
  });

  it("has 30 minor embassy posts", () => {
    expect(MINOR_EMBASSY_POSTS).toHaveLength(30);
  });

  it("has 80 total posts", () => {
    expect(ALL_DIPLOMAT_POSTS).toHaveLength(80);
  });

  it("all post IDs are unique", () => {
    const ids = ALL_DIPLOMAT_POSTS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("strategic posts have high internationalWeight", () => {
    const strategic = ALL_DIPLOMAT_POSTS.filter(p => p.prestige === "strategic");
    expect(strategic.length).toBeGreaterThanOrEqual(5);
    for (const post of strategic) {
      expect(post.internationalWeight).toBeGreaterThanOrEqual(0.7);
    }
  });

  it("all posts have valid category", () => {
    for (const post of ALL_DIPLOMAT_POSTS) {
      expect(["bilateral", "institution", "minor"]).toContain(post.category);
    }
  });

  it("Francophone countries require French", () => {
    const francophonePosts = ALL_DIPLOMAT_POSTS.filter(p =>
      ["France", "Cameroon", "Niger", "Chad", "Benin", "Togo", "Senegal", "Côte d'Ivoire"].includes(p.country)
    );
    for (const post of francophonePosts) {
      expect(post.languageRequired).toBe("French");
    }
  });

  it("Arabic-speaking countries require Arabic", () => {
    const arabicPosts = ALL_DIPLOMAT_POSTS.filter(p =>
      ["Saudi Arabia", "United Arab Emirates", "Egypt", "Morocco", "Algeria"].includes(p.country)
    );
    for (const post of arabicPosts) {
      expect(post.languageRequired).toBe("Arabic");
    }
  });
});

// ── seedDiplomatSystem ──

describe("seedDiplomatSystem", () => {
  it("fills all 80 posts", () => {
    const result = seedDiplomatSystem(42);
    expect(result.state.posts).toHaveLength(80);
    expect(result.state.appointments).toHaveLength(80);
  });

  it("creates character entries for appointed ambassadors", () => {
    const result = seedDiplomatSystem(42);
    const filled = result.state.appointments.filter(a => a.characterName);
    // Should fill most posts (some minor posts may fail if pool is insufficient)
    expect(filled.length).toBeGreaterThanOrEqual(50);
    for (const appt of filled) {
      expect(result.characters[appt.characterName!]).toBeDefined();
    }
  });

  it("does not assign the same candidate to multiple posts", () => {
    const result = seedDiplomatSystem(42);
    const names = result.state.appointments
      .filter(a => a.characterName)
      .map(a => a.characterName);
    expect(new Set(names).size).toBe(names.length);
  });

  it("sets rotation due between 730 and 1095 days", () => {
    const result = seedDiplomatSystem(42);
    for (const appt of result.state.appointments) {
      if (appt.characterName) {
        expect(appt.rotationDueDay).toBeGreaterThanOrEqual(730);
        expect(appt.rotationDueDay).toBeLessThanOrEqual(1095);
      }
    }
  });

  it("initializes incidents as empty array", () => {
    const result = seedDiplomatSystem(42);
    expect(result.state.incidents).toEqual([]);
  });

  it("initializes diplomaticEffectiveness to 50", () => {
    const result = seedDiplomatSystem(42);
    expect(result.state.diplomaticEffectiveness).toBe(50);
  });

  it("produces different results with different seeds", () => {
    const result1 = seedDiplomatSystem(42);
    const result2 = seedDiplomatSystem(999);
    const names1 = result1.state.appointments.filter(a => a.characterName).map(a => a.characterName).sort();
    const names2 = result2.state.appointments.filter(a => a.characterName).map(a => a.characterName).sort();
    expect(names1).not.toEqual(names2);
  });
});

// ── HC candidate pool ──

describe("HC_DIPLOMAT_CANDIDATES pool", () => {
  it("has 250 hand-crafted candidates (200 bilateral + 50 institution)", () => {
    expect(HC_DIPLOMAT_CANDIDATES.length).toBe(250);
  });

  it("has candidates from all 6 geopolitical zones", () => {
    const zones = new Set(HC_DIPLOMAT_CANDIDATES.map(c => c.zone));
    expect(zones.size).toBe(6);
    for (const z of ["NC", "NW", "NE", "SW", "SE", "SS"]) {
      expect(zones).toContain(z);
    }
  });

  it("every candidate is qualified for at least one post", () => {
    for (const candidate of HC_DIPLOMAT_CANDIDATES) {
      expect(candidate.qualifiedFor.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("every key bilateral post has at least 5 qualified candidates", () => {
    for (const post of KEY_BILATERAL_POSTS) {
      const qualified = HC_DIPLOMAT_CANDIDATES.filter(c =>
        c.qualifiedFor.includes(post.id),
      );
      expect(qualified.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("every institution post has at least 5 qualified candidates", () => {
    for (const post of INSTITUTION_POSTS) {
      const qualified = HC_DIPLOMAT_CANDIDATES.filter(c =>
        c.qualifiedFor.includes(post.id),
      );
      expect(qualified.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("all candidates have competence in 50-95 range", () => {
    for (const candidate of HC_DIPLOMAT_CANDIDATES) {
      expect(candidate.competence).toBeGreaterThanOrEqual(50);
      expect(candidate.competence).toBeLessThanOrEqual(95);
    }
  });

  it("has both male and female candidates", () => {
    const males = HC_DIPLOMAT_CANDIDATES.filter(c => c.gender === "Male");
    const females = HC_DIPLOMAT_CANDIDATES.filter(c => c.gender === "Female");
    expect(males.length).toBeGreaterThan(30);
    expect(females.length).toBeGreaterThan(30);
  });

  it("candidates for French-requiring posts speak French", () => {
    const frenchPosts = ALL_DIPLOMAT_POSTS.filter(p => p.languageRequired === "French");
    for (const post of frenchPosts.filter(p => p.category !== "minor")) {
      const qualified = HC_DIPLOMAT_CANDIDATES.filter(c =>
        c.qualifiedFor.includes(post.id)
      );
      const frenchSpeakers = qualified.filter(c => c.languageSkills.includes("French"));
      if (qualified.length > 0) {
        expect(frenchSpeakers.length).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// ── computeDiplomaticEffect ──

describe("computeDiplomaticEffect", () => {
  it("returns positive modifiers for high-competence ambassadors", () => {
    const state = makeTestState({
      characters: {
        "Test Ambassador": makeCharacter({
          competencies: makeCompetencies({ professional: { diplomacy: 90 } }),
        }),
      },
    });
    const result = computeDiplomaticEffect(state);
    expect(result.internationalReputationModifier).toBeGreaterThan(0);
    expect(result.tradeModifier).toBeGreaterThan(0);
  });

  it("returns negative modifiers for low-competence ambassadors", () => {
    const state = makeTestState({
      characters: {
        "Test Ambassador": makeCharacter({
          competencies: makeCompetencies({ professional: { diplomacy: 40 } }),
        }),
      },
    });
    const result = computeDiplomaticEffect(state);
    expect(result.internationalReputationModifier).toBeLessThan(0);
    expect(result.tradeModifier).toBeLessThan(0);
  });

  it("penalizes vacant posts", () => {
    const state = makeTestState({
      appointments: [makeAppointment({ characterName: null })],
      characters: {},
    });
    const result = computeDiplomaticEffect(state);
    expect(result.internationalReputationModifier).toBeLessThan(0);
  });

  it("returns zero modifier for neutral competence (70)", () => {
    const state = makeTestState({
      characters: {
        "Test Ambassador": makeCharacter({
          competencies: makeCompetencies({ professional: { diplomacy: 70 } }),
        }),
      },
    });
    const result = computeDiplomaticEffect(state);
    expect(result.internationalReputationModifier).toBe(0);
    expect(result.tradeModifier).toBe(0);
  });

  it("computes military cooperation modifier", () => {
    const post = makePost({ militaryWeight: 0.5 });
    const state = makeTestState({
      posts: [post],
      appointments: [makeAppointment({ postId: post.id })],
      characters: {
        "Test Ambassador": makeCharacter({
          competencies: makeCompetencies({ professional: { diplomacy: 90 } }),
        }),
      },
    });
    const result = computeDiplomaticEffect(state);
    expect(result.militaryCoopModifier).toBeGreaterThan(0);
  });

  it("computes effectiveness score between 0-100", () => {
    const state = makeTestState({
      characters: {
        "Test Ambassador": makeCharacter({
          competencies: makeCompetencies({ professional: { diplomacy: 85 } }),
        }),
      },
    });
    const result = computeDiplomaticEffect(state);
    expect(result.effectiveness).toBeGreaterThanOrEqual(0);
    expect(result.effectiveness).toBeLessThanOrEqual(100);
  });
});

// ── processVacancyEscalation ──

describe("processVacancyEscalation", () => {
  it("generates inbox message at day 7 of vacancy", () => {
    const post = makePost({ prestige: "strategic" });
    const state = makeTestState({
      day: 14,
      posts: [post],
      appointments: [makeAppointment({ characterName: null, vacantSinceDay: 7, postId: post.id })],
      characters: {},
    });
    const result = processVacancyEscalation(state);
    expect(result.inboxMessages.length).toBeGreaterThanOrEqual(1);
    expect(result.inboxMessages[0].from).toBe("Ministry of Foreign Affairs");
  });

  it("generates decision desk event at day 14 of vacancy for non-minor posts", () => {
    // Use a real post ID so candidates can be found in HC_DIPLOMAT_CANDIDATES
    const realPost = KEY_BILATERAL_POSTS[0]; // amb-usa
    const state = makeTestState({
      day: 21,
      posts: [realPost],
      appointments: [makeAppointment({ characterName: null, vacantSinceDay: 7, postId: realPost.id })],
      characters: {},
    });
    const result = processVacancyEscalation(state);
    expect(result.events.length).toBeGreaterThanOrEqual(1);
    expect(result.events[0].title).toContain("Vacant Post");
  });

  it("does NOT generate decision desk event for minor posts at day 14", () => {
    const post = makePost({ category: "minor", prestige: "routine" });
    const state = makeTestState({
      day: 21,
      posts: [post],
      appointments: [makeAppointment({ characterName: null, vacantSinceDay: 7, postId: post.id })],
      characters: {},
    });
    const result = processVacancyEscalation(state);
    expect(result.events).toHaveLength(0);
  });

  it("generates trust penalty at day 30 of vacancy", () => {
    const post = makePost({ prestige: "strategic", category: "bilateral" });
    const state = makeTestState({
      day: 37,
      posts: [post],
      appointments: [makeAppointment({ characterName: null, vacantSinceDay: 7, postId: post.id })],
      characters: {},
    });
    const result = processVacancyEscalation(state);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    const trustEffect = result.consequences[0].effects.find(e => e.target === "trust");
    expect(trustEffect).toBeDefined();
    expect(trustEffect!.delta).toBeLessThan(0);
  });

  it("strategic posts get harsher penalties than standard", () => {
    const strategicPost = makePost({ prestige: "strategic", category: "bilateral", id: "amb-strat" });
    const standardPost = makePost({ prestige: "standard", category: "bilateral", id: "amb-std" });

    const stateStrategic = makeTestState({
      day: 37,
      posts: [strategicPost],
      appointments: [makeAppointment({ characterName: null, vacantSinceDay: 7, postId: strategicPost.id })],
      characters: {},
    });
    const stateStandard = makeTestState({
      day: 37,
      posts: [standardPost],
      appointments: [makeAppointment({ characterName: null, vacantSinceDay: 7, postId: standardPost.id })],
      characters: {},
    });

    const resultStrategic = processVacancyEscalation(stateStrategic);
    const resultStandard = processVacancyEscalation(stateStandard);

    const trustStrategic = resultStrategic.consequences[0]?.effects.find(e => e.target === "trust")?.delta ?? 0;
    const trustStandard = resultStandard.consequences[0]?.effects.find(e => e.target === "trust")?.delta ?? 0;
    expect(trustStrategic).toBeLessThan(trustStandard);
  });
});

// ── processDiplomatRotation ──

describe("processDiplomatRotation", () => {
  it("generates rotation event when rotationDueDay is reached", () => {
    const post = KEY_BILATERAL_POSTS[0]; // amb-usa
    const candidate = HC_DIPLOMAT_CANDIDATES.find(c => c.qualifiedFor.includes("amb-usa"))!;
    if (!candidate) return;
    const state = makeTestState({
      day: 800,
      posts: [post],
      appointments: [{
        postId: post.id,
        characterName: candidate.name,
        appointedDay: 1,
        rotationDueDay: 700,
        vacantSinceDay: null,
      }],
      characters: {
        [candidate.name]: makeCharacter({ name: candidate.name }),
      },
    });
    const rng = seededRandom(42);
    const { events } = processDiplomatRotation(state, rng);
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].title).toContain("Ambassador Rotation");
  });

  it("does NOT generate event when rotation is not yet due", () => {
    const state = makeTestState({
      day: 500,
      appointments: [makeAppointment({ rotationDueDay: 900 })],
    });
    const rng = seededRandom(42);
    const { events } = processDiplomatRotation(state, rng);
    expect(events).toHaveLength(0);
  });

  it("does NOT generate event for vacant posts", () => {
    const state = makeTestState({
      day: 900,
      appointments: [makeAppointment({ characterName: null, rotationDueDay: 800 })],
    });
    const rng = seededRandom(42);
    const { events } = processDiplomatRotation(state, rng);
    expect(events).toHaveLength(0);
  });

  it("does not duplicate existing rotation events", () => {
    const post = KEY_BILATERAL_POSTS[0];
    const candidate = HC_DIPLOMAT_CANDIDATES.find(c => c.qualifiedFor.includes("amb-usa"))!;
    if (!candidate) return;
    const state = makeTestState({
      day: 800,
      posts: [post],
      appointments: [{
        postId: post.id,
        characterName: candidate.name,
        appointedDay: 1,
        rotationDueDay: 700,
        vacantSinceDay: null,
      }],
      characters: {
        [candidate.name]: makeCharacter({ name: candidate.name }),
      },
      activeEvents: [{
        id: `diplomat-rotation-${post.id}`,
        title: "existing",
        severity: "info",
        description: "",
        category: "diplomacy",
        source: "contextual",
        createdDay: 790,
        choices: [],
      }],
    });
    const rng = seededRandom(42);
    const { events } = processDiplomatRotation(state, rng);
    expect(events).toHaveLength(0);
  });

  it("includes 'extend tour' option in rotation choices", () => {
    const post = KEY_BILATERAL_POSTS[0];
    const candidate = HC_DIPLOMAT_CANDIDATES.find(c => c.qualifiedFor.includes("amb-usa"))!;
    if (!candidate) return;
    const state = makeTestState({
      day: 800,
      posts: [post],
      appointments: [{
        postId: post.id,
        characterName: candidate.name,
        appointedDay: 1,
        rotationDueDay: 700,
        vacantSinceDay: null,
      }],
      characters: {
        [candidate.name]: makeCharacter({ name: candidate.name }),
      },
    });
    const rng = seededRandom(42);
    const { events } = processDiplomatRotation(state, rng);
    if (events.length > 0) {
      const extendChoice = events[0].choices.find(c => c.label.includes("Extend"));
      expect(extendChoice).toBeDefined();
    }
  });
});

// ── generateDiplomaticIncidents ──

describe("generateDiplomaticIncidents", () => {
  it("generates positive events for high-competence ambassadors", () => {
    let foundPositive = false;
    for (let seed = 0; seed < 2000; seed++) {
      const state = makeTestState({
        day: 100,
        appointments: [makeAppointment()],
        characters: {
          "Test Ambassador": makeCharacter({
            competencies: makeCompetencies({ professional: { diplomacy: 90 } }),
          }),
        },
      });
      const rng = seededRandom(seed);
      const { events } = generateDiplomaticIncidents(state, rng);
      if (events.some(e => e.title.includes("Win") || e.title.includes("Treaty"))) {
        foundPositive = true;
        break;
      }
    }
    expect(foundPositive).toBe(true);
  });

  it("generates negative incidents for low-competence ambassadors", () => {
    let foundNegative = false;
    for (let seed = 0; seed < 2000; seed++) {
      const state = makeTestState({
        day: 100,
        appointments: [makeAppointment()],
        characters: {
          "Test Ambassador": makeCharacter({
            competencies: makeCompetencies({ professional: { diplomacy: 40 } }),
          }),
        },
      });
      const rng = seededRandom(seed);
      const { events } = generateDiplomaticIncidents(state, rng);
      if (events.some(e => e.title.includes("Incident"))) {
        foundNegative = true;
        expect(events[0].choices.some(c => c.label.includes("Recall"))).toBe(true);
        break;
      }
    }
    expect(foundNegative).toBe(true);
  });

  it("tracks incidents in the returned array", () => {
    let foundIncident = false;
    for (let seed = 0; seed < 2000; seed++) {
      const state = makeTestState({
        day: 100,
        appointments: [makeAppointment()],
        characters: {
          "Test Ambassador": makeCharacter({
            competencies: makeCompetencies({ professional: { diplomacy: 40 } }),
          }),
        },
      });
      const rng = seededRandom(seed);
      const { incidents } = generateDiplomaticIncidents(state, rng);
      if (incidents.length > 0) {
        foundIncident = true;
        expect(incidents[0].postId).toBe("amb-test");
        expect(incidents[0].day).toBe(100);
        break;
      }
    }
    expect(foundIncident).toBe(true);
  });
});

// ── processDiplomats ──

describe("processDiplomats", () => {
  it("returns updated diplomat state with all fields", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processDiplomats(state, rng);
    expect(result.updatedDiplomats).toBeDefined();
    expect(result.updatedDiplomats.posts).toBeDefined();
    expect(result.updatedDiplomats.appointments).toBeDefined();
    expect(result.updatedDiplomats.incidents).toBeDefined();
    expect(typeof result.updatedDiplomats.diplomaticEffectiveness).toBe("number");
  });

  it("computes all three modifiers", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processDiplomats(state, rng);
    expect(typeof result.internationalModifier).toBe("number");
    expect(typeof result.tradeModifier).toBe("number");
    expect(typeof result.militaryCoopModifier).toBe("number");
  });

  it("generates vacancy penalty for strategic vacant posts", () => {
    const strategicPost = makePost({ prestige: "strategic" });
    const state = makeTestState({
      posts: [strategicPost],
      appointments: [makeAppointment({ characterName: null, postId: strategicPost.id, vacantSinceDay: 1 })],
      characters: {},
    });
    const rng = seededRandom(42);
    const result = processDiplomats(state, rng);
    expect(result.consequences.length).toBeGreaterThanOrEqual(1);
    expect(result.consequences.some(c => c.description.includes("strategic"))).toBe(true);
  });

  it("does NOT generate vacancy penalty when no strategic posts are vacant", () => {
    const routinePost = makePost({ prestige: "routine" });
    const state = makeTestState({
      posts: [routinePost],
      appointments: [makeAppointment({ postId: routinePost.id })],
    });
    const rng = seededRandom(42);
    const result = processDiplomats(state, rng);
    const vacancyConsequences = result.consequences.filter(c =>
      c.description.includes("strategic"),
    );
    expect(vacancyConsequences).toHaveLength(0);
  });

  it("returns inbox messages array", () => {
    const state = makeTestState();
    const rng = seededRandom(42);
    const result = processDiplomats(state, rng);
    expect(Array.isArray(result.inboxMessages)).toBe(true);
  });

  it("caps incidents at 50", () => {
    const existingIncidents = Array.from({ length: 49 }, (_, i) => ({
      postId: "amb-test",
      day: i,
      type: "gaffe" as const,
      description: `Incident ${i}`,
      resolved: false,
    }));
    const state = makeTestState({
      diplomats: {
        posts: [makePost()],
        appointments: [makeAppointment()],
        incidents: existingIncidents,
        diplomaticEffectiveness: 50,
      },
    });
    const rng = seededRandom(42);
    const result = processDiplomats(state, rng);
    expect(result.updatedDiplomats.incidents.length).toBeLessThanOrEqual(50);
  });
});
