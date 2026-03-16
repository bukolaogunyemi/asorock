import { describe, it, expect } from "vitest";
import {
  CONSTITUTIONAL_OFFICE_DATABASE,
  getConstitutionalOfficeData,
} from "./constitutionalOfficeDatabase";
import { POSITION_NAMES } from "./constitutionalOfficers";

describe("CONSTITUTIONAL_OFFICE_DATABASE", () => {
  it("has exactly 5 offices", () => {
    expect(Object.keys(CONSTITUTIONAL_OFFICE_DATABASE).length).toBe(5);
  });

  it("contains entries for all POSITION_NAMES", () => {
    for (const positionName of POSITION_NAMES) {
      expect(
        getConstitutionalOfficeData(positionName),
        `Missing office data for "${positionName}"`
      ).toBeDefined();
    }
  });

  it("every entry has all required fields", () => {
    for (const [key, data] of Object.entries(CONSTITUTIONAL_OFFICE_DATABASE)) {
      expect(data.positionName, `${key} missing positionName`).toBeTruthy();
      expect(data.fullTitle, `${key} missing fullTitle`).toBeTruthy();
      expect(data.description.length, `${key} missing description`).toBeGreaterThan(20);
      expect(data.keyPowers.length, `${key} missing keyPowers`).toBeGreaterThan(0);
    }
  });

  it("positionName fields match POSITION_NAMES exactly", () => {
    for (const positionName of POSITION_NAMES) {
      const data = getConstitutionalOfficeData(positionName);
      expect(data?.positionName).toBe(positionName);
    }
  });
});

describe("getConstitutionalOfficeData", () => {
  it("finds Senate President by exact name", () => {
    expect(getConstitutionalOfficeData("Senate President")?.positionName).toBe("Senate President");
  });

  it("finds Chief Justice of Nigeria", () => {
    expect(getConstitutionalOfficeData("Chief Justice of Nigeria")?.positionName).toBe(
      "Chief Justice of Nigeria"
    );
  });

  it("returns undefined for unknown office", () => {
    expect(getConstitutionalOfficeData("Grand Vizier")).toBeUndefined();
  });
});
