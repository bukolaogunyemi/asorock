import { describe, expect, it } from "vitest";
import {
  determineOppositionStrategy,
  reassessStrategy,
  applyOppositionEffects,
  assessDefectionRisk,
  executeDefection,
  initiatePoaching,
  checkPoachingCooldown,
  checkConventionTrigger,
  generateConventionRaces,
  resolveConventionVote,
  defaultPartyInternalsState,
  processPartyTurn,
} from "./partyEngine";
import { NWC_CHARACTERS } from "./partyProfiles";
import type { PartyState, NWCMember, PartyInternalsState } from "./partyTypes";

// ── Task 3: Opposition Strategy ─────────────────────────────────────────

describe("determineOppositionStrategy", () => {
  it("returns 'attack' when approval < 35", () => {
    expect(determineOppositionStrategy({ approval: 20, stability: 70, economicHealth: 60 })).toBe("attack");
  });

  it("returns 'obstruct' when economicHealth < 30", () => {
    expect(determineOppositionStrategy({ approval: 50, stability: 50, economicHealth: 20 })).toBe("obstruct");
  });

  it("returns 'negotiate' when approval >= 60 and stability >= 60", () => {
    expect(determineOppositionStrategy({ approval: 65, stability: 70, economicHealth: 50 })).toBe("negotiate");
  });

  it("defaults to 'obstruct' when no special condition met", () => {
    expect(determineOppositionStrategy({ approval: 50, stability: 50, economicHealth: 50 })).toBe("obstruct");
  });

  it("prioritizes 'attack' over 'obstruct' when both apply", () => {
    // approval < 35 AND economicHealth < 30
    expect(determineOppositionStrategy({ approval: 20, stability: 50, economicHealth: 20 })).toBe("attack");
  });
});

describe("reassessStrategy", () => {
  it("returns true if 30+ days have elapsed", () => {
    expect(reassessStrategy(60, 20)).toBe(true);
  });

  it("returns false if fewer than 30 days elapsed and no major event", () => {
    expect(reassessStrategy(40, 20)).toBe(false);
  });

  it("returns true if majorEvent is true regardless of days", () => {
    expect(reassessStrategy(25, 20, true)).toBe(true);
  });
});

describe("applyOppositionEffects", () => {
  it("returns correct effects for 'obstruct'", () => {
    const effects = applyOppositionEffects("obstruct");
    expect(effects).toEqual({ billDelayChance: 0.3, negativeEventChance: 0.1, crossPartyBillChance: 0.05 });
  });

  it("returns correct effects for 'attack'", () => {
    const effects = applyOppositionEffects("attack");
    expect(effects).toEqual({ billDelayChance: 0.1, negativeEventChance: 0.25, crossPartyBillChance: 0 });
  });

  it("returns correct effects for 'negotiate'", () => {
    const effects = applyOppositionEffects("negotiate");
    expect(effects).toEqual({ billDelayChance: 0.05, negativeEventChance: 0.05, crossPartyBillChance: 0.3 });
  });
});

// ── Task 4: Defection Mechanics ─────────────────────────────────────────

describe("assessDefectionRisk", () => {
  it("calculates defection probability based on loyalty below 50", () => {
    const entry = assessDefectionRisk("adu", 30, "NW", 5, "house");
    expect(entry.defectionProbability).toBe(0.2); // (50 - 30) / 100
    expect(entry.currentParty).toBe("adu");
    expect(entry.zone).toBe("NW");
    expect(entry.seatCount).toBe(5);
    expect(entry.seatType).toBe("house");
  });

  it("returns 0 probability when loyalty >= 50", () => {
    const entry = assessDefectionRisk("pfc", 60, "SW", 3, "senate");
    expect(entry.defectionProbability).toBe(0);
  });

  it("caps probability at 0.5 when loyalty is 0", () => {
    const entry = assessDefectionRisk("ndm", 0, "SE", 2, "house");
    expect(entry.defectionProbability).toBe(0.5);
  });
});

describe("executeDefection", () => {
  it("transfers seats between parties", () => {
    const parties: PartyState[] = [
      { id: "a", name: "A", abbreviation: "A", nwc: [], legislativeSeats: { house: 100, senate: 30 }, isRulingParty: true, isMainOpposition: false },
      { id: "b", name: "B", abbreviation: "B", nwc: [], legislativeSeats: { house: 50, senate: 10 }, isRulingParty: false, isMainOpposition: true },
    ];
    const result = executeDefection(parties, { fromParty: "a", toParty: "b", seatType: "house", seatCount: 10 });
    const a = result.find((p) => p.id === "a")!;
    const b = result.find((p) => p.id === "b")!;
    expect(a.legislativeSeats.house).toBe(90);
    expect(b.legislativeSeats.house).toBe(60);
  });
});

describe("initiatePoaching", () => {
  it("calculates PC cost as seatCount * 3", () => {
    const result = initiatePoaching("adu", "pfc", "NW", "house", 5, 100);
    expect(result.pcCost).toBe(15);
  });

  it("sets cooldown to 60 days from current day", () => {
    const result = initiatePoaching("adu", "pfc", "NW", "house", 5, 100);
    expect(result.cooldownUntilDay).toBe(160);
  });

  it("returns a success probability between 0 and 1", () => {
    const result = initiatePoaching("adu", "pfc", "NW", "house", 5, 100);
    expect(result.successProbability).toBeGreaterThanOrEqual(0);
    expect(result.successProbability).toBeLessThanOrEqual(1);
  });
});

describe("checkPoachingCooldown", () => {
  it("returns false if cooldown has not expired", () => {
    const cooldowns = { "pfc:NW": 200 };
    expect(checkPoachingCooldown(cooldowns, "pfc", "NW", 150)).toBe(false);
  });

  it("returns true if cooldown has expired", () => {
    const cooldowns = { "pfc:NW": 200 };
    expect(checkPoachingCooldown(cooldowns, "pfc", "NW", 250)).toBe(true);
  });

  it("returns true if no cooldown exists for target", () => {
    expect(checkPoachingCooldown({}, "pfc", "NW", 100)).toBe(true);
  });
});

// ── Task 5: Convention System ───────────────────────────────────────────

describe("checkConventionTrigger", () => {
  it("returns 'inactive' before day 670", () => {
    expect(checkConventionTrigger(500)).toBe("inactive");
  });

  it("returns 'pre-convention' between day 670 and 729", () => {
    expect(checkConventionTrigger(700)).toBe("pre-convention");
  });

  it("returns 'voting' between day 730 and 759", () => {
    expect(checkConventionTrigger(740)).toBe("voting");
  });

  it("returns 'post-convention' between day 760 and 799", () => {
    expect(checkConventionTrigger(780)).toBe("post-convention");
  });

  it("returns 'inactive' after day 800", () => {
    expect(checkConventionTrigger(850)).toBe("inactive");
  });
});

describe("generateConventionRaces", () => {
  it("generates 8 races for all NWC positions", () => {
    const members = NWC_CHARACTERS.filter((c) => c.partyId === "adu");
    const races = generateConventionRaces("adu", members);
    expect(races.length).toBe(8);
    const positions = races.map((r) => r.position);
    expect(new Set(positions).size).toBe(8);
  });

  it("each race has at least 2 candidates (incumbent + challengers)", () => {
    const members = NWC_CHARACTERS.filter((c) => c.partyId === "adu");
    const races = generateConventionRaces("adu", members);
    for (const race of races) {
      expect(race.candidates.length).toBeGreaterThanOrEqual(2);
      expect(race.candidates.length).toBeLessThanOrEqual(3);
    }
  });
});

describe("resolveConventionVote", () => {
  it("picks the candidate with the highest composite score", () => {
    const candidates = [
      { characterId: "a", name: "A", supportScore: 80 },
      { characterId: "b", name: "B", supportScore: 40 },
    ];
    const weights = { playerInfluence: 0, factionSupport: 0, godfatherBacking: 0, incumbentAdvantage: 0, candidateCompetence: 1 };
    const result = resolveConventionVote(weights, candidates);
    expect(result.winner).toBe("a");
    expect(result.margin).toBeGreaterThan(0);
  });
});

describe("defaultPartyInternalsState", () => {
  it("initializes all 8 parties from PARTY_PROFILES", () => {
    const state = defaultPartyInternalsState("adu");
    expect(state.parties.length).toBe(8);
    expect(state.rulingPartyId).toBe("adu");
  });

  it("marks the ruling party correctly", () => {
    const state = defaultPartyInternalsState("adu");
    const ruling = state.parties.find((p) => p.id === "adu")!;
    expect(ruling.isRulingParty).toBe(true);
  });

  it("identifies 2 main opposition parties by seat count", () => {
    const state = defaultPartyInternalsState("adu");
    expect(state.mainOppositionIds.length).toBe(2);
    // PFC and NDM are 2nd and 3rd largest
    expect(state.mainOppositionIds).toContain("pfc");
    expect(state.mainOppositionIds).toContain("ndm");
  });
});

describe("processPartyTurn", () => {
  it("returns updated state without errors", () => {
    const state = defaultPartyInternalsState("adu");
    const result = processPartyTurn(state, { day: 50, approval: 50, stability: 50, partyLoyalty: 50 });
    expect(result).toBeDefined();
    expect(result.parties.length).toBe(8);
  });

  it("updates convention phase when day triggers it", () => {
    const state = defaultPartyInternalsState("adu");
    const result = processPartyTurn(state, { day: 700, approval: 50, stability: 50, partyLoyalty: 50 });
    expect(result.convention.phase).toBe("pre-convention");
  });
});
