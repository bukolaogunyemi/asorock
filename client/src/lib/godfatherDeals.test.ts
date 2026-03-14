import { describe, expect, it } from "vitest";
import { generateDealProposal, acceptDeal, checkContractDeadlines, cashInFavour, rejectDeal } from "./godfatherDeals";
import { GODFATHER_PROFILES } from "./godfatherProfiles";

describe("godfatherDeals", () => {
  const oligarch = GODFATHER_PROFILES.find((g) => g.archetype === "business-oligarch")!;
  const elder = GODFATHER_PROFILES.find((g) => g.archetype === "military-elder")!;

  describe("generateDealProposal", () => {
    it("should generate contract-style deal for business oligarch", () => {
      const deal = generateDealProposal(oligarch, "legislative-support");
      expect(deal.type).toBe("contract");
      expect(deal.godfatherOffers).toBeTruthy();
      expect(deal.playerOwes).toBeTruthy();
    });

    it("should generate favour-style deal for military elder", () => {
      const deal = generateDealProposal(elder, "security-crisis");
      expect(deal.type).toBe("favour");
    });
  });

  describe("acceptDeal", () => {
    it("should increase patronage index", () => {
      const state: any = { patronageIndex: 10, activeDeals: 1, godfathers: [{ ...oligarch }], neutralizedGodfathers: [], approachCooldowns: {} };
      const result = acceptDeal(state, oligarch.id, generateDealProposal(oligarch, "legislative-support"));
      expect(result.patronageIndex).toBeGreaterThan(10);
      expect(result.activeDeals).toBe(2);
    });

    it("should cap active deals at 6", () => {
      const state: any = { patronageIndex: 30, activeDeals: 6, godfathers: [{ ...oligarch }], neutralizedGodfathers: [], approachCooldowns: {} };
      const result = acceptDeal(state, oligarch.id, generateDealProposal(oligarch, "legislative-support"));
      expect(result.activeDeals).toBe(6);
    });
  });

  describe("rejectDeal", () => {
    it("should worsen disposition for aggressive godfathers", () => {
      const aggressive = { ...oligarch, traits: { ...oligarch.traits, aggression: 85 }, disposition: "neutral" as const };
      const state: any = { patronageIndex: 0, activeDeals: 0, godfathers: [aggressive], neutralizedGodfathers: [], approachCooldowns: {} };
      const result = rejectDeal(state, aggressive.id);
      expect(result.godfathers[0].disposition).toBe("cold");
    });
  });

  describe("checkContractDeadlines", () => {
    it("should trigger escalation when deadline missed", () => {
      const gf = { ...oligarch, activeContracts: [{
        id: "c1", description: "test", deliveredByGodfather: true,
        deadlineDay: 10, playerDelivered: false, consequence: [],
      }] };
      const state: any = { godfathers: [gf], patronageIndex: 0, activeDeals: 1, neutralizedGodfathers: [], approachCooldowns: {} };
      const result = checkContractDeadlines(state, 15);
      expect(result.godfathers[0].escalationStage).toBeGreaterThan(0);
    });
  });

  describe("cashInFavour", () => {
    it("should reduce favour debt", () => {
      const gf = { ...elder, favourDebt: 3 };
      const state: any = { godfathers: [gf], patronageIndex: 0, activeDeals: 0, neutralizedGodfathers: [], approachCooldowns: {} };
      const result = cashInFavour(state, elder.id, "appointment");
      expect(result.state.godfathers[0].favourDebt).toBe(2);
      expect(result.demandDescription).toBeTruthy();
    });
  });
});
