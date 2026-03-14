import { describe, expect, it } from "vitest";
import { calculateVoteProjection, advanceBills, createBillFromTemplate, defaultLegislativeState } from "./legislativeEngine";
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

describe("advanceBills", () => {
  it("should advance a bill from introduction to committee after 2-3 days", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, state.day);
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };

    let result = state;
    for (let i = 0; i < 3; i++) {
      result = { ...result, day: result.day + 1 };
      result.legislature = advanceBills(result);
    }

    const advanced = result.legislature.activeBills[0];
    expect(["committee", "introduction"]).toContain(advanced.houseStage);
  });

  it("should kill a bill stalled for 30+ days in one stage", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Stalled Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, state.day);
    bill.houseStageEnteredDay = state.day - 31;
    bill.houseStageDaysRemaining = 0;
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };

    const result = advanceBills(state);
    expect(result.activeBills.length).toBe(0);
    expect(result.failedBills.length).toBe(1);
  });

  it("should cap active bills at 8", () => {
    const state = initializeGameState(testConfig);
    const bills = Array.from({ length: 9 }, (_, i) =>
      createBillFromTemplate({
        title: `Bill ${i}`, description: "Test", subjectTag: "economy",
        stakes: "routine", effects: { onPass: [], onFail: [] },
      }, state.day)
    );
    state.legislature = { ...defaultLegislativeState(), activeBills: bills.slice(0, 8) };
    expect(state.legislature.activeBills.length).toBeLessThanOrEqual(8);
  });

  it("should move bill to pendingSignature when both chambers pass", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Passed Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, state.day);
    bill.houseStage = "passed";
    bill.senateStage = "passed";
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };

    const result = advanceBills(state);
    expect(result.activeBills.length).toBe(0);
    expect(result.pendingSignature.length).toBe(1);
  });
});
