import { describe, it, expect } from "vitest";
import {
  computeStateGovernance,
  computeNationalGovernance,
  getLGAGovernanceScore,
} from "./lgaGovernance";
import { getAllStates } from "./lgaData";
import { getChairpersonsForState } from "./lgaChairpersons";

describe("lgaGovernance", () => {
  it("computeNationalGovernance returns scores for all 37 states+FCT", () => {
    const summary = computeNationalGovernance();
    const allStates = getAllStates();
    expect(summary.scores).toHaveLength(allStates.length);
    const scoredStates = new Set(summary.scores.map((s) => s.state));
    for (const state of allStates) {
      expect(scoredStates.has(state), `Missing governance score for ${state}`).toBe(true);
    }
  });

  it("quality score is derived from chairperson competence", () => {
    const score = computeStateGovernance("Kano");
    const chairs = getChairpersonsForState("Kano");
    const avgCompetence = Math.round(
      chairs.reduce((s, c) => s + c.competence, 0) / chairs.length,
    );
    expect(score.quality).toBe(avgCompetence);
  });

  it("all scores have quality, serviceDelivery, and populationCoverage in range 0–100", () => {
    const summary = computeNationalGovernance();
    for (const s of summary.scores) {
      expect(s.quality).toBeGreaterThanOrEqual(0);
      expect(s.quality).toBeLessThanOrEqual(100);
      expect(s.serviceDelivery).toBeGreaterThanOrEqual(0);
      expect(s.serviceDelivery).toBeLessThanOrEqual(100);
      expect(s.populationCoverage).toBeGreaterThanOrEqual(0);
      expect(s.populationCoverage).toBeLessThanOrEqual(100);
    }
  });

  it("populationCoverage reflects functional LGAs (competence >= 40)", () => {
    const state = "Lagos";
    const chairs = getChairpersonsForState(state);
    const functional = chairs.filter((c) => c.competence >= 40).length;
    const expectedCoverage = Math.round((functional / chairs.length) * 100);
    const score = computeStateGovernance(state);
    expect(score.populationCoverage).toBe(expectedCoverage);
  });

  it("national summary includes topPerformers and bottomPerformers (5 each)", () => {
    const summary = computeNationalGovernance();
    expect(summary.topPerformers).toHaveLength(5);
    expect(summary.bottomPerformers).toHaveLength(5);
    // Top performers should all have higher quality than bottom performers (avg)
    const topAvg = summary.topPerformers.reduce((s, r) => s + r.quality, 0) / 5;
    const botAvg = summary.bottomPerformers.reduce((s, r) => s + r.quality, 0) / 5;
    expect(topAvg).toBeGreaterThan(botAvg);
  });

  it("getLGAGovernanceScore returns correct data for a known LGA", () => {
    const result = getLGAGovernanceScore("Lagos", "Ikeja");
    expect(result).not.toBeNull();
    expect(result!.competence).toBeGreaterThanOrEqual(30);
    expect(result!.competence).toBeLessThanOrEqual(80);
    expect(typeof result!.isFunctional).toBe("boolean");
  });

  it("getLGAGovernanceScore returns null for unknown LGA", () => {
    const result = getLGAGovernanceScore("Lagos", "Hogwarts");
    expect(result).toBeNull();
  });

  it("FCT governance score is valid despite having only 6 LGAs", () => {
    const score = computeStateGovernance("FCT");
    expect(score.state).toBe("FCT");
    expect(score.quality).toBeGreaterThanOrEqual(0);
    expect(score.populationCoverage).toBeGreaterThanOrEqual(0);
  });
});
