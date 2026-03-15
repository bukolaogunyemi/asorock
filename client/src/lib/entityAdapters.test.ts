import { describe, it, expect } from "vitest";
import { resolveEntityProfile } from "./entityAdapters";

const mockGameState = {
  day: 1,
  phase: "playing",
  politicalCapital: 50,
  governors: [
    { name: "Gov. Adeyemi", zone: "South-West", party: "Ruling", loyalty: 70, competence: 65, approval: 58, relationship: "Friendly", avatar: "GA", demands: "Infrastructure" },
  ],
  factions: {
    "Northern Caucus": { name: "Northern Caucus", influence: 28, loyalty: 55, stance: "Cooperative", grievance: 20, firedThresholds: [] },
  },
  characters: {
    "Alh. Aminu Kazeem": { name: "Alh. Aminu Kazeem", portfolio: "Finance", faction: "Northern Caucus", relationship: "Friendly", avatar: "AK", traits: [], hooks: [], competencies: {}, careerHistory: [], interactionLog: [] },
  },
  cabinetAppointments: { Finance: "Alh. Aminu Kazeem" },
  constitutionalOfficers: [
    { position: "Senate President", name: "Sen. Ibrahim Waziri", zone: "North-West", party: "Ruling", relationship: "Neutral", loyalty: 60, avatar: "IW" },
  ],
  activeEvents: [],
} as any;

describe("resolveEntityProfile", () => {
  it("resolves state entities", () => {
    const profile = resolveEntityProfile("state:lagos", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("state");
    expect(profile!.name).toContain("Lagos");
    expect(profile!.metadata.length).toBeGreaterThan(0);
  });

  it("resolves ministry entities", () => {
    const profile = resolveEntityProfile("ministry:finance", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("ministry");
    expect(profile!.keyPersonnel.length).toBeGreaterThan(0);
    expect(profile!.keyPersonnel[0].name).toBe("Alh. Aminu Kazeem");
  });

  it("resolves faction entities", () => {
    const profile = resolveEntityProfile("faction:northern-caucus", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("faction");
    expect(profile!.stats).toBeDefined();
    expect(profile!.stats!.length).toBeGreaterThan(0);
  });

  it("resolves agency entities", () => {
    const profile = resolveEntityProfile("agency:nnpc", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("agency");
  });

  it("resolves country entities", () => {
    const profile = resolveEntityProfile("country:united-states", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("country");
    expect(profile!.stats).toBeDefined();
  });

  it("resolves international-org entities", () => {
    const profile = resolveEntityProfile("international-org:ecowas", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("international-org");
  });

  it("resolves constitutional-office entities", () => {
    const profile = resolveEntityProfile("constitutional-office:senate-president", mockGameState);
    expect(profile).not.toBeNull();
    expect(profile!.type).toBe("constitutional-office");
    expect(profile!.keyPersonnel.length).toBeGreaterThan(0);
  });

  it("returns null for unknown entity", () => {
    expect(resolveEntityProfile("unknown:thing", mockGameState)).toBeNull();
  });

  it("returns null for invalid format", () => {
    expect(resolveEntityProfile("nocolon", mockGameState)).toBeNull();
  });

  it("state profile includes governor from matching zone", () => {
    const profile = resolveEntityProfile("state:lagos", mockGameState);
    const governor = profile!.keyPersonnel.find(p => p.role === "Governor");
    expect(governor).toBeDefined();
    expect(governor!.name).toBe("Gov. Adeyemi");
  });
});
