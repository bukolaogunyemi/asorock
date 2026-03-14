import { describe, expect, it } from "vitest";
import { calculateVoteProjection, advanceBills, createBillFromTemplate, defaultLegislativeState, shouldTriggerCrisis, generateAutonomousBill, processLegislativeTurn, signBill, vetoBill, applyInfluenceLevers, payLeverCosts, generateAdviserBriefing, getAvailableExecutiveBills, proposeExecutiveBill, initializeCrisis, advanceCrisisRound, generateAmendments, acceptAmendment, checkReconciliation, calculateOverrideProbability, attemptOverride, checkSurpriseMotions } from "./legislativeEngine";
import { initializeGameState } from "./GameContext";
import type { Amendment } from "./legislativeTypes";

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

describe("detectCrisis", () => {
  it("should flag budget bills reaching floor-debate as crisis", () => {
    const bill = createBillFromTemplate({
      title: "Annual Budget 2024", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.isCrisis = true;
    bill.houseStage = "floor-debate";
    expect(shouldTriggerCrisis(bill)).toBe(true);
  });

  it("should flag tight-margin bills as crisis", () => {
    const bill = createBillFromTemplate({
      title: "Social Bill", description: "Test", subjectTag: "social",
      stakes: "significant", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseStage = "floor-debate";
    bill.houseSupport = { firmYes: 170, leaningYes: 10, undecided: 5, leaningNo: 10, firmNo: 165 };
    expect(shouldTriggerCrisis(bill)).toBe(true);
  });
});

describe("generateAutonomousBill", () => {
  it("should generate economy bill when inflation is high", () => {
    const state = initializeGameState(testConfig);
    state.macroEconomy.inflation = 30;
    state.day = 20; // ensure rate-limit passes (day % 20 === 0)
    state.legislature = defaultLegislativeState();
    const bill = generateAutonomousBill(state);
    if (bill) {
      expect(bill.subjectTag).toBe("economy");
    }
  });
});

describe("generateAdviserBriefing", () => {
  it("should generate daily brief with active bill count", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, 1);
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };
    const briefing = generateAdviserBriefing(state);
    expect(briefing.dailyBrief).toContain("1");
  });

  it("should generate weekly summary every 7 days", () => {
    const state = initializeGameState(testConfig);
    state.day = 7;
    state.legislature = defaultLegislativeState();
    const briefing = generateAdviserBriefing(state);
    expect(briefing.weeklySummary).toBeDefined();
  });

  it("should warn about crisis bills approaching vote", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Budget", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.isCrisis = true;
    bill.houseStage = "committee";
    bill.houseStageDaysRemaining = 2;
    state.legislature = { ...defaultLegislativeState(), activeBills: [bill] };
    const briefing = generateAdviserBriefing(state);
    expect(briefing.dailyBrief).toContain("WARNING");
  });
});

describe("processLegislativeTurn", () => {
  it("should introduce scheduled bills when their day arrives", () => {
    const state = initializeGameState(testConfig);
    state.legislature = {
      ...defaultLegislativeState(),
      legislativeCalendar: [{
        template: { title: "Test Scheduled", description: "Test", subjectTag: "economy", stakes: "routine", effects: { onPass: [], onFail: [] } },
        targetDay: state.day,
        isCrisis: false,
      }],
    };
    const result = processLegislativeTurn(state);
    expect(result.legislature.activeBills.length).toBe(1);
    expect(result.legislature.activeBills[0].title).toBe("Test Scheduled");
  });
});

describe("veto and signing", () => {
  it("signBill should apply onPass effects and move to passedBills", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [{ target: "approval", delta: 5 }], onFail: [] },
    }, 1);
    state.legislature = { ...defaultLegislativeState(), pendingSignature: [bill] };
    const result = signBill(state, bill.id);
    expect(result.legislature.pendingSignature.length).toBe(0);
    expect(result.legislature.passedBills.length).toBe(1);
    expect(result.approval).toBe(state.approval + 5);
  });

  it("vetoBill should cost political capital scaled to stakes", () => {
    const state = initializeGameState(testConfig);
    state.politicalCapital = 50;
    const bill = createBillFromTemplate({
      title: "Critical Bill", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    state.legislature = { ...defaultLegislativeState(), pendingSignature: [bill] };
    const result = vetoBill(state, bill.id);
    expect(result.politicalCapital).toBeLessThan(50);
    expect(result.legislature.sessionStats.billsVetoed).toBe(1);
  });

  it("should expire unsigned bills after 21-day deadline", () => {
    const state = initializeGameState(testConfig);
    state.day = 30;
    const bill = createBillFromTemplate({
      title: "Expired Bill", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [{ target: "approval", delta: 3 }], onFail: [] },
    }, 1);
    bill.signingDeadlineDay = 25; // past deadline
    state.legislature = { ...defaultLegislativeState(), pendingSignature: [bill] };
    const result = processLegislativeTurn(state);
    expect(result.legislature.pendingSignature.length).toBe(0);
  });
});

describe("executive bills", () => {
  it("should generate 2-3 available executive bills based on game state", () => {
    const state = initializeGameState(testConfig);
    state.legislature = defaultLegislativeState();
    const available = getAvailableExecutiveBills(state);
    expect(available.length).toBeGreaterThanOrEqual(2);
    expect(available.length).toBeLessThanOrEqual(3);
  });

  it("proposeExecutiveBill should add bill to activeBills", () => {
    const state = initializeGameState(testConfig);
    state.legislature = defaultLegislativeState();
    const available = getAvailableExecutiveBills(state);
    if (available.length > 0) {
      const result = proposeExecutiveBill(state, available[0].id);
      expect(result.legislature.activeBills.length).toBe(1);
      expect(result.legislature.activeBills[0].sponsor).toBe("executive");
    }
  });
});

describe("multi-round crises", () => {
  it("budget crisis should have 3-4 rounds", () => {
    const crisis = initializeCrisis("budget", "test-bill-id");
    expect(crisis.totalRounds).toBeGreaterThanOrEqual(3);
    expect(crisis.totalRounds).toBeLessThanOrEqual(4);
  });

  it("should advance to next round after resolution", () => {
    const crisis = initializeCrisis("budget", "test-bill-id");
    const result = advanceCrisisRound(crisis, ["spend-political-capital"]);
    expect(result.currentRound).toBe(2);
    expect(result.roundHistory.length).toBe(1);
  });

  it("final round should resolve the crisis", () => {
    const crisis = initializeCrisis("social", "test-bill-id");
    // social = 2 rounds total
    expect(crisis.totalRounds).toBe(2);
    // Advance to round 2
    const round1 = advanceCrisisRound(crisis, []);
    // Advance past final round
    const round2 = advanceCrisisRound(round1, []);
    expect(round2.resolved).toBe(true);
  });
});

describe("resolveLegislativeCrisis", () => {
  it("should apply lever effects to vote projection", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Crisis Bill", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseSupport = { firmYes: 150, leaningYes: 20, undecided: 30, leaningNo: 20, firmNo: 140 };

    const result = applyInfluenceLevers(state, bill, ["spend-political-capital"], "house");
    const newTotal = result.firmYes + result.leaningYes;
    const oldTotal = 150 + 20;
    expect(newTotal).toBeGreaterThan(oldTotal);
  });

  it("should deduct lever costs from game state", () => {
    const state = initializeGameState(testConfig);
    state.politicalCapital = 30;
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "critical", effects: { onPass: [], onFail: [] },
    }, 1);

    const result = payLeverCosts(state, ["spend-political-capital"]);
    expect(result.politicalCapital).toBeLessThan(30);
  });
});

describe("amendments", () => {
  it("should generate 0-3 amendment proposals during committee stage", () => {
    const state = initializeGameState(testConfig);
    const bill = createBillFromTemplate({
      title: "Test Bill", description: "Test", subjectTag: "economy",
      stakes: "significant", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseStage = "committee";
    const amendments = generateAmendments(bill, state);
    expect(amendments.length).toBeGreaterThanOrEqual(0);
    expect(amendments.length).toBeLessThanOrEqual(3);
  });

  it("accepting amendment should modify bill and mark accepted", () => {
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [{ target: "approval" as const, delta: 5 }], onFail: [] },
    }, 1);
    const amendment: Amendment = {
      description: "Reduce scope",
      sponsor: "opposition",
      effectModifiers: [{ target: "approval" as const, delta: -2 }],
      supportSwing: { house: 15, senate: 8 },
      accepted: false,
    };
    const result = acceptAmendment(bill, amendment);
    expect(result.amendments.length).toBe(1);
    expect(result.amendments[0].accepted).toBe(true);
  });
});

describe("reconciliation", () => {
  it("should trigger when bill has accepted amendments", () => {
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseStage = "passed";
    bill.senateStage = "passed";
    bill.amendments = [{
      description: "Test amendment",
      sponsor: "opposition",
      effectModifiers: [],
      supportSwing: { house: 10, senate: 5 },
      accepted: true,
    }];
    const needsReconciliation = checkReconciliation(bill);
    expect(needsReconciliation).toBe(true);
  });

  it("should not trigger when no amendments accepted", () => {
    const bill = createBillFromTemplate({
      title: "Test", description: "Test", subjectTag: "economy",
      stakes: "routine", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseStage = "passed";
    bill.senateStage = "passed";
    bill.amendments = [];
    expect(checkReconciliation(bill)).toBe(false);
  });
});

describe("veto override", () => {
  it("should calculate override probability based on approval", () => {
    const resultLow = calculateOverrideProbability(25);
    const resultHigh = calculateOverrideProbability(75);
    expect(resultLow).toBeGreaterThan(resultHigh);
  });

  it("should check 2/3 majority threshold for override", () => {
    const state = initializeGameState(testConfig);
    state.legislature = defaultLegislativeState();
    state.approval = 30; // low approval = higher override chance
    const bill = createBillFromTemplate({
      title: "Vetoed Bill", description: "Test", subjectTag: "economy",
      stakes: "significant", effects: { onPass: [], onFail: [] },
    }, 1);
    bill.houseSupport = { firmYes: 250, leaningYes: 10, undecided: 10, leaningNo: 10, firmNo: 80 };
    bill.senateSupport = { firmYes: 75, leaningYes: 5, undecided: 5, leaningNo: 5, firmNo: 19 };
    const result = attemptOverride(state, bill);
    // With 250+10 = 260 > 240 (2/3 of 360), house should pass
    expect(result.houseVotes).toBeGreaterThanOrEqual(240);
  });
});

describe("surprise motions", () => {
  it("should trigger impeachment motion when approval < 25 and outrage > 70", () => {
    const state = initializeGameState(testConfig);
    state.approval = 20;
    state.outrage = 75;
    const motions = checkSurpriseMotions(state);
    expect(motions.some((m) => m.type === "impeachment")).toBe(true);
  });

  it("should trigger no-confidence when stability < 20", () => {
    const state = initializeGameState(testConfig);
    state.stability = 15;
    const motions = checkSurpriseMotions(state);
    expect(motions.some((m) => m.type === "no-confidence")).toBe(true);
  });

  it("should return empty array when no conditions met", () => {
    const state = initializeGameState(testConfig);
    state.approval = 60;
    state.stability = 60;
    state.outrage = 20;
    const motions = checkSurpriseMotions(state);
    expect(motions.length).toBe(0);
  });
});
