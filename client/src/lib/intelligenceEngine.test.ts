import { describe, expect, it } from "vitest";
import {
  commissionOperation,
  processIntelligenceTurn,
  calculateSuccessProbability,
  calculateDuration,
  defaultIntelligenceState,
  getPassiveHookRate,
  calculateLeakRate,
  deployLeverage,
  deployTrade,
  deployBlackmail,
  tickBlackmailDesperation,
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

  describe("passive hook generation", () => {
    it("high competence DNI generates hooks every 15-30 days", () => {
      const rate = getPassiveHookRate(80);
      expect(rate.min).toBe(15);
      expect(rate.max).toBe(30);
    });

    it("low competence DNI generates hooks every 60-90 days", () => {
      const rate = getPassiveHookRate(30);
      expect(rate.min).toBe(60);
      expect(rate.max).toBe(90);
    });

    it("medium competence DNI generates hooks every 30-60 days", () => {
      const rate = getPassiveHookRate(50);
      expect(rate.min).toBe(30);
      expect(rate.max).toBe(60);
    });
  });

  describe("DNI loyalty leaks", () => {
    it("should have 0% leak rate above loyalty 40", () => {
      expect(calculateLeakRate(50, 0.15)).toBe(0);
      expect(calculateLeakRate(80, 0.10)).toBe(0);
    });

    it("should have base rate at loyalty 40", () => {
      expect(calculateLeakRate(40, 0.15)).toBeCloseTo(0.15);
    });

    it("should scale up below loyalty 40", () => {
      const rate30 = calculateLeakRate(30, 0.15);
      expect(rate30).toBeGreaterThan(0.15);
    });

    it("should cap at 2x base rate", () => {
      const rate0 = calculateLeakRate(0, 0.15);
      expect(rate0).toBeLessThanOrEqual(0.30);
    });
  });

  describe("intelligence deployment", () => {
    it("leverage should increase target loyalty with resentment flag", () => {
      const result = deployLeverage("hook-1", "char-1");
      expect(result.hookUpdate.deployed).toBe(true);
      expect(result.hookUpdate.deploymentType).toBe("leverage");
      expect(result.hookUpdate.leverageTarget).toBe("char-1");
      expect(result.targetEffects).toContainEqual(
        expect.objectContaining({ type: "loyalty-boost" })
      );
    });

    it("trade should mark hook as consumed", () => {
      const result = deployTrade("hook-1", "godfather-1");
      expect(result.hookUpdate.deployed).toBe(true);
      expect(result.hookUpdate.deploymentType).toBe("trade");
      expect(result.hookUpdate.tradeRecipient).toBe("godfather-1");
    });

    it("blackmail should set desperation counter starting at 0", () => {
      const result = deployBlackmail("hook-1", "char-1");
      expect(result.hookUpdate.deployed).toBe(true);
      expect(result.hookUpdate.deploymentType).toBe("blackmail");
      expect(result.hookUpdate.blackmailDesperation).toBe(0);
    });

    it("blackmail desperation should increase each turn", () => {
      const desperation = tickBlackmailDesperation(50, false);
      expect(desperation).toBe(55);
    });

    it("repeated blackmail should increase desperation faster", () => {
      const desperation = tickBlackmailDesperation(50, true);
      expect(desperation).toBe(58);
    });

    it("desperation should cap at 100", () => {
      const desperation = tickBlackmailDesperation(98, false);
      expect(desperation).toBe(100);
    });
  });
});
