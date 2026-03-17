import { describe, it, expect } from "vitest";
import { generateEconomyBriefing } from "./economyBriefing";
import type { GameState } from "./gameTypes";
import type { EconomicState } from "./economicTypes";

// Minimal state factory
function makeState(overrides: Partial<EconomicState> = {}): Partial<GameState> {
  return {
    day: 100,
    economy: {
      gdp: 500,
      sectors: [],
      gdpGrowthRate: 2,
      inflation: 12,
      unemploymentRate: 20,
      fxRate: 900,
      fxRateBaseline: 750,
      reserves: 30,
      debtToGdp: 30,
      oilOutput: 1.8,
      subsidyPressure: 0.3,
      crisisIndicators: {
        inflationZone: "green",
        unemploymentZone: "green",
        fxZone: "green",
        debtZone: "green",
        treasuryZone: "green",
        oilOutputZone: "green",
      },
      activeCascades: [],
      revenue: { total: 5, oil: 2, tax: 1.5, igr: 0.5, trade: 0.5, borrowing: 0.5 },
      expenditure: { total: 6, recurrent: 3, capital: 1.5, debtServicing: 1, transfers: 0.5 },
      treasuryLiquidity: 2,
      treasuryMonthsOfCover: 4,
      history: [],
      ...overrides,
    } as EconomicState,
    characters: {},
    appointments: [],
    lastActionAtDay: {},
  } as Partial<GameState>;
}

describe("generateEconomyBriefing", () => {
  it("returns an ActiveEvent with correct source", () => {
    const event = generateEconomyBriefing(makeState(), undefined, 75);
    expect(event.source).toBe("team-briefing");
    expect(event.category).toBe("economy");
  });

  it("generates 2-3 choices", () => {
    const event = generateEconomyBriefing(makeState(), undefined, 75);
    expect(event.choices.length).toBeGreaterThanOrEqual(2);
    expect(event.choices.length).toBeLessThanOrEqual(4);
  });

  it("generates inflation briefing when inflation > 20", () => {
    const event = generateEconomyBriefing(makeState({ inflation: 25 }), undefined, 75);
    expect(event.title).toContain("Inflation");
  });

  it("generates unemployment briefing when unemployment > 30", () => {
    const event = generateEconomyBriefing(makeState({ unemploymentRate: 35 }), undefined, 75);
    expect(event.title).toContain("Unemployment");
  });

  it("generates reserves briefing when reserves < 20", () => {
    const event = generateEconomyBriefing(makeState({ reserves: 15 }), undefined, 75);
    expect(event.title).toContain("Reserve");
  });

  it("generates crisis briefing when red indicator", () => {
    const event = generateEconomyBriefing(makeState({
      crisisIndicators: {
        inflationZone: "red",
        unemploymentZone: "green",
        fxZone: "green",
        debtZone: "green",
        treasuryZone: "green",
        oilOutputZone: "green",
      },
    }), undefined, 75);
    expect(event.severity).toBe("critical");
  });

  it("generates strategic briefing when no crises", () => {
    const event = generateEconomyBriefing(makeState(), undefined, 75);
    expect(event.title).toContain("Strategic");
  });

  it("generates subsection-specific briefing", () => {
    const event = generateEconomyBriefing(makeState(), "revenue", 75);
    expect(event.title).toContain("Revenue");
  });

  it("high competence team: all choices have visible context", () => {
    const event = generateEconomyBriefing(makeState(), undefined, 85);
    for (const choice of event.choices) {
      expect(choice.context).toBeTruthy();
    }
  });
});
