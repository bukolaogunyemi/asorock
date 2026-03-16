import { describe, it, expect } from "vitest";
import { AGENCY_DATABASE, getAgencyData } from "./agencyDatabase";

const EXPECTED_STRATEGIC = ["nnpc", "cbn", "efcc", "nia"];
const EXPECTED_STANDARD = ["inec", "ncc", "nimasa", "nddc"];
const EXPECTED_ROUTINE = ["nafdac", "nimc", "nbs", "nesrea"];
const ALL_EXPECTED = [...EXPECTED_STRATEGIC, ...EXPECTED_STANDARD, ...EXPECTED_ROUTINE];

describe("AGENCY_DATABASE", () => {
  it("has exactly 12 agencies", () => {
    expect(Object.keys(AGENCY_DATABASE).length).toBe(12);
  });

  it("contains all 12 expected agency IDs", () => {
    for (const id of ALL_EXPECTED) {
      expect(AGENCY_DATABASE[id], `Missing agency: ${id}`).toBeDefined();
    }
  });

  it("every entry has all required fields", () => {
    for (const [key, data] of Object.entries(AGENCY_DATABASE)) {
      expect(data.id, `${key} missing id`).toBeTruthy();
      expect(data.fullName, `${key} missing fullName`).toBeTruthy();
      expect(data.acronym, `${key} missing acronym`).toBeTruthy();
      expect(data.established, `${key} missing established`).toBeGreaterThan(0);
      expect(data.mandate.length, `${key} missing mandate`).toBeGreaterThan(20);
      expect(data.prestigeTier, `${key} missing prestigeTier`).toBeTruthy();
    }
  });

  it("strategic agencies have correct tier", () => {
    for (const id of EXPECTED_STRATEGIC) {
      expect(AGENCY_DATABASE[id]?.prestigeTier).toBe("strategic");
    }
  });

  it("standard agencies have correct tier", () => {
    for (const id of EXPECTED_STANDARD) {
      expect(AGENCY_DATABASE[id]?.prestigeTier).toBe("standard");
    }
  });

  it("routine agencies have correct tier", () => {
    for (const id of EXPECTED_ROUTINE) {
      expect(AGENCY_DATABASE[id]?.prestigeTier).toBe("routine");
    }
  });
});

describe("getAgencyData", () => {
  it("finds NNPC by id", () => {
    expect(getAgencyData("nnpc")?.acronym).toBe("NNPC");
    expect(getAgencyData("NNPC")?.acronym).toBe("NNPC");
  });

  it("returns undefined for unknown agency", () => {
    expect(getAgencyData("xyz")).toBeUndefined();
  });
});
