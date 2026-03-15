import { describe, it, expect } from "vitest";
import { computeStakeholderSentiment, type StakeholderSentiment } from "./stakeholderSentiment";
import type { PolicyLeverState } from "./gameTypes";
import type { EconomicState } from "./economicTypes";

function makeLevers(overrides: Partial<Record<string, string>> = {}): PolicyLeverState {
  const defaults: Record<string, { position: string; pendingPosition: null; cooldownUntilDay: number }> = {
    fuelSubsidy: { position: "full", pendingPosition: null, cooldownUntilDay: 0 },
    fxPolicy: { position: "managed-float", pendingPosition: null, cooldownUntilDay: 0 },
    interestRate: { position: "neutral", pendingPosition: null, cooldownUntilDay: 0 },
    taxRate: { position: "standard", pendingPosition: null, cooldownUntilDay: 0 },
    cashTransfers: { position: "minimal", pendingPosition: null, cooldownUntilDay: 0 },
    importTariffs: { position: "moderate", pendingPosition: null, cooldownUntilDay: 0 },
    minimumWage: { position: "modest", pendingPosition: null, cooldownUntilDay: 0 },
    publicSectorHiring: { position: "normal", pendingPosition: null, cooldownUntilDay: 0 },
    electricityTariff: { position: "cost-reflective", pendingPosition: null, cooldownUntilDay: 0 },
  };
  for (const [k, v] of Object.entries(overrides)) {
    defaults[k] = { ...defaults[k], position: v! };
  }
  return defaults as unknown as PolicyLeverState;
}

function makeEconomy(overrides: Partial<EconomicState> = {}): Partial<EconomicState> {
  return { inflation: 12, unemploymentRate: 20, fxRate: 900, reserves: 30, debtToGdp: 30, ...overrides };
}

describe("computeStakeholderSentiment", () => {
  describe("IMF", () => {
    it("supportive when free-float + targeted subsidy + standard tax", () => {
      const result = computeStakeholderSentiment("imf", makeLevers({ fxPolicy: "free-float", fuelSubsidy: "targeted", taxRate: "standard" }), makeEconomy());
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when peg", () => {
      const result = computeStakeholderSentiment("imf", makeLevers({ fxPolicy: "peg" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
    it("opposed when full subsidy", () => {
      const result = computeStakeholderSentiment("imf", makeLevers({ fuelSubsidy: "full" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
    it("cautious when managed-float", () => {
      const result = computeStakeholderSentiment("imf", makeLevers({ fxPolicy: "managed-float", fuelSubsidy: "targeted", taxRate: "standard" }), makeEconomy());
      expect(result.sentiment).toBe("cautious");
    });
  });
  describe("World Bank", () => {
    it("supportive when moderate cash transfers and low inflation", () => {
      const result = computeStakeholderSentiment("world-bank", makeLevers({ cashTransfers: "moderate" }), makeEconomy({ inflation: 10 }));
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when no transfers and high unemployment", () => {
      const result = computeStakeholderSentiment("world-bank", makeLevers({ cashTransfers: "none" }), makeEconomy({ unemploymentRate: 35 }));
      expect(result.sentiment).toBe("opposed");
    });
  });
  describe("Business Community", () => {
    it("supportive when low tax, moderate tariffs, float FX", () => {
      const result = computeStakeholderSentiment("business", makeLevers({ taxRate: "low", importTariffs: "moderate", fxPolicy: "managed-float" }), makeEconomy());
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when high tax", () => {
      const result = computeStakeholderSentiment("business", makeLevers({ taxRate: "high" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
  });
  describe("Labour Unions", () => {
    it("supportive when union-demand wage and normal hiring", () => {
      const result = computeStakeholderSentiment("labour", makeLevers({ minimumWage: "union-demand", publicSectorHiring: "normal" }), makeEconomy());
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when subsidy removed and minimal transfers", () => {
      const result = computeStakeholderSentiment("labour", makeLevers({ fuelSubsidy: "removed", cashTransfers: "minimal" }), makeEconomy());
      expect(result.sentiment).toBe("opposed");
    });
  });
  describe("Market Analysts", () => {
    it("supportive when reserves high, debt low, inflation low", () => {
      const result = computeStakeholderSentiment("analysts", makeLevers(), makeEconomy({ reserves: 35, debtToGdp: 30, inflation: 10 }));
      expect(result.sentiment).toBe("supportive");
    });
    it("opposed when reserves critically low", () => {
      const result = computeStakeholderSentiment("analysts", makeLevers(), makeEconomy({ reserves: 10 }));
      expect(result.sentiment).toBe("opposed");
    });
  });
  it("returns a quote string", () => {
    const result = computeStakeholderSentiment("imf", makeLevers(), makeEconomy());
    expect(result.quote).toBeTruthy();
    expect(typeof result.quote).toBe("string");
  });
});
