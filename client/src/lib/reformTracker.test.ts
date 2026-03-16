import { describe, it, expect } from "vitest";
import { computeReformDelta, tickReforms, isReformEnabled } from "./reformTracker";
import type { PolicyLeverState, ReformProgress } from "./gameTypes";

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

describe("isReformEnabled", () => {
  it("subsidy reform enabled when fuelSubsidy is targeted", () => {
    expect(isReformEnabled("subsidy-reform", makeLevers({ fuelSubsidy: "targeted" }))).toBe(true);
  });

  it("subsidy reform enabled when fuelSubsidy is removed", () => {
    expect(isReformEnabled("subsidy-reform", makeLevers({ fuelSubsidy: "removed" }))).toBe(true);
  });

  it("subsidy reform NOT enabled when fuelSubsidy is full", () => {
    expect(isReformEnabled("subsidy-reform", makeLevers({ fuelSubsidy: "full" }))).toBe(false);
  });

  it("tax modernisation enabled when taxRate is elevated", () => {
    expect(isReformEnabled("tax-modernisation", makeLevers({ taxRate: "elevated" }))).toBe(true);
  });

  it("trade liberalisation requires BOTH conditions", () => {
    expect(isReformEnabled("trade-liberalisation", makeLevers({ importTariffs: "open", fxPolicy: "free-float" }))).toBe(true);
    expect(isReformEnabled("trade-liberalisation", makeLevers({ importTariffs: "open", fxPolicy: "peg" }))).toBe(false);
    expect(isReformEnabled("trade-liberalisation", makeLevers({ importTariffs: "restrictive", fxPolicy: "free-float" }))).toBe(false);
  });
});

describe("computeReformDelta", () => {
  it("returns positive delta when enabled", () => {
    expect(computeReformDelta("subsidy-reform", makeLevers({ fuelSubsidy: "targeted" }))).toBe(2);
  });

  it("returns negative delta when not enabled", () => {
    expect(computeReformDelta("subsidy-reform", makeLevers({ fuelSubsidy: "full" }))).toBe(-1);
  });
});

describe("tickReforms", () => {
  it("lazily initializes missing reforms", () => {
    const result = tickReforms([], makeLevers({ fuelSubsidy: "targeted" }));
    expect(result).toHaveLength(3); // all 3 economy reforms
    const subsidy = result.find(r => r.id === "subsidy-reform")!;
    expect(subsidy.progress).toBe(2);
    expect(subsidy.status).toBe("active");
  });

  it("advances active reform", () => {
    const existing: ReformProgress[] = [
      { id: "subsidy-reform", progress: 50, turnsActive: 25, status: "active" },
    ];
    const result = tickReforms(existing, makeLevers({ fuelSubsidy: "targeted" }));
    const subsidy = result.find(r => r.id === "subsidy-reform")!;
    expect(subsidy.progress).toBe(52);
    expect(subsidy.turnsActive).toBe(26);
  });

  it("regresses stalled reform", () => {
    const existing: ReformProgress[] = [
      { id: "subsidy-reform", progress: 50, turnsActive: 25, status: "active" },
    ];
    const result = tickReforms(existing, makeLevers({ fuelSubsidy: "full" }));
    const subsidy = result.find(r => r.id === "subsidy-reform")!;
    expect(subsidy.progress).toBe(49);
    expect(subsidy.status).toBe("stalled");
  });

  it("caps progress at 0", () => {
    const existing: ReformProgress[] = [
      { id: "subsidy-reform", progress: 0, turnsActive: 0, status: "stalled" },
    ];
    const result = tickReforms(existing, makeLevers({ fuelSubsidy: "full" }));
    const subsidy = result.find(r => r.id === "subsidy-reform")!;
    expect(subsidy.progress).toBe(0);
  });

  it("caps progress at 100 and sets complete", () => {
    const existing: ReformProgress[] = [
      { id: "subsidy-reform", progress: 99, turnsActive: 49, status: "active" },
    ];
    const result = tickReforms(existing, makeLevers({ fuelSubsidy: "targeted" }));
    const subsidy = result.find(r => r.id === "subsidy-reform")!;
    expect(subsidy.progress).toBe(100);
    expect(subsidy.status).toBe("complete");
  });

  it("does not regress a completed reform", () => {
    const existing: ReformProgress[] = [
      { id: "subsidy-reform", progress: 100, turnsActive: 50, status: "complete" },
    ];
    const result = tickReforms(existing, makeLevers({ fuelSubsidy: "full" }));
    const subsidy = result.find(r => r.id === "subsidy-reform")!;
    expect(subsidy.progress).toBe(100);
    expect(subsidy.status).toBe("complete");
  });
});
