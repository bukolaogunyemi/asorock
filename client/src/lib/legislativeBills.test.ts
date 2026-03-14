import { describe, expect, it } from "vitest";
import { seedLegislativeCalendar, getAutonomousBillPool } from "./legislativeBills";

describe("legislativeBills", () => {
  describe("seedLegislativeCalendar", () => {
    it("should generate 6-7 crisis bills across the 4-year term", () => {
      const calendar = seedLegislativeCalendar();
      const crisisBills = calendar.filter((b) => b.isCrisis);
      expect(crisisBills.length).toBeGreaterThanOrEqual(6);
      expect(crisisBills.length).toBeLessThanOrEqual(7);
    });

    it("should include 4 annual budget bills", () => {
      const calendar = seedLegislativeCalendar();
      const budgets = calendar.filter((b) => b.template.title.includes("Budget"));
      expect(budgets.length).toBe(4);
    });

    it("should schedule budget bills roughly every 365 days", () => {
      const calendar = seedLegislativeCalendar();
      const budgets = calendar.filter((b) => b.template.title.includes("Budget"));
      for (let i = 1; i < budgets.length; i++) {
        const gap = budgets[i].targetDay - budgets[i - 1].targetDay;
        expect(gap).toBeGreaterThanOrEqual(300);
        expect(gap).toBeLessThanOrEqual(400);
      }
    });

    it("should include an electoral reform bill in year 3", () => {
      const calendar = seedLegislativeCalendar();
      const electoral = calendar.find((b) =>
        b.template.subjectTag === "governance" && b.isCrisis
      );
      expect(electoral).toBeDefined();
      expect(electoral!.targetDay).toBeGreaterThanOrEqual(700);
      expect(electoral!.targetDay).toBeLessThanOrEqual(1100);
    });
  });

  describe("getAutonomousBillPool", () => {
    it("should return bills for each subject tag", () => {
      const pool = getAutonomousBillPool();
      const tags = new Set(pool.map((b) => b.subjectTag));
      expect(tags.has("economy")).toBe(true);
      expect(tags.has("security")).toBe(true);
      expect(tags.has("social")).toBe(true);
      expect(tags.has("governance")).toBe(true);
    });

    it("should have at least 10 bill templates", () => {
      const pool = getAutonomousBillPool();
      expect(pool.length).toBeGreaterThanOrEqual(10);
    });
  });
});
