import { describe, expect, it } from "vitest";
import { calculateVoteProjection } from "./legislativeEngine";
import { initializeGameState } from "./GameContext";

const testConfig = {
  firstName: "Test", lastName: "President", age: 55, gender: "Male" as const,
  stateOfOrigin: "Lagos", education: "University", party: "ADU",
  era: "2023" as const, vpName: "VP Test", vpState: "Kano",
  personalAssistant: "Aide", promises: [], appointments: {},
  presidentName: "Test President", origin: "Lagos Politician",
  traits: [], ideologies: [], ethnicity: "Yoruba", religion: "Christianity",
  occupation: "Politician",
};

describe("legislativeEngine", () => {
  describe("calculateVoteProjection", () => {
    it("should return projections that sum to chamber total for House (360)", () => {
      const state = initializeGameState(testConfig);
      const bill = {
        subjectTag: "economy" as const,
        sponsor: "executive" as const,
        stakes: "significant" as const,
      };
      const projection = calculateVoteProjection(state, bill, "house");
      const total =
        projection.firmYes + projection.leaningYes + projection.undecided +
        projection.leaningNo + projection.firmNo;
      expect(total).toBe(360);
    });

    it("should return projections that sum to chamber total for Senate (109)", () => {
      const state = initializeGameState(testConfig);
      const bill = {
        subjectTag: "economy" as const,
        sponsor: "executive" as const,
        stakes: "significant" as const,
      };
      const projection = calculateVoteProjection(state, bill, "senate");
      const total =
        projection.firmYes + projection.leaningYes + projection.undecided +
        projection.leaningNo + projection.firmNo;
      expect(total).toBe(109);
    });

    it("should favour executive bills with high party loyalty", () => {
      const state = initializeGameState(testConfig);
      state.partyLoyalty = 90;
      const bill = { subjectTag: "economy" as const, sponsor: "executive" as const, stakes: "routine" as const };
      const projection = calculateVoteProjection(state, bill, "house");
      expect(projection.firmYes + projection.leaningYes).toBeGreaterThan(180);
    });

    it("should disfavour executive bills with low party loyalty", () => {
      const state = initializeGameState(testConfig);
      state.partyLoyalty = 20;
      const bill = { subjectTag: "economy" as const, sponsor: "executive" as const, stakes: "routine" as const };
      const projection = calculateVoteProjection(state, bill, "house");
      expect(projection.firmYes + projection.leaningYes).toBeLessThan(180);
    });
  });
});
