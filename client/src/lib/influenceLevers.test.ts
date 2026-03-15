import { describe, expect, it } from "vitest";
import { getInfluenceLevers, getLeverById } from "./influenceLevers";

describe("influenceLevers", () => {
  it("should define exactly 7 levers", () => {
    const levers = getInfluenceLevers();
    expect(levers.length).toBe(7);
  });

  it("should have unique IDs", () => {
    const levers = getInfluenceLevers();
    const ids = levers.map((l) => l.id);
    expect(new Set(ids).size).toBe(7);
  });

  it("back-channel deals should be unavailable for house bills", () => {
    const lever = getLeverById("back-channel");
    expect(lever).toBeDefined();
    expect(lever!.houseSwing).toBe(0);
  });

  it("each lever should have at least one cost", () => {
    const levers = getInfluenceLevers();
    for (const lever of levers) {
      expect(lever.costs.length).toBeGreaterThanOrEqual(1);
    }
  });
});
