// client/src/lib/constitutionalOfficers.test.ts
import { describe, expect, it, beforeAll } from "vitest";
import {
  selectConstitutionalOfficers,
  POSITION_NAMES,
  type ConstitutionalCandidate,
} from "./constitutionalOfficers";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";
import { registerConstitutionalPools } from "./constitutionalPools";

// Register real pools for testing
beforeAll(() => {
  registerConstitutionalPools();
});

describe("selectConstitutionalOfficers", () => {
  it("returns exactly 4 officers", () => {
    const officers = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    expect(officers).toHaveLength(4);
  });

  it("assigns correct portfolio names in order", () => {
    const officers = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    expect(officers[0].portfolio).toBe("Senate President");
    expect(officers[1].portfolio).toBe("Deputy Senate President");
    expect(officers[2].portfolio).toBe("Speaker of the House");
    expect(officers[3].portfolio).toBe("Deputy Speaker");
  });

  it("no officer comes from the president's zone", () => {
    const officers = selectConstitutionalOfficers("Kano", "Enugu", 99);
    const presidentZone = getZoneForState("Kano")!.name;
    for (const o of officers) {
      const officerZone = getZoneForState(o.state)!.name;
      expect(officerZone).not.toBe(presidentZone);
    }
  });

  it("no officer comes from the VP's zone", () => {
    const officers = selectConstitutionalOfficers("Kano", "Enugu", 99);
    const vpZone = getZoneForState("Enugu")!.name;
    for (const o of officers) {
      const officerZone = getZoneForState(o.state)!.name;
      expect(officerZone).not.toBe(vpZone);
    }
  });

  it("no two officers share the same zone (when president ≠ VP zone)", () => {
    // Kano=NW, Enugu=SE → 4 available zones for 4 positions — all unique
    const officers = selectConstitutionalOfficers("Kano", "Enugu", 42);
    const zones = officers.map((o) => getZoneForState(o.state)!.name);
    const unique = new Set(zones);
    expect(unique.size).toBe(4);
  });

  it("all 4 zones unique when president and VP share a zone", () => {
    // Lagos=SW, Ogun=SW → 5 available zones for 4 positions — all unique
    const officers = selectConstitutionalOfficers("Lagos", "Ogun", 42);
    const zones = officers.map((o) => getZoneForState(o.state)!.name);
    expect(new Set(zones).size).toBe(4);
  });

  it("is deterministic with the same inputs", () => {
    const a = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    const b = selectConstitutionalOfficers("Lagos", "Adamawa", 42);
    expect(a.map((o) => o.name)).toEqual(b.map((o) => o.name));
  });

  it("produces different zone assignments with different seeds", () => {
    const a = selectConstitutionalOfficers("Lagos", "Adamawa", 1);
    const b = selectConstitutionalOfficers("Lagos", "Adamawa", 9999);
    // Compare zone assignments (not names — placeholder pools have 1 candidate per zone)
    const aZones = a.map((o) => getZoneForState(o.state)!.name).join(",");
    const bZones = b.map((o) => getZoneForState(o.state)!.name).join(",");
    expect(aZones).not.toBe(bZones);
  });

  it("every officer has required fields", () => {
    const officers = selectConstitutionalOfficers("Rivers", "Sokoto", 77);
    for (const o of officers) {
      expect(o.name).toBeTruthy();
      expect(o.state).toBeTruthy();
      expect(o.age).toBeGreaterThanOrEqual(40);
      expect(o.gender).toMatch(/^(Male|Female)$/);
      expect(o.religion).toMatch(/^(Muslim|Christian)$/);
      expect(o.loyalty).toBeGreaterThanOrEqual(0);
      expect(o.competence).toBeGreaterThanOrEqual(0);
    }
  });

  it("end-to-end: officers come from diverse zones with real pools", () => {
    const officers = selectConstitutionalOfficers("Lagos", "Kano", 42);
    expect(officers).toHaveLength(4);
    const zones = officers.map((o) => getZoneForState(o.state)!.name);
    // Should not include SW (Lagos) or NW (Kano)
    for (const z of zones) {
      expect(z).not.toBe("South-West");
      expect(z).not.toBe("North-West");
    }
    // Should have real names, not placeholders
    for (const o of officers) {
      expect(o.name).not.toContain("Placeholder");
      expect(o.religion).toMatch(/^(Muslim|Christian)$/);
      expect(o.gender).toMatch(/^(Male|Female)$/);
      expect(o.age).toBeGreaterThanOrEqual(45);
      expect(o.age).toBeLessThanOrEqual(72);
    }
  });
});
