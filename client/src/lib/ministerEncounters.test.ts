import { describe, it, expect } from "vitest";
import { generateMinisterEncounter } from "./ministerEncounters";

const makeSector = (health: number) => ({
  id: "test",
  health,
  momentum: 0,
  turnsSinceAttention: 0,
  crisisZone: "green" as const,
  activeCascades: [],
  indicators: {},
});

const makeCharacter = (name: string, portfolio: string, relationship: string) => ({
  name,
  portfolio,
  avatar: "",
  relationship,
  competencies: { professional: {}, personal: {} },
  faction: "Technocrats",
  traits: ["Pragmatic"],
  hooks: [],
  careerHistory: [],
  interactionLog: [],
});

function makeMockState(overrides: Record<string, any> = {}) {
  return {
    day: 50,
    cabinetAppointments: {
      Health: "Dr. Amina",
      Defence: "Gen. Musa",
      "Foreign Affairs": "Amb. Chukwu",
    },
    characters: {
      "Dr. Amina": makeCharacter("Dr. Amina", "Health", "Friendly"),
      "Gen. Musa": makeCharacter("Gen. Musa", "Defence", "Wary"),
      "Amb. Chukwu": makeCharacter("Amb. Chukwu", "Foreign Affairs", "Neutral"),
    },
    ministerStatuses: {},
    healthSector: makeSector(55),
    ...overrides,
  } as any;
}

describe("generateMinisterEncounter", () => {
  it("returns null when summoned within 7 days", () => {
    const state = makeMockState({
      ministerStatuses: {
        "Dr. Amina": { lastSummonedDay: 45, lastDirectiveDay: 0, onProbation: false, probationStartDay: 0, appointmentDay: 10, pendingMemos: [] },
      },
    });
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).toBeNull();
  });

  it("returns null for unknown minister", () => {
    const state = makeMockState();
    const result = generateMinisterEncounter(state, "Unknown Person");
    expect(result).toBeNull();
  });

  it("returns null for character not in cabinet", () => {
    const state = makeMockState({
      characters: {
        ...makeMockState().characters,
        "Civilian Joe": makeCharacter("Civilian Joe", "", "Neutral"),
      },
    });
    const result = generateMinisterEncounter(state, "Civilian Joe");
    expect(result).toBeNull();
  });

  it("returns event with 2-4 choices for valid minister", () => {
    const state = makeMockState();
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
    expect(result!.choices.length).toBeGreaterThanOrEqual(2);
    expect(result!.choices.length).toBeLessThanOrEqual(4);
    expect(result!.source).toBe("minister-summons");
    expect(result!.id).toContain("minister-summons");
  });

  it("generates urgent tone when sector health < 30", () => {
    const state = makeMockState({ healthSector: makeSector(15) });
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
    expect(result!.severity).toBe("critical");
    // Check for crisis-related language in title or description
    const text = (result!.title + " " + result!.description).toLowerCase();
    expect(
      text.includes("emergency") || text.includes("crisis") || text.includes("collapse") ||
      text.includes("urgent") || text.includes("sos") || text.includes("freefall") ||
      text.includes("breakdown"),
    ).toBe(true);
  });

  it("generates confident tone when sector health > 70", () => {
    const state = makeMockState({ healthSector: makeSector(85) });
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
    expect(result!.severity).toBe("info");
    const text = (result!.title + " " + result!.description).toLowerCase();
    expect(
      text.includes("expansion") || text.includes("success") || text.includes("ambition") ||
      text.includes("vision") || text.includes("commendation") || text.includes("excellence") ||
      text.includes("milestone"),
    ).toBe(true);
  });

  it("uses defensive framing when relationship is Wary/Hostile", () => {
    const state = makeMockState({
      characters: {
        ...makeMockState().characters,
        "Dr. Amina": makeCharacter("Dr. Amina", "Health", "Wary"),
      },
    });
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
    expect(result!.description).toContain("tension");
  });

  it("uses warm framing when relationship is Friendly/Loyal", () => {
    const state = makeMockState({
      characters: {
        ...makeMockState().characters,
        "Dr. Amina": makeCharacter("Dr. Amina", "Health", "Loyal"),
      },
    });
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
    expect(result!.description).toContain("warmly");
  });

  it("non-sector minister gets generic encounter", () => {
    const state = makeMockState();
    const result = generateMinisterEncounter(state, "Gen. Musa");
    expect(result).not.toBeNull();
    expect(result!.source).toBe("minister-summons");
    expect(result!.category).toBe("security"); // Defence -> security
    expect(result!.choices.length).toBeGreaterThanOrEqual(2);
  });

  it("Foreign Affairs minister gets diplomacy category", () => {
    const state = makeMockState();
    const result = generateMinisterEncounter(state, "Amb. Chukwu");
    expect(result).not.toBeNull();
    expect(result!.category).toBe("diplomacy");
  });

  it("choices have valid consequence structure", () => {
    const state = makeMockState();
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
    for (const choice of result!.choices) {
      expect(choice.id).toBeDefined();
      expect(choice.label).toBeDefined();
      expect(choice.consequences.length).toBeGreaterThanOrEqual(1);
      const c = choice.consequences[0];
      expect(c.sourceEvent).toBe(result!.id);
      expect(c.effects.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("allows summon after cooldown expires", () => {
    const state = makeMockState({
      day: 60,
      ministerStatuses: {
        "Dr. Amina": { lastSummonedDay: 50, lastDirectiveDay: 0, onProbation: false, probationStartDay: 0, appointmentDay: 10, pendingMemos: [] },
      },
    });
    const result = generateMinisterEncounter(state, "Dr. Amina");
    expect(result).not.toBeNull();
  });
});
