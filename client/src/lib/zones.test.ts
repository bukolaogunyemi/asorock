import { describe, expect, it } from "vitest";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";

describe("zones", () => {
  it("defines exactly 6 geopolitical zones", () => {
    expect(GEOPOLITICAL_ZONES).toHaveLength(6);
  });

  it("every zone has a name, abbrev, states array, and registered count", () => {
    for (const zone of GEOPOLITICAL_ZONES) {
      expect(zone.name).toBeTruthy();
      expect(zone.abbrev).toHaveLength(2);
      expect(zone.states.length).toBeGreaterThanOrEqual(5);
      expect(zone.registered).toBeGreaterThan(0);
    }
  });

  it("getZoneForState returns the correct zone", () => {
    expect(getZoneForState("Lagos")?.abbrev).toBe("SW");
    expect(getZoneForState("Kano")?.abbrev).toBe("NW");
    expect(getZoneForState("Borno")?.abbrev).toBe("NE");
    expect(getZoneForState("Enugu")?.abbrev).toBe("SE");
    expect(getZoneForState("Rivers")?.abbrev).toBe("SS");
    expect(getZoneForState("Plateau")?.abbrev).toBe("NC");
  });

  it("getZoneForState returns undefined for unknown state", () => {
    expect(getZoneForState("Atlantis")).toBeUndefined();
  });

  it("FCT maps to North-Central", () => {
    expect(getZoneForState("FCT")?.abbrev).toBe("NC");
  });
});
