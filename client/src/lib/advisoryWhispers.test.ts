import { describe, it, expect } from "vitest";
import { getWhisper, findAdviserForTab } from "./advisoryWhispers";

const mockCharacters = {
  "Adamu Bello": { name: "Adamu Bello", portfolio: "Finance", faction: "Northern", relationship: "Friendly" as const, avatar: "AB", traits: [], hooks: [], competencies: {} as any, careerHistory: [], interactionLog: [] },
  "Chioma Obi": { name: "Chioma Obi", portfolio: "Defence", faction: "Southern", relationship: "Neutral" as const, avatar: "CO", traits: [], hooks: [], competencies: {} as any, careerHistory: [], interactionLog: [] },
};

describe("findAdviserForTab", () => {
  it("finds Finance minister for governance tab", () => {
    const result = findAdviserForTab("governance", mockCharacters);
    expect(result?.name).toBe("Adamu Bello");
  });

  it("finds Defence minister for security tab", () => {
    const result = findAdviserForTab("security", mockCharacters);
    expect(result?.name).toBe("Chioma Obi");
  });

  it("returns null for unmatched tab", () => {
    const result = findAdviserForTab("legislature", {});
    expect(result).toBeNull();
  });
});

describe("getWhisper", () => {
  it("returns a whisper with text and adviser info", () => {
    const state = {
      approval: 50,
      stability: 60,
      treasury: 1.2,
      politicalCapital: 50,
      characters: mockCharacters,
      factions: { nc: { name: "NC", influence: 50, loyalty: 50, stance: "Neutral", grievance: 30, firedThresholds: [] } },
      vicePresident: { name: "VP", loyalty: 60, ambition: 30, relationship: "Friendly", mood: "Steady" },
      activeEvents: [],
    } as any;
    const result = getWhisper(state, "governance", []);
    expect(result.text).toBeTruthy();
    expect(result.adviserName).toBeTruthy();
  });

  it("returns critical whisper when approval is very low", () => {
    const state = {
      approval: 20,
      stability: 60,
      treasury: 1.2,
      politicalCapital: 50,
      characters: mockCharacters,
      factions: {},
      vicePresident: { name: "VP", loyalty: 60, ambition: 30, relationship: "Friendly", mood: "Steady" },
      activeEvents: [],
    } as any;
    const result = getWhisper(state, "villa", []);
    expect(result.text).toContain("approval");
  });
});
