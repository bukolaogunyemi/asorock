import { describe, it, expect } from "vitest";
import { STATE_DATABASE, getStateData } from "./stateDatabase";
import { GEOPOLITICAL_ZONES } from "./zones";

describe("STATE_DATABASE", () => {
  const allStates = GEOPOLITICAL_ZONES.flatMap(z => z.states);

  it("has entries for all 37 states", () => {
    expect(Object.keys(STATE_DATABASE).length).toBe(37);
  });

  it("every zone state has a database entry", () => {
    for (const state of allStates) {
      expect(getStateData(state), `Missing data for ${state}`).toBeDefined();
    }
  });

  it("every entry has all required fields", () => {
    for (const [key, data] of Object.entries(STATE_DATABASE)) {
      expect(data.name, `${key} missing name`).toBeTruthy();
      expect(data.capital, `${key} missing capital`).toBeTruthy();
      expect(data.yearCreated, `${key} missing yearCreated`).toBeGreaterThan(0);
      expect(data.zone, `${key} missing zone`).toBeTruthy();
      expect(data.lgaCount, `${key} missing lgaCount`).toBeGreaterThan(0);
      expect(data.population, `${key} missing population`).toBeTruthy();
      expect(data.ethnicGroups.length, `${key} missing ethnicGroups`).toBeGreaterThan(0);
      expect(data.keyEconomies.length, `${key} missing keyEconomies`).toBeGreaterThan(0);
      expect(data.description.length, `${key} missing description`).toBeGreaterThan(20);
    }
  });

  it("zone assignments match GEOPOLITICAL_ZONES", () => {
    for (const zone of GEOPOLITICAL_ZONES) {
      for (const state of zone.states) {
        expect(getStateData(state)?.zone, `${state} zone mismatch`).toBe(zone.name);
      }
    }
  });
});

describe("getStateData", () => {
  it("finds Lagos case-insensitively", () => {
    expect(getStateData("Lagos")?.capital).toBe("Ikeja");
    expect(getStateData("lagos")?.capital).toBe("Ikeja");
    expect(getStateData("LAGOS")?.capital).toBe("Ikeja");
  });

  it("returns undefined for unknown state", () => {
    expect(getStateData("Atlantis")).toBeUndefined();
  });
});
