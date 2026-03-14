// client/src/lib/ideologyPressure.test.ts
import { describe, expect, it } from "vitest";
import { calculateAlignmentChange, PARTY_LOYALTY_THRESHOLDS } from "./ideologyPressure";
import type { IdeologyProfile } from "./parties";

describe("calculateAlignmentChange", () => {
  const aduProfile: IdeologyProfile = {
    economic: 2, federalism: 1, social: 0, security: 1, welfare: -1, foreignPolicy: 2, cultural: 1,
  };

  it("returns positive loyalty change for on-brand decisions (distance 0-1)", () => {
    const result = calculateAlignmentChange(aduProfile, [{ dimension: "economic", value: 2 }]);
    expect(result.loyaltyChange).toBe(2);
    expect(result.severity).toBe("on-brand");
  });

  it("returns negative loyalty change for mild friction (distance 2)", () => {
    const result = calculateAlignmentChange(aduProfile, [{ dimension: "economic", value: 0 }]);
    expect(result.loyaltyChange).toBe(-3);
    expect(result.severity).toBe("mild-friction");
  });

  it("returns large negative for off-brand (distance 3)", () => {
    const result = calculateAlignmentChange(aduProfile, [{ dimension: "economic", value: -1 }]);
    expect(result.loyaltyChange).toBe(-6);
    expect(result.severity).toBe("off-brand");
  });

  it("returns extreme penalty for violations (distance 4)", () => {
    const result = calculateAlignmentChange(aduProfile, [{ dimension: "economic", value: -2 }]);
    expect(result.loyaltyChange).toBe(-12);
    expect(result.severity).toBe("extreme-violation");
  });

  it("sums across multiple dimensions", () => {
    const result = calculateAlignmentChange(aduProfile, [
      { dimension: "economic", value: 2 },
      { dimension: "economic", value: -2 },
    ]);
    expect(result.loyaltyChange).toBe(-10);
  });
});

describe("PARTY_LOYALTY_THRESHOLDS", () => {
  it("defines 4 threshold levels", () => {
    expect(Object.keys(PARTY_LOYALTY_THRESHOLDS)).toHaveLength(4);
  });
});
