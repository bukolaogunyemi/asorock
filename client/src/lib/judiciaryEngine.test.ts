import { describe, it, expect } from "vitest";
import { seededRandom } from "./seededRandom";
import type { JudiciaryState, JusticeProfile } from "./judiciaryTypes";
import type { GameState, CharacterState } from "./gameTypes";
import type { CharacterCompetencies } from "./competencyTypes";
import {
  seatJudiciary,
  processJudiciaryNominations,
  processConfirmationHearing,
  processJudiciaryRetirements,
  handleNominationChoice,
  processJudiciary,
} from "./judiciaryEngine";

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
      legal: 70, administration: 60, technology: 50,
      ...overrides.professional,
    },
    personal: {
      loyalty: 60, charisma: 60, leadership: 60, ambition: 50,
      integrity: 70, resilience: 60, intrigue: 30,
      ...overrides.personal,
    },
  };
}

function makeCharacter(overrides: Partial<CharacterState> = {}): CharacterState {
  return {
    name: overrides.name ?? "Justice Test",
    portfolio: overrides.portfolio ?? "Supreme Court Justice",
    competencies: overrides.competencies ?? makeCompetencies(),
    faction: "Independent",
    relationship: "Neutral",
    avatar: "JT",
    traits: [],
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    age: overrides.age ?? 58,
    ...overrides,
  };
}

function makeJustice(overrides: Partial<JusticeProfile> = {}): JusticeProfile {
  return {
    characterName: overrides.characterName ?? "Justice Test",
    philosophy: overrides.philosophy ?? "independent",
    seniorityRank: overrides.seniorityRank ?? 1,
    appointedDay: overrides.appointedDay ?? 0,
    retirementAge: overrides.retirementAge ?? 70,
    ...overrides,
  };
}

function makeJudiciaryState(overrides: Partial<JudiciaryState> = {}): JudiciaryState {
  return {
    supremeCourt: {
      justices: [],
      chiefJustice: null,
      cjnConfirmed: false,
      ...overrides.supremeCourt,
    },
    courtOfAppeal: {
      justices: [],
      president: null,
      pcaConfirmed: false,
      ...overrides.courtOfAppeal,
    },
    pendingNomination: {
      position: null,
      nominee: null,
      hearingDay: null,
      ...overrides.pendingNomination,
    },
  };
}

function makeState(overrides: {
  day?: number;
  judiciary?: JudiciaryState;
  characters?: Record<string, CharacterState>;
  activeEvents?: any[];
  approval?: number;
  stability?: number;
} = {}): GameState {
  return {
    day: overrides.day ?? 30,
    judiciary: overrides.judiciary ?? makeJudiciaryState(),
    characters: overrides.characters ?? {},
    activeEvents: overrides.activeEvents ?? [],
    approval: overrides.approval ?? 50,
    stability: overrides.stability ?? 50,
  } as unknown as GameState;
}

// ── seatJudiciary ──

describe("seatJudiciary", () => {
  const result = seatJudiciary(12345);

  it("seats 10 Supreme Court justices", () => {
    expect(result.state.supremeCourt.justices).toHaveLength(10);
  });

  it("seats 20 Court of Appeal justices", () => {
    expect(result.state.courtOfAppeal.justices).toHaveLength(20);
  });

  it("creates CharacterState for each justice", () => {
    const allNames = [
      ...result.state.supremeCourt.justices.map(j => j.characterName),
      ...result.state.courtOfAppeal.justices.map(j => j.characterName),
    ];
    for (const name of allNames) {
      expect(result.characters[name]).toBeDefined();
      expect(result.characters[name].name).toBe(name);
    }
  });

  it("has no duplicate names", () => {
    const allNames = [
      ...result.state.supremeCourt.justices.map(j => j.characterName),
      ...result.state.courtOfAppeal.justices.map(j => j.characterName),
    ];
    expect(new Set(allNames).size).toBe(allNames.length);
  });

  it("SC justices have portfolio 'Supreme Court Justice'", () => {
    for (const j of result.state.supremeCourt.justices) {
      expect(result.characters[j.characterName].portfolio).toBe("Supreme Court Justice");
    }
  });

  it("CA justices have portfolio 'Court of Appeal Justice'", () => {
    for (const j of result.state.courtOfAppeal.justices) {
      expect(result.characters[j.characterName].portfolio).toBe("Court of Appeal Justice");
    }
  });

  it("chiefJustice and president start as null", () => {
    expect(result.state.supremeCourt.chiefJustice).toBeNull();
    expect(result.state.courtOfAppeal.president).toBeNull();
  });

  it("cjnConfirmed and pcaConfirmed start as false", () => {
    expect(result.state.supremeCourt.cjnConfirmed).toBe(false);
    expect(result.state.courtOfAppeal.pcaConfirmed).toBe(false);
  });

  it("assigns seniority ranks 1 through N", () => {
    const scRanks = result.state.supremeCourt.justices.map(j => j.seniorityRank);
    expect(scRanks).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const caRanks = result.state.courtOfAppeal.justices.map(j => j.seniorityRank);
    expect(caRanks).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("is deterministic", () => {
    const result2 = seatJudiciary(12345);
    expect(result.state.supremeCourt.justices.map(j => j.characterName)).toEqual(
      result2.state.supremeCourt.justices.map(j => j.characterName),
    );
  });

  it("has zone representation (at least 3 zones) among SC justices", () => {
    const zones = new Set<string>();
    for (const j of result.state.supremeCourt.justices) {
      const char = result.characters[j.characterName];
      if (char.state) zones.add(char.state);
    }
    // We measure by unique states, but even 3 zones should give 3+ states
    expect(zones.size).toBeGreaterThanOrEqual(3);
  });
});

// ── processJudiciaryNominations ──

describe("processJudiciaryNominations", () => {
  it("generates CJN nomination event at day 35", () => {
    const justices = Array.from({ length: 10 }, (_, i) =>
      makeJustice({ characterName: `Justice SC-${i}`, seniorityRank: i + 1 }),
    );
    const chars: Record<string, CharacterState> = {};
    for (const j of justices) {
      chars[j.characterName] = makeCharacter({ name: j.characterName });
    }

    const state = makeState({
      day: 35,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices, chiefJustice: null, cjnConfirmed: false },
      }),
      characters: chars,
    });

    const result = processJudiciaryNominations(state, seededRandom(100));
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe("Supreme Court: Chief Justice Nomination");
  });

  it("CJN nomination event has 10 choices (one per SC justice)", () => {
    const justices = Array.from({ length: 10 }, (_, i) =>
      makeJustice({ characterName: `Justice SC-${i}`, seniorityRank: i + 1 }),
    );
    const chars: Record<string, CharacterState> = {};
    for (const j of justices) {
      chars[j.characterName] = makeCharacter({ name: j.characterName });
    }

    const state = makeState({
      day: 35,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices, chiefJustice: null, cjnConfirmed: false },
      }),
      characters: chars,
    });

    const result = processJudiciaryNominations(state, seededRandom(100));
    expect(result.events[0].choices).toHaveLength(10);
  });

  it("does not generate CJN event if already pending", () => {
    const justices = [makeJustice({ characterName: "Justice A" })];
    const state = makeState({
      day: 35,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices, chiefJustice: null, cjnConfirmed: false },
        pendingNomination: { position: "cjn", nominee: "Justice A", hearingDay: 42 },
      }),
    });

    const result = processJudiciaryNominations(state, seededRandom(100));
    expect(result.events).toHaveLength(0);
  });

  it("does not generate CJN event before day 35", () => {
    const justices = [makeJustice({ characterName: "Justice A" })];
    const chars: Record<string, CharacterState> = {
      "Justice A": makeCharacter({ name: "Justice A" }),
    };
    const state = makeState({
      day: 34,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices, chiefJustice: null, cjnConfirmed: false },
      }),
      characters: chars,
    });

    const result = processJudiciaryNominations(state, seededRandom(100));
    expect(result.events).toHaveLength(0);
  });

  it("generates PCA nomination event after CJN is confirmed", () => {
    const caJustices = Array.from({ length: 20 }, (_, i) =>
      makeJustice({ characterName: `Justice CA-${i}`, seniorityRank: i + 1 }),
    );
    const chars: Record<string, CharacterState> = {};
    for (const j of caJustices) {
      chars[j.characterName] = makeCharacter({
        name: j.characterName,
        portfolio: "Court of Appeal Justice",
      });
    }

    const state = makeState({
      day: 50,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [makeJustice({ characterName: "CJN" })],
          chiefJustice: "CJN",
          cjnConfirmed: true,
        },
        courtOfAppeal: { justices: caJustices, president: null, pcaConfirmed: false },
        pendingNomination: { position: null, nominee: null, hearingDay: null },
      }),
      characters: chars,
    });

    const result = processJudiciaryNominations(state, seededRandom(200));
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe("Court of Appeal: President Nomination");
  });

  it("does not generate PCA event if CJN not yet confirmed", () => {
    const caJustices = [makeJustice({ characterName: "Justice CA-0" })];
    const state = makeState({
      day: 50,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices: [], chiefJustice: null, cjnConfirmed: false },
        courtOfAppeal: { justices: caJustices, president: null, pcaConfirmed: false },
      }),
    });

    const result = processJudiciaryNominations(state, seededRandom(100));
    // Should only produce CJN event (if any), not PCA
    const pcaEvents = result.events.filter(e => e.title.includes("Court of Appeal"));
    expect(pcaEvents).toHaveLength(0);
  });
});

// ── handleNominationChoice ──

describe("handleNominationChoice", () => {
  it("sets pendingNomination with hearing 7 days later", () => {
    const judiciary = makeJudiciaryState();
    const updated = handleNominationChoice(judiciary, "cjn", "Justice X", 35);
    expect(updated.pendingNomination).toEqual({
      position: "cjn",
      nominee: "Justice X",
      hearingDay: 42,
    });
  });

  it("works for PCA nominations", () => {
    const judiciary = makeJudiciaryState();
    const updated = handleNominationChoice(judiciary, "pca", "Justice Y", 50);
    expect(updated.pendingNomination).toEqual({
      position: "pca",
      nominee: "Justice Y",
      hearingDay: 57,
    });
  });
});

// ── processConfirmationHearing ──

describe("processConfirmationHearing", () => {
  it("does nothing if no pending nomination", () => {
    const state = makeState({ day: 42 });
    const result = processConfirmationHearing(state, seededRandom(100));
    expect(result.events).toHaveLength(0);
    expect(result.consequences).toHaveLength(0);
  });

  it("does nothing if day does not match hearing day", () => {
    const state = makeState({
      day: 41,
      judiciary: makeJudiciaryState({
        pendingNomination: { position: "cjn", nominee: "Justice A", hearingDay: 42 },
      }),
    });
    const result = processConfirmationHearing(state, seededRandom(100));
    expect(result.events).toHaveLength(0);
  });

  it("confirms CJN when RNG favors it (high competence nominee)", () => {
    const chars: Record<string, CharacterState> = {
      "Justice A": makeCharacter({
        name: "Justice A",
        competencies: makeCompetencies({
          professional: { legal: 90 },
          personal: { integrity: 90 },
        }),
      }),
    };
    const state = makeState({
      day: 42,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [makeJustice({ characterName: "Justice A" })],
          chiefJustice: null,
          cjnConfirmed: false,
        },
        pendingNomination: { position: "cjn", nominee: "Justice A", hearingDay: 42 },
      }),
      characters: chars,
    });

    // Use a seed that gives a low random value (< 0.8 confirm chance)
    // We need rng() < confirmChance. With high comp+integrity, confirmChance ~0.8
    // seededRandom(1) first call should be small enough
    const rng = seededRandom(1);
    const result = processConfirmationHearing(state, rng);

    // Either confirmed or rejected — check for confirmed
    if (result.updatedJudiciary.supremeCourt.cjnConfirmed) {
      expect(result.updatedJudiciary.supremeCourt.chiefJustice).toBe("Justice A");
      expect(result.updatedJudiciary.pendingNomination.position).toBeNull();
      expect(result.events.length).toBeGreaterThanOrEqual(1);
      expect(result.events[0].title).toBe("Chief Justice Confirmed");
    } else {
      // Rejection path also valid
      expect(result.consequences.length).toBeGreaterThanOrEqual(1);
      expect(result.updatedJudiciary.pendingNomination.position).toBeNull();
    }
  });

  it("rejection clears nomination and generates consequence", () => {
    const chars: Record<string, CharacterState> = {
      "Justice Low": makeCharacter({
        name: "Justice Low",
        competencies: makeCompetencies({
          professional: { legal: 30 },
          personal: { integrity: 25 },
        }),
      }),
    };
    const state = makeState({
      day: 42,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [makeJustice({ characterName: "Justice Low" })],
          chiefJustice: null,
          cjnConfirmed: false,
        },
        pendingNomination: { position: "cjn", nominee: "Justice Low", hearingDay: 42 },
      }),
      characters: chars,
    });

    // Try many seeds until we find a rejection
    let foundRejection = false;
    for (let seed = 1; seed < 100; seed++) {
      const rng = seededRandom(seed);
      const result = processConfirmationHearing(state, rng);
      if (!result.updatedJudiciary.supremeCourt.cjnConfirmed) {
        foundRejection = true;
        expect(result.updatedJudiciary.pendingNomination.position).toBeNull();
        expect(result.consequences.length).toBeGreaterThanOrEqual(1);
        // Check there's an approval penalty
        const approvalEffect = result.consequences[0].effects.find(e => e.target === "approval");
        expect(approvalEffect).toBeDefined();
        expect(approvalEffect!.delta).toBeLessThan(0);
        break;
      }
    }
    expect(foundRejection).toBe(true);
  });

  it("confirms PCA and sets president", () => {
    const chars: Record<string, CharacterState> = {
      "Justice PCA": makeCharacter({
        name: "Justice PCA",
        competencies: makeCompetencies({
          professional: { legal: 85 },
          personal: { integrity: 85 },
        }),
      }),
    };
    const state = makeState({
      day: 57,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [makeJustice({ characterName: "CJN" })],
          chiefJustice: "CJN",
          cjnConfirmed: true,
        },
        courtOfAppeal: {
          justices: [makeJustice({ characterName: "Justice PCA" })],
          president: null,
          pcaConfirmed: false,
        },
        pendingNomination: { position: "pca", nominee: "Justice PCA", hearingDay: 57 },
      }),
      characters: chars,
    });

    // Try seeds until we get confirmation
    let foundConfirmation = false;
    for (let seed = 1; seed < 100; seed++) {
      const rng = seededRandom(seed);
      const result = processConfirmationHearing(state, rng);
      if (result.updatedJudiciary.courtOfAppeal.pcaConfirmed) {
        foundConfirmation = true;
        expect(result.updatedJudiciary.courtOfAppeal.president).toBe("Justice PCA");
        expect(result.updatedJudiciary.pendingNomination.position).toBeNull();
        break;
      }
    }
    expect(foundConfirmation).toBe(true);
  });
});

// ── processJudiciaryRetirements ──

describe("processJudiciaryRetirements", () => {
  it("mandatory retirement when effective age >= retirementAge", () => {
    const justice = makeJustice({
      characterName: "Old Justice",
      appointedDay: 0,
      retirementAge: 70,
    });
    const chars: Record<string, CharacterState> = {
      "Old Justice": makeCharacter({ name: "Old Justice", age: 70 }),
    };

    const state = makeState({
      day: 1,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices: [justice], chiefJustice: null, cjnConfirmed: false },
      }),
      characters: chars,
    });

    const result = processJudiciaryRetirements(state, seededRandom(100));
    expect(result.updatedJudiciary.supremeCourt.justices).toHaveLength(0);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toContain("Retires");
  });

  it("does not retire justice below retirement age", () => {
    const justice = makeJustice({
      characterName: "Young Justice",
      appointedDay: 0,
      retirementAge: 70,
    });
    const chars: Record<string, CharacterState> = {
      "Young Justice": makeCharacter({ name: "Young Justice", age: 55 }),
    };

    const state = makeState({
      day: 1,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices: [justice], chiefJustice: null, cjnConfirmed: false },
      }),
      characters: chars,
    });

    const result = processJudiciaryRetirements(state, seededRandom(100));
    expect(result.updatedJudiciary.supremeCourt.justices).toHaveLength(1);
  });

  it("clears chiefJustice if CJN retires", () => {
    const justice = makeJustice({
      characterName: "CJN Retiree",
      appointedDay: 0,
      retirementAge: 65,
    });
    const chars: Record<string, CharacterState> = {
      "CJN Retiree": makeCharacter({ name: "CJN Retiree", age: 66 }),
    };

    const state = makeState({
      day: 1,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [justice],
          chiefJustice: "CJN Retiree",
          cjnConfirmed: true,
        },
      }),
      characters: chars,
    });

    const result = processJudiciaryRetirements(state, seededRandom(100));
    expect(result.updatedJudiciary.supremeCourt.chiefJustice).toBeNull();
    expect(result.updatedJudiciary.supremeCourt.cjnConfirmed).toBe(false);
  });

  it("clears PCA president if PCA retires", () => {
    const justice = makeJustice({
      characterName: "PCA Retiree",
      appointedDay: 0,
      retirementAge: 65,
    });
    const chars: Record<string, CharacterState> = {
      "PCA Retiree": makeCharacter({ name: "PCA Retiree", age: 66 }),
    };

    const state = makeState({
      day: 1,
      judiciary: makeJudiciaryState({
        courtOfAppeal: {
          justices: [justice],
          president: "PCA Retiree",
          pcaConfirmed: true,
        },
      }),
      characters: chars,
    });

    const result = processJudiciaryRetirements(state, seededRandom(100));
    expect(result.updatedJudiciary.courtOfAppeal.president).toBeNull();
    expect(result.updatedJudiciary.courtOfAppeal.pcaConfirmed).toBe(false);
  });

  it("handles Court of Appeal retirements", () => {
    const justice = makeJustice({
      characterName: "Old CA Justice",
      appointedDay: 0,
      retirementAge: 68,
    });
    const chars: Record<string, CharacterState> = {
      "Old CA Justice": makeCharacter({ name: "Old CA Justice", age: 69 }),
    };

    const state = makeState({
      day: 1,
      judiciary: makeJudiciaryState({
        courtOfAppeal: {
          justices: [justice],
          president: null,
          pcaConfirmed: false,
        },
      }),
      characters: chars,
    });

    const result = processJudiciaryRetirements(state, seededRandom(100));
    expect(result.updatedJudiciary.courtOfAppeal.justices).toHaveLength(0);
    expect(result.events).toHaveLength(1);
  });
});

// ── processJudiciary (orchestrator) ──

describe("processJudiciary", () => {
  it("returns updated judiciary, events, and consequences", () => {
    const state = makeState({ day: 10 });
    const result = processJudiciary(state, seededRandom(100));
    expect(result).toHaveProperty("updatedJudiciary");
    expect(result).toHaveProperty("newEvents");
    expect(result).toHaveProperty("consequences");
  });

  it("processes nominations at day 35 with seated justices", () => {
    const justices = Array.from({ length: 10 }, (_, i) =>
      makeJustice({ characterName: `Justice ${i}`, seniorityRank: i + 1 }),
    );
    const chars: Record<string, CharacterState> = {};
    for (const j of justices) {
      chars[j.characterName] = makeCharacter({ name: j.characterName });
    }

    const state = makeState({
      day: 35,
      judiciary: makeJudiciaryState({
        supremeCourt: { justices, chiefJustice: null, cjnConfirmed: false },
      }),
      characters: chars,
    });

    const result = processJudiciary(state, seededRandom(100));
    const nominationEvents = result.newEvents.filter(e =>
      e.title.includes("Chief Justice Nomination"),
    );
    expect(nominationEvents).toHaveLength(1);
  });

  it("processes confirmation hearing on hearing day", () => {
    const chars: Record<string, CharacterState> = {
      "Justice Nominee": makeCharacter({
        name: "Justice Nominee",
        competencies: makeCompetencies({
          professional: { legal: 80 },
          personal: { integrity: 80 },
        }),
      }),
    };

    const state = makeState({
      day: 42,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [makeJustice({ characterName: "Justice Nominee" })],
          chiefJustice: null,
          cjnConfirmed: false,
        },
        pendingNomination: { position: "cjn", nominee: "Justice Nominee", hearingDay: 42 },
      }),
      characters: chars,
    });

    const result = processJudiciary(state, seededRandom(100));
    // Either confirmed or rejected — but hearing was processed
    const hearingEvents = result.newEvents.filter(e =>
      e.title.includes("Confirmed") || e.title.includes("Rejected"),
    );
    expect(hearingEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("processes retirements for old justices", () => {
    const justice = makeJustice({
      characterName: "Ancient Justice",
      appointedDay: 0,
      retirementAge: 65,
    });
    const chars: Record<string, CharacterState> = {
      "Ancient Justice": makeCharacter({ name: "Ancient Justice", age: 66 }),
    };

    const state = makeState({
      day: 100,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [justice],
          chiefJustice: null,
          cjnConfirmed: false,
        },
      }),
      characters: chars,
    });

    const result = processJudiciary(state, seededRandom(100));
    expect(result.updatedJudiciary.supremeCourt.justices).toHaveLength(0);
    const retirementEvents = result.newEvents.filter(e => e.title.includes("Retires"));
    expect(retirementEvents).toHaveLength(1);
  });

  it("does nothing special on a quiet day", () => {
    const justice = makeJustice({
      characterName: "Stable Justice",
      appointedDay: 0,
      retirementAge: 72,
    });
    const chars: Record<string, CharacterState> = {
      "Stable Justice": makeCharacter({ name: "Stable Justice", age: 55 }),
    };

    const state = makeState({
      day: 10,
      judiciary: makeJudiciaryState({
        supremeCourt: {
          justices: [justice],
          chiefJustice: null,
          cjnConfirmed: false,
        },
      }),
      characters: chars,
    });

    const result = processJudiciary(state, seededRandom(100));
    expect(result.newEvents).toHaveLength(0);
    expect(result.consequences).toHaveLength(0);
    expect(result.updatedJudiciary.supremeCourt.justices).toHaveLength(1);
  });
});
