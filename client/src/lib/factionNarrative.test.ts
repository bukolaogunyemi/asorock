import { describe, expect, it } from "vitest";
import {
  generateAdvisorLine,
  generateHeadline,
  generateInboxMessage,
  getTooltipPhrase,
  generateBreakingPointEvent,
} from "./factionNarrative";

describe("getTooltipPhrase", () => {
  it("returns 'Simmering' for grievance 20-39", () => {
    expect(getTooltipPhrase(20)).toBe("Simmering");
    expect(getTooltipPhrase(39)).toBe("Simmering");
  });
  it("returns 'Restless' for grievance 40-69", () => {
    expect(getTooltipPhrase(40)).toBe("Restless");
    expect(getTooltipPhrase(69)).toBe("Restless");
  });
  it("returns 'Volatile' for grievance 70-89", () => {
    expect(getTooltipPhrase(70)).toBe("Volatile");
  });
  it("returns 'Critical' for grievance 90-99", () => {
    expect(getTooltipPhrase(90)).toBe("Critical");
  });
  it("returns 'Breaking Point' for grievance 100", () => {
    expect(getTooltipPhrase(100)).toBe("Breaking Point");
  });
  it("returns null for grievance below 20", () => {
    expect(getTooltipPhrase(15)).toBeNull();
  });
});

describe("generateAdvisorLine", () => {
  it("generates a line mentioning the faction name", () => {
    const line = generateAdvisorLine("Northern Caucus", 25);
    expect(line).toContain("Northern Caucus");
  });
  it("returns null when grievance is below 20", () => {
    expect(generateAdvisorLine("Northern Caucus", 15)).toBeNull();
  });
});

describe("generateHeadline", () => {
  it("generates a headline for tier 40+", () => {
    const headline = generateHeadline("Youth Movement", 45);
    expect(headline).toBeTruthy();
    expect(headline).toContain("Youth Movement");
  });
  it("returns null for tier below 40", () => {
    expect(generateHeadline("Youth Movement", 30)).toBeNull();
  });
});

describe("generateInboxMessage", () => {
  it("generates an inbox message for tier 70+", () => {
    const msg = generateInboxMessage("Northern Caucus", 75, 30);
    expect(msg).not.toBeNull();
    expect(msg!.source).toBe("faction-demand");
    expect(msg!.priority).toBe("Urgent");
    expect(msg!.subject).toContain("Northern Caucus");
  });
  it("returns null for tier below 70", () => {
    expect(generateInboxMessage("Northern Caucus", 60, 30)).toBeNull();
  });
  it("sets Critical priority for tier 90+", () => {
    const msg = generateInboxMessage("Military Circle", 92, 30);
    expect(msg!.priority).toBe("Critical");
  });
});

describe("generateBreakingPointEvent", () => {
  it("returns title and description for the faction", () => {
    const result = generateBreakingPointEvent("Military Circle");
    expect(result.title).toContain("Military Circle");
    expect(result.description).toBeTruthy();
  });
});
