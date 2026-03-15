import { describe, expect, it } from "vitest";
import {
  commissionOperation,
  processIntelligenceTurn,
  calculateSuccessProbability,
  calculateDuration,
  defaultIntelligenceState,
} from "./intelligenceEngine";

describe("intelligenceEngine", () => {
  describe("defaultIntelligenceState", () => {
    it("should return initial state with no DNI", () => {
      const state = defaultIntelligenceState();
      expect(state.dniId).toBeNull();
      expect(state.maxConcurrentOps).toBe(2);
      expect(state.activeOperations).toHaveLength(0);
    });
  });

  describe("calculateSuccessProbability", () => {
    it("should be 50% + competence * 0.4", () => {
      expect(calculateSuccessProbability(80)).toBeCloseTo(82);
      expect(calculateSuccessProbability(50)).toBeCloseTo(70);
      expect(calculateSuccessProbability(0)).toBeCloseTo(50);
    });
  });

  describe("calculateDuration", () => {
    it("should reduce duration with higher competence", () => {
      expect(calculateDuration(20, 0)).toBe(20);
      expect(calculateDuration(20, 100)).toBe(10);
      expect(calculateDuration(20, 50)).toBe(15);
    });
  });

  describe("commissionOperation", () => {
    it("should create an active operation", () => {
      const state = {
        ...defaultIntelligenceState(),
        dniId: "dni-1",
        dniCompetence: 70,
      };
      const result = commissionOperation(
        state,
        "investigate-person",
        "char-1",
        "Governor X",
        100
      );
      expect(result.activeOperations.length).toBe(1);
      expect(result.activeOperations[0].status).toBe("active");
      expect(result.activeOperations[0].type).toBe("investigate-person");
    });

    it("should reject if at max concurrent ops", () => {
      const state = {
        ...defaultIntelligenceState(),
        dniId: "dni-1",
        dniCompetence: 50,
        maxConcurrentOps: 2,
        activeOperations: [
          {
            id: "op1",
            type: "investigate-person" as const,
            targetDescription: "A",
            startDay: 1,
            estimatedEndDay: 20,
            politicalCapitalCost: 8,
            successProbability: 70,
            status: "active" as const,
          },
          {
            id: "op2",
            type: "counter-intel" as const,
            targetDescription: "B",
            startDay: 1,
            estimatedEndDay: 15,
            politicalCapitalCost: 6,
            successProbability: 70,
            status: "active" as const,
          },
        ],
      };
      const result = commissionOperation(
        state,
        "media-intel",
        undefined,
        "Media",
        100
      );
      expect(result.activeOperations.length).toBe(2); // unchanged
    });

    it("should reject if no DNI assigned", () => {
      const state = defaultIntelligenceState();
      const result = commissionOperation(
        state,
        "investigate-person",
        "char-1",
        "X",
        100
      );
      expect(result.activeOperations.length).toBe(0);
    });
  });

  describe("processIntelligenceTurn", () => {
    it("should resolve operation when day reaches estimatedEndDay", () => {
      const state = {
        ...defaultIntelligenceState(),
        dniId: "dni-1",
        dniCompetence: 70,
        dniLoyalty: 80,
        activeOperations: [
          {
            id: "op1",
            type: "investigate-person" as const,
            targetId: "char-1",
            targetDescription: "Governor X",
            startDay: 1,
            estimatedEndDay: 15,
            politicalCapitalCost: 8,
            successProbability: 78,
            status: "active" as const,
          },
        ],
      };
      const result = processIntelligenceTurn(state, 15);
      expect(result.activeOperations.length).toBe(0);
      expect(result.completedOperations.length).toBe(1);
    });

    it("should not resolve operation before estimatedEndDay", () => {
      const state = {
        ...defaultIntelligenceState(),
        dniId: "dni-1",
        dniCompetence: 70,
        dniLoyalty: 80,
        activeOperations: [
          {
            id: "op1",
            type: "investigate-person" as const,
            targetDescription: "X",
            startDay: 1,
            estimatedEndDay: 15,
            politicalCapitalCost: 8,
            successProbability: 78,
            status: "active" as const,
          },
        ],
      };
      const result = processIntelligenceTurn(state, 10);
      expect(result.activeOperations.length).toBe(1);
      expect(result.completedOperations.length).toBe(0);
    });
  });
});
