import { describe, it, expect } from "vitest";
import { computeEconomySummary } from "./sectorHealthSummary";
import type { EconomicState } from "./economicTypes";

function makeEconomy(overrides: Partial<EconomicState["crisisIndicators"]> & { inflation?: number; fxRate?: number; gdpGrowthRate?: number }): EconomicState {
  const { inflation, fxRate, gdpGrowthRate, ...zones } = overrides;
  return {
    gdp: 500,
    sectors: [],
    gdpGrowthRate: gdpGrowthRate ?? 2.0,
    unemploymentRate: 25,
    revenue: { oil: 1, tax: 0.8, igr: 0.3, trade: 0.2, borrowing: 0.5, total: 2.8 },
    expenditure: { total: 3, recurrent: 1.5, capital: 0.8, debtServicing: 0.5, transfers: 0.2 },
    inflation: inflation ?? 15,
    fxRate: fxRate ?? 1200,
    fxRateBaseline: 1200,
    treasuryLiquidity: 1.2,
    treasuryMonthsOfCover: 4,
    reserves: 30,
    debtToGdp: 35,
    oilOutput: 1.8,
    subsidyPressure: 0.4,
    crisisIndicators: {
      inflationZone: "green",
      unemploymentZone: "green",
      fxZone: "green",
      debtZone: "green",
      treasuryZone: "green",
      oilOutputZone: "green",
      ...zones,
    },
    activeCascades: [],
    history: [],
  } as EconomicState;
}

describe("computeEconomySummary", () => {
  it("returns green status when all zones are green", () => {
    const result = computeEconomySummary(makeEconomy({}));
    expect(result.status).toBe("green");
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it("returns amber status when one zone is yellow", () => {
    const result = computeEconomySummary(makeEconomy({ inflationZone: "yellow" }));
    expect(result.status).toBe("amber");
  });

  it("returns amber status when one zone is red", () => {
    const result = computeEconomySummary(makeEconomy({ fxZone: "red" }));
    expect(result.status).toBe("amber");
  });

  it("returns red status when two or more zones are red", () => {
    const result = computeEconomySummary(makeEconomy({
      inflationZone: "red",
      fxZone: "red",
      inflation: 32,
      fxRate: 1800,
    }));
    expect(result.status).toBe("red");
    expect(result.summary).toContain("crisis");
  });

  it("interpolates actual values into the summary", () => {
    const result = computeEconomySummary(makeEconomy({
      inflationZone: "red",
      fxZone: "red",
      inflation: 32,
      fxRate: 1800,
    }));
    expect(result.summary).toMatch(/32/);
  });
});
