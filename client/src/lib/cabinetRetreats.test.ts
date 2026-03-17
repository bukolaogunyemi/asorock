import { describe, it, expect } from "vitest";
import {
  isRetreatDue,
  isOctoberBudgetMonth,
  applyRetreatEffects,
} from "./cabinetRetreats";
import type { GameState } from "./gameTypes";

const mockSector = () => ({
  id: "test",
  health: 50,
  momentum: 0,
  turnsSinceAttention: 0,
  crisisZone: "green" as const,
  activeCascades: [],
  indicators: {},
});

function makeMinimalState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 100,
    characters: {},
    cabinetAppointments: {},
    ministerStatuses: {},
    cabinetRetreats: {
      lastRetreatDay: 0,
      priorities: [],
      lastFECDay: 0,
      fecCooldownUntil: 0,
      pendingFECMemos: [],
    },
    healthSector: mockSector(),
    infrastructure: mockSector(),
    education: mockSector(),
    agriculture: mockSector(),
    interior: mockSector(),
    environment: mockSector(),
    youthEmployment: mockSector(),
    ...overrides,
  } as unknown as GameState;
}

describe("isRetreatDue", () => {
  it("returns false when less than 90 days since last retreat", () => {
    expect(isRetreatDue(50, 100)).toBe(false);
  });

  it("returns true when 90+ days since last retreat", () => {
    expect(isRetreatDue(10, 100)).toBe(true);
    expect(isRetreatDue(10, 100)).toBe(true);
  });

  it("returns false during cabinet formation (day <= 30)", () => {
    expect(isRetreatDue(0, 25)).toBe(false);
    expect(isRetreatDue(0, 30)).toBe(false);
  });

  it("returns true when lastRetreatDay is 0 and currentDay > 90", () => {
    expect(isRetreatDue(0, 91)).toBe(true);
  });
});

describe("isOctoberBudgetMonth", () => {
  it("returns true for days in October range", () => {
    expect(isOctoberBudgetMonth(126)).toBe(true); // day 125 in year
    expect(isOctoberBudgetMonth(140)).toBe(true);
    expect(isOctoberBudgetMonth(156)).toBe(true); // day 155 in year
  });

  it("returns false for days outside October range", () => {
    expect(isOctoberBudgetMonth(50)).toBe(false);
    expect(isOctoberBudgetMonth(200)).toBe(false);
    expect(isOctoberBudgetMonth(1)).toBe(false);
  });
});

describe("applyRetreatEffects", () => {
  it("boosts momentum for prioritized sectors", () => {
    const state = makeMinimalState();
    applyRetreatEffects(state, ["healthSector", "education"]);

    expect(state.healthSector.momentum).toBe(2);
    expect(state.education.momentum).toBe(2);
    expect(state.infrastructure.momentum).toBe(0);
  });

  it("skips economy when applying momentum", () => {
    const state = makeMinimalState();
    applyRetreatEffects(state, ["economy", "healthSector"]);

    expect(state.healthSector.momentum).toBe(2);
    // economy is not a GovernanceSectorState, should not crash
  });

  it("boosts loyalty for all ministers, extra for prioritized", () => {
    const state = makeMinimalState({
      characters: {
        "Dr. Aisha": {
          name: "Dr. Aisha",
          portfolio: "Health",
          loyalty: 50,
        } as any,
        "Mr. Bello": {
          name: "Mr. Bello",
          portfolio: "Defence",
          loyalty: 50,
        } as any,
      },
      cabinetAppointments: {
        Health: "Dr. Aisha",
        Defence: "Mr. Bello",
      },
    });

    applyRetreatEffects(state, ["healthSector"]);

    // Dr. Aisha: +3 base + 5 priority = 58
    expect(state.characters["Dr. Aisha"].loyalty).toBe(58);
    // Mr. Bello: +3 base only (Defence maps to null)
    expect(state.characters["Mr. Bello"].loyalty).toBe(53);
  });

  it("caps loyalty at 100", () => {
    const state = makeMinimalState({
      characters: {
        "Dr. Aisha": {
          name: "Dr. Aisha",
          portfolio: "Health",
          loyalty: 98,
        } as any,
      },
      cabinetAppointments: { Health: "Dr. Aisha" },
    });

    applyRetreatEffects(state, ["healthSector"]);
    expect(state.characters["Dr. Aisha"].loyalty).toBe(100);
  });

  it("updates lastRetreatDay and priorities", () => {
    const state = makeMinimalState({ day: 180 });
    applyRetreatEffects(state, ["infrastructure", "agriculture"]);

    expect(state.cabinetRetreats.lastRetreatDay).toBe(180);
    expect(state.cabinetRetreats.priorities).toEqual([
      "infrastructure",
      "agriculture",
    ]);
  });
});
