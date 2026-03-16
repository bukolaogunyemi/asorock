import { describe, it, expect } from "vitest";
import { COUNTRY_DATABASE, ECOWAS_DATA, getCountryData } from "./countryDatabase";

const EXPECTED_COUNTRIES = [
  "United States",
  "China",
  "United Kingdom",
  "Saudi Arabia",
  "France",
  "Germany",
  "United Arab Emirates",
  "South Africa",
  "Ghana",
  "India",
  "Brazil",
];

describe("COUNTRY_DATABASE", () => {
  it("has at least 11 countries", () => {
    expect(Object.keys(COUNTRY_DATABASE).length).toBeGreaterThanOrEqual(11);
  });

  it("contains all expected diplomatic partners", () => {
    for (const country of EXPECTED_COUNTRIES) {
      expect(
        getCountryData(country),
        `Missing country data for ${country}`
      ).toBeDefined();
    }
  });

  it("every entry has all required fields", () => {
    for (const [key, data] of Object.entries(COUNTRY_DATABASE)) {
      expect(data.name, `${key} missing name`).toBeTruthy();
      expect(data.capital, `${key} missing capital`).toBeTruthy();
      expect(data.population, `${key} missing population`).toBeTruthy();
      expect(data.gdp, `${key} missing gdp`).toBeTruthy();
      expect(data.headOfState, `${key} missing headOfState`).toBeTruthy();
      expect(data.region, `${key} missing region`).toBeTruthy();
      expect(data.keyExports.length, `${key} missing keyExports`).toBeGreaterThan(0);
      expect(data.nigeriaRelation.length, `${key} missing nigeriaRelation`).toBeGreaterThan(20);
      expect(data.description.length, `${key} missing description`).toBeGreaterThan(20);
    }
  });
});

describe("ECOWAS_DATA", () => {
  it("has all required fields", () => {
    expect(ECOWAS_DATA.name).toBeTruthy();
    expect(ECOWAS_DATA.headquarters).toBeTruthy();
    expect(ECOWAS_DATA.memberStates.length).toBeGreaterThan(0);
    expect(ECOWAS_DATA.secretaryGeneral).toBeTruthy();
    expect(ECOWAS_DATA.description.length).toBeGreaterThan(20);
  });

  it("includes Nigeria as a member state", () => {
    expect(ECOWAS_DATA.memberStates).toContain("Nigeria");
  });
});

describe("getCountryData", () => {
  it("finds United States by name", () => {
    expect(getCountryData("United States")?.capital).toBe("Washington D.C.");
  });

  it("finds United States by slug", () => {
    expect(getCountryData("united-states")?.capital).toBe("Washington D.C.");
  });

  it("returns undefined for unknown country", () => {
    expect(getCountryData("Wakanda")).toBeUndefined();
  });
});
