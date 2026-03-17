import { describe, it, expect } from "vitest";
import {
  DIRECTIVES,
  getAvailableDirectives,
  canIssueDirective,
  applyDirective,
} from "./ministerDirectives";
import type { GameState, MinisterStatus } from "./gameTypes";

function makeMinisterStatus(overrides: Partial<MinisterStatus> = {}): MinisterStatus {
  return {
    lastSummonedDay: 0,
    lastDirectiveDay: 0,
    onProbation: false,
    probationStartDay: 0,
    appointmentDay: 1,
    pendingMemos: [],
    ...overrides,
  };
}

function makeMinimalState(overrides: Partial<GameState> = {}): GameState {
  return {
    day: 10,
    approval: 50,
    treasury: 500,
    stability: 60,
    trust: 50,
    outrage: 10,
    politicalCapital: 40,
    stress: 20,
    health: 80,
    ministerStatuses: {},
    cabinetAppointments: {},
    ...overrides,
  } as unknown as GameState;
}

describe("getAvailableDirectives", () => {
  it("returns 2-3 directives for each portfolio", () => {
    const portfolios = Object.keys(DIRECTIVES);
    expect(portfolios.length).toBe(16);
    for (const portfolio of portfolios) {
      const directives = getAvailableDirectives(portfolio);
      expect(directives.length).toBeGreaterThanOrEqual(2);
      expect(directives.length).toBeLessThanOrEqual(3);
    }
  });

  it("returns empty array for unknown portfolio", () => {
    expect(getAvailableDirectives("Nonexistent")).toEqual([]);
  });
});

describe("canIssueDirective", () => {
  it("returns true when cooldown has expired", () => {
    const status = makeMinisterStatus({ lastDirectiveDay: 5 });
    expect(canIssueDirective(status, 8)).toBe(true);
    expect(canIssueDirective(status, 10)).toBe(true);
  });

  it("returns false when within 3-day cooldown", () => {
    const status = makeMinisterStatus({ lastDirectiveDay: 5 });
    expect(canIssueDirective(status, 6)).toBe(false);
    expect(canIssueDirective(status, 7)).toBe(false);
  });
});

describe("applyDirective", () => {
  it("returns effects and updates lastDirectiveDay", () => {
    const state = makeMinimalState({
      day: 10,
      stability: 60,
      ministerStatuses: {
        "Ngozi Okonjo": makeMinisterStatus({ lastDirectiveDay: 1 }),
      },
    });

    const effects = applyDirective(state, "Ngozi Okonjo", "fin-tighten");

    expect(effects.length).toBe(1);
    expect(effects[0].target).toBe("stability");
    expect(effects[0].delta).toBe(2);
    expect(state.stability).toBe(62);
    expect(state.ministerStatuses["Ngozi Okonjo"].lastDirectiveDay).toBe(10);
  });

  it("returns empty array for unknown directive", () => {
    const state = makeMinimalState({
      ministerStatuses: {
        "Test Minister": makeMinisterStatus(),
      },
    });

    const effects = applyDirective(state, "Test Minister", "nonexistent-id");
    expect(effects).toEqual([]);
  });
});
