import { describe, expect, it } from "vitest";
import { MEDIA_OUTLETS, getOutletsByRegion, getStateOwnedOutlets } from "./mediaOutlets";

describe("mediaOutlets", () => {
  it("defines at least 27 outlets", () => {
    expect(MEDIA_OUTLETS.length).toBeGreaterThanOrEqual(27);
  });

  it("every outlet has required fields", () => {
    for (const outlet of MEDIA_OUTLETS) {
      expect(outlet.id).toBeTruthy();
      expect(outlet.name).toBeTruthy();
      expect(outlet.type).toBeTruthy();
      expect(outlet.ownership).toMatch(/^(private|state-owned)$/);
      expect(outlet.reach).toBeGreaterThanOrEqual(0);
      expect(outlet.reach).toBeLessThanOrEqual(100);
      expect(outlet.credibility).toBeGreaterThanOrEqual(0);
      expect(outlet.credibility).toBeLessThanOrEqual(100);
    }
  });

  it("getOutletsByRegion returns regional outlets", () => {
    const sw = getOutletsByRegion("south-west");
    expect(sw.length).toBeGreaterThanOrEqual(3);
    expect(sw.some((o) => o.name === "Oodua Times")).toBe(true);
  });

  it("getStateOwnedOutlets returns exactly 3", () => {
    const stateOwned = getStateOwnedOutlets();
    expect(stateOwned).toHaveLength(3);
    stateOwned.forEach((o) => expect(o.ownership).toBe("state-owned"));
  });
});
