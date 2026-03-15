import { describe, expect, it } from "vitest";
import { calculateComplianceScore, calculateZoneBalances, getComplianceImpact, getConsequences, defaultFederalCharacterState } from "./federalCharacter";
import type { FederalAppointment } from "./federalCharacterTypes";

describe("federalCharacter", () => {
  describe("calculateZoneBalances", () => {
    it("should return perfect balance when appointments evenly distributed", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE", "SS"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const balances = calculateZoneBalances(appointments);
      for (const zone of Object.values(balances)) {
        expect(Math.abs(zone.deviation)).toBeLessThan(0.01);
      }
    });

    it("should show deviation when one zone dominates", () => {
      const appointments: FederalAppointment[] = Array.from({ length: 6 }, (_, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: "NW",
      }));
      const balances = calculateZoneBalances(appointments);
      expect(balances["NW"].deviation).toBeGreaterThan(0);
      expect(balances["SE"].deviation).toBeLessThan(0);
    });
  });

  describe("calculateComplianceScore", () => {
    it("should return high score for perfectly balanced appointments", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE", "SS"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const score = calculateComplianceScore(appointments, {});
      expect(score).toBeGreaterThanOrEqual(95);
    });

    it("should return low score when one zone has no appointments", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "strategic" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const score = calculateComplianceScore(appointments, {});
      expect(score).toBeLessThan(70);
    });

    it("prestige weighting: strategic appointments matter more", () => {
      const appointments: FederalAppointment[] = [
        ...Array.from({ length: 3 }, (_, i) => ({
          positionId: `r-${i}`, positionName: `Routine ${i}`,
          category: "ambassador" as const, prestigeTier: "routine" as const,
          appointeeId: `a-${i}`, appointeeZone: "NC",
        })),
        {
          positionId: "s-0", positionName: "Strategic",
          category: "cabinet" as const, prestigeTier: "strategic" as const,
          appointeeId: "b-0", appointeeZone: "NW",
        },
      ];
      const balances = calculateZoneBalances(appointments);
      expect(balances["NW"].weightedAppointments).toBe(3);
      expect(balances["NC"].weightedAppointments).toBe(3);
    });
  });

  describe("getComplianceImpact", () => {
    it("should show negative impact when adding to overrepresented zone", () => {
      const appointments: FederalAppointment[] = ["NC", "NW", "NE", "SW", "SE", "SS"].map((zone, i) => ({
        positionId: `pos-${i}`, positionName: `Position ${i}`,
        category: "cabinet" as const, prestigeTier: "standard" as const,
        appointeeId: `char-${i}`, appointeeZone: zone,
      }));
      const impact = getComplianceImpact(appointments, {}, "NW", "strategic");
      expect(impact).toBeLessThan(0);
    });
  });

  describe("getConsequences", () => {
    it("balanced tier at 90", () => {
      const c = getConsequences(90);
      expect(c.level).toBe("balanced");
      expect(c.effects.length).toBe(0);
    });
    it("mild tier at 75", () => {
      const c = getConsequences(75);
      expect(c.level).toBe("mild");
    });
    it("moderate tier at 55", () => {
      const c = getConsequences(55);
      expect(c.level).toBe("moderate");
      expect(c.effects.some(e => e.target === "stability")).toBe(true);
    });
    it("severe tier at 30", () => {
      const c = getConsequences(30);
      expect(c.level).toBe("severe");
      expect(c.effects.some(e => e.target === "stability" && e.delta <= -5)).toBe(true);
    });
  });

  describe("defaultFederalCharacterState", () => {
    it("should initialize with positions and score 100", () => {
      const state = defaultFederalCharacterState();
      expect(state.appointments.length).toBeGreaterThan(0);
      expect(state.complianceScore).toBe(100);
    });
  });
});
