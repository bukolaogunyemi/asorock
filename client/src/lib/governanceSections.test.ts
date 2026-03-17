import { describe, it, expect } from "vitest";
import { ECONOMY_CONFIG } from "./governanceSections";
import { POLICY_LEVER_DEFS } from "./gameData";

describe("ECONOMY_CONFIG", () => {
  it("has exactly 4 subsections", () => {
    expect(ECONOMY_CONFIG.subsections).toHaveLength(4);
    expect(ECONOMY_CONFIG.subsections.map(s => s.id)).toEqual(["budget", "revenue", "debt", "trade"]);
  });

  it("overview team has 5 roles", () => {
    expect(ECONOMY_CONFIG.overview.team).toHaveLength(5);
  });

  it("all overview levers exist in POLICY_LEVER_DEFS", () => {
    for (const key of ECONOMY_CONFIG.overview.levers) {
      expect(POLICY_LEVER_DEFS).toHaveProperty(key);
    }
  });

  it("all subsection levers exist in POLICY_LEVER_DEFS", () => {
    for (const sub of ECONOMY_CONFIG.subsections) {
      for (const key of sub.levers) {
        expect(POLICY_LEVER_DEFS).toHaveProperty(key);
      }
    }
  });

  it("has exactly 3 overview charts: inflation, fx-rate, gdp", () => {
    const ids = ECONOMY_CONFIG.overview.charts.map(c => c.id);
    expect(ids).toEqual(["inflation", "fx-rate", "gdp"]);
  });

  it("has exactly 3 overview levers", () => {
    expect(ECONOMY_CONFIG.overview.levers).toEqual([
      "fuelSubsidy", "fxPolicy", "interestRate",
    ]);
  });

  it("has 4 stakeholders", () => {
    expect(ECONOMY_CONFIG.overview.stakeholders).toHaveLength(4);
  });

  it("has 3 reform definitions", () => {
    expect(ECONOMY_CONFIG.overview.reforms).toHaveLength(3);
  });

  it("each team member has a role and portfolioMatch", () => {
    for (const member of ECONOMY_CONFIG.overview.team) {
      expect(member.role).toBeTruthy();
      expect(member.portfolioMatch).toBeTruthy();
    }
  });

  it("each subsection has team, charts, and levers", () => {
    for (const sub of ECONOMY_CONFIG.subsections) {
      expect(sub.team.length).toBeGreaterThan(0);
      expect(sub.charts.length).toBeGreaterThan(0);
      expect(sub.levers.length).toBeGreaterThan(0);
    }
  });
});
