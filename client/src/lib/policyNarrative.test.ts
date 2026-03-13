import { describe, it, expect } from "vitest";
import { classifyStance, COMBINATION_WARNINGS, getStanceKey } from "./policyNarrative";
import { eraPolicyPresets } from "./GameContext";

describe("classifyStance", () => {
  it("classifies 'full' as populist", () => {
    expect(classifyStance("full")).toBe("populist");
  });
  it("classifies 'removed' as reformist", () => {
    expect(classifyStance("removed")).toBe("reformist");
  });
  it("classifies 'partial' as neutral", () => {
    expect(classifyStance("partial")).toBe("neutral");
  });
});

describe("stance template selection", () => {
  it("1999 era (many populist positions) selects heavy-populist or leaning-populist", () => {
    const levers = eraPolicyPresets["1999"];
    const stanceKey = getStanceKey(levers);
    expect(stanceKey).toMatch(/populist/);
  });
});

describe("combination warnings", () => {
  it("fires hawkish + freeze warning", () => {
    const levers = { ...eraPolicyPresets["2023"] };
    levers.interestRate = { ...levers.interestRate, position: "hawkish" as any };
    levers.publicSectorHiring = { ...levers.publicSectorHiring, position: "freeze" as any };
    const warnings = COMBINATION_WARNINGS.filter(w => w.test(levers));
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0].message).toContain("recession");
  });

  it("fires subsidy removed + no transfers warning", () => {
    const levers = { ...eraPolicyPresets["2023"] };
    levers.fuelSubsidy = { ...levers.fuelSubsidy, position: "removed" as any };
    levers.cashTransfers = { ...levers.cashTransfers, position: "none" as any };
    const warnings = COMBINATION_WARNINGS.filter(w => w.test(levers));
    expect(warnings.length).toBeGreaterThanOrEqual(1);
    expect(warnings[0].message).toContain("protests");
  });
});
