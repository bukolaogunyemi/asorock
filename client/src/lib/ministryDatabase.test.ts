import { describe, it, expect } from "vitest";
import { MINISTRY_DATABASE, getMinistryData } from "./ministryDatabase";

const EXPECTED_PORTFOLIOS = [
  "finance",
  "petroleum",
  "justice",
  "defence",
  "health",
  "works & housing",
  "education",
];

describe("MINISTRY_DATABASE", () => {
  it("has exactly 7 ministries", () => {
    expect(Object.keys(MINISTRY_DATABASE).length).toBe(7);
  });

  it("contains all 7 expected portfolios", () => {
    for (const portfolio of EXPECTED_PORTFOLIOS) {
      expect(MINISTRY_DATABASE[portfolio], `Missing ministry: ${portfolio}`).toBeDefined();
    }
  });

  it("every entry has all required fields", () => {
    for (const [key, data] of Object.entries(MINISTRY_DATABASE)) {
      expect(data.portfolio, `${key} missing portfolio`).toBeTruthy();
      expect(data.fullName, `${key} missing fullName`).toBeTruthy();
      expect(data.established, `${key} missing established`).toBeGreaterThan(0);
      expect(data.mandate.length, `${key} missing mandate`).toBeGreaterThan(20);
      expect(data.responsibilities.length, `${key} missing responsibilities`).toBeGreaterThan(0);
    }
  });
});

describe("getMinistryData", () => {
  it("finds Finance case-insensitively", () => {
    expect(getMinistryData("Finance")?.portfolio).toBe("Finance");
    expect(getMinistryData("finance")?.portfolio).toBe("Finance");
    expect(getMinistryData("FINANCE")?.portfolio).toBe("Finance");
  });

  it("finds Works & Housing", () => {
    expect(getMinistryData("Works & Housing")?.portfolio).toBe("Works & Housing");
    expect(getMinistryData("works & housing")?.portfolio).toBe("Works & Housing");
  });

  it("returns undefined for unknown ministry", () => {
    expect(getMinistryData("Magic")).toBeUndefined();
  });
});
