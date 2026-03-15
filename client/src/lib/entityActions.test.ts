import { describe, it, expect } from "vitest";
import {
  getStateActions,
  getMinistryActions,
  getAgencyActions,
  getCountryActions,
  getConstitutionalOfficeActions,
  getFactionActions,
  getInternationalOrgActions,
} from "./entityActions";
import { executeEntityAction } from "./gameEngine";

// ── Shared mock game state ────────────────────────────────────────────────────

const baseMockState = {
  day: 5,
  date: "3 Jun 2023",
  phase: "playing",
  approval: 48,
  stability: 50,
  politicalCapital: 50,
  headlines: ["Opening headline"],
  governors: [
    {
      name: "Gov. Adewale Adekunle",
      zone: "South-West",
      party: "Ruling",
      loyalty: 60,
      competence: 75,
      approval: 50,
      relationship: "Friendly",
      avatar: "AA",
      demands: "Infrastructure",
    },
    {
      name: "Gov. Musa Garba",
      zone: "North-West",
      party: "Ruling",
      loyalty: 50,
      competence: 70,
      approval: 39,
      relationship: "Wary",
      avatar: "MG",
      demands: "Security",
    },
  ],
  factions: {
    "Northern Caucus": {
      name: "Northern Caucus",
      influence: 30,
      loyalty: 55,
      stance: "Cooperative",
      grievance: 40,
      firedThresholds: [],
    },
    "Progressive Alliance": {
      name: "Progressive Alliance",
      influence: 25,
      loyalty: 60,
      stance: "Neutral",
      grievance: 10,
      firedThresholds: [],
    },
  },
  characters: {},
  cabinetAppointments: {},
  constitutionalOfficers: [],
  activeEvents: [],
  term: { current: 1, daysInOffice: 5, daysUntilElection: 1460, governingPhase: "honeymoon" },
} as any;

// ── Action builder tests ───────────────────────────────────────────────────────

describe("getStateActions", () => {
  it("returns 4 actions", () => {
    const actions = getStateActions("Lagos", baseMockState);
    expect(actions.length).toBe(4);
  });

  it("visit-state is enabled when phase is playing", () => {
    const actions = getStateActions("Lagos", baseMockState);
    const visitAction = actions.find((a) => a.id === "visit-state");
    expect(visitAction).toBeDefined();
    expect(visitAction!.enabled).toBe(true);
  });

  it("visit-state is disabled when phase is not playing", () => {
    const state = { ...baseMockState, phase: "menu" };
    const actions = getStateActions("Lagos", state);
    const visitAction = actions.find((a) => a.id === "visit-state");
    expect(visitAction!.enabled).toBe(false);
    expect(visitAction!.disabledReason).toBe("Not in active game");
  });

  it("deploy-security is disabled when political capital < 5", () => {
    const state = { ...baseMockState, politicalCapital: 3 };
    const actions = getStateActions("Lagos", state);
    const deploy = actions.find((a) => a.id === "deploy-security");
    expect(deploy!.enabled).toBe(false);
    expect(deploy!.disabledReason).toContain("5 political capital");
  });

  it("allocate-project is disabled when political capital < 10", () => {
    const state = { ...baseMockState, politicalCapital: 8 };
    const actions = getStateActions("Lagos", state);
    const project = actions.find((a) => a.id === "allocate-project");
    expect(project!.enabled).toBe(false);
    expect(project!.disabledReason).toContain("10 political capital");
  });

  it("remove-governor is always disabled (complex conditions)", () => {
    const actions = getStateActions("Lagos", baseMockState);
    const remove = actions.find((a) => a.id === "remove-governor");
    expect(remove!.enabled).toBe(false);
  });
});

describe("getMinistryActions", () => {
  it("returns 3 actions", () => {
    const actions = getMinistryActions("Finance", baseMockState);
    expect(actions.length).toBe(3);
  });

  it("replace-minister is always enabled", () => {
    const actions = getMinistryActions("Finance", baseMockState);
    const replace = actions.find((a) => a.id === "replace-minister");
    expect(replace!.enabled).toBe(true);
  });

  it("inspect-ministry and issue-directive disabled outside playing phase", () => {
    const state = { ...baseMockState, phase: "setup" };
    const actions = getMinistryActions("Finance", state);
    const inspect = actions.find((a) => a.id === "inspect-ministry");
    const directive = actions.find((a) => a.id === "issue-directive");
    expect(inspect!.enabled).toBe(false);
    expect(directive!.enabled).toBe(false);
  });
});

describe("getAgencyActions", () => {
  it("returns 3 actions", () => {
    const actions = getAgencyActions("nnpc", baseMockState);
    expect(actions.length).toBe(3);
  });

  it("expand-mandate is disabled when PC < 8", () => {
    const state = { ...baseMockState, politicalCapital: 5 };
    const actions = getAgencyActions("efcc", state);
    const expand = actions.find((a) => a.id === "expand-mandate");
    expect(expand!.enabled).toBe(false);
    expect(expand!.disabledReason).toContain("8 political capital");
  });
});

describe("getCountryActions", () => {
  it("returns 4 actions", () => {
    const actions = getCountryActions("United States", baseMockState);
    expect(actions.length).toBe(4);
  });

  it("appoint-ambassador is always enabled", () => {
    const actions = getCountryActions("United States", baseMockState);
    const appoint = actions.find((a) => a.id === "appoint-ambassador");
    expect(appoint!.enabled).toBe(true);
  });
});

describe("getConstitutionalOfficeActions", () => {
  it("returns 2 actions", () => {
    const actions = getConstitutionalOfficeActions("Senate President", baseMockState);
    expect(actions.length).toBe(2);
  });
});

describe("getFactionActions", () => {
  it("returns 4 actions", () => {
    const actions = getFactionActions("Northern Caucus", baseMockState);
    expect(actions.length).toBe(4);
  });

  it("appease-faction disabled when PC < 8", () => {
    const state = { ...baseMockState, politicalCapital: 5 };
    const actions = getFactionActions("Northern Caucus", state);
    const appease = actions.find((a) => a.id === "appease-faction");
    expect(appease!.enabled).toBe(false);
  });

  it("purge-faction disabled when PC < 15", () => {
    const state = { ...baseMockState, politicalCapital: 10 };
    const actions = getFactionActions("Northern Caucus", state);
    const purge = actions.find((a) => a.id === "purge-faction");
    expect(purge!.enabled).toBe(false);
  });

  it("negotiate-faction disabled when PC < 5", () => {
    const state = { ...baseMockState, politicalCapital: 3 };
    const actions = getFactionActions("Northern Caucus", state);
    const negotiate = actions.find((a) => a.id === "negotiate-faction");
    expect(negotiate!.enabled).toBe(false);
  });
});

describe("getInternationalOrgActions", () => {
  it("returns empty array", () => {
    expect(getInternationalOrgActions()).toEqual([]);
  });
});

// ── executeEntityAction tests ──────────────────────────────────────────────────

describe("executeEntityAction — visit-state", () => {
  it("increases governor loyalty by 8 for a state in the correct zone", () => {
    // Lagos is in South-West zone; governor zone = "South-West"
    const result = executeEntityAction(baseMockState, "state:Lagos", "visit-state");
    const sw = result.governors.find((g: any) => g.zone === "South-West");
    expect(sw!.loyalty).toBe(68); // 60 + 8
    expect(sw!.approval).toBe(53); // 50 + 3
  });

  it("does not modify other zone governors", () => {
    const result = executeEntityAction(baseMockState, "state:Lagos", "visit-state");
    const nw = result.governors.find((g: any) => g.zone === "North-West");
    expect(nw!.loyalty).toBe(50); // unchanged
  });

  it("adds a headline string", () => {
    const result = executeEntityAction(baseMockState, "state:Lagos", "visit-state");
    expect(result.headlines.some((h: string) => h.includes("Lagos"))).toBe(true);
  });
});

describe("executeEntityAction — deploy-security", () => {
  it("costs 5 political capital and increases stability by 5", () => {
    const result = executeEntityAction(baseMockState, "state:Lagos", "deploy-security");
    expect(result.politicalCapital).toBe(45); // 50 - 5
    expect(result.stability).toBe(55); // 50 + 5
  });

  it("returns unchanged state when PC < 5", () => {
    const state = { ...baseMockState, politicalCapital: 4 };
    const result = executeEntityAction(state, "state:Lagos", "deploy-security");
    expect(result.politicalCapital).toBe(4);
    expect(result.stability).toBe(50);
  });
});

describe("executeEntityAction — allocate-project", () => {
  it("costs 10 political capital and increases approval by 5", () => {
    const result = executeEntityAction(baseMockState, "state:Lagos", "allocate-project");
    expect(result.politicalCapital).toBe(40); // 50 - 10
    expect(result.approval).toBe(53); // 48 + 5
  });

  it("returns unchanged state when PC < 10", () => {
    const state = { ...baseMockState, politicalCapital: 9 };
    const result = executeEntityAction(state, "state:Lagos", "allocate-project");
    expect(result.politicalCapital).toBe(9);
    expect(result.approval).toBe(48);
  });
});

describe("executeEntityAction — appease-faction", () => {
  it("costs 8 PC and reduces faction grievance by 15", () => {
    const result = executeEntityAction(baseMockState, "faction:northern-caucus", "appease-faction");
    expect(result.politicalCapital).toBe(42); // 50 - 8
    expect(result.factions["Northern Caucus"].grievance).toBe(25); // 40 - 15
  });

  it("does not reduce grievance below 0", () => {
    const state = {
      ...baseMockState,
      factions: {
        ...baseMockState.factions,
        "Northern Caucus": { ...baseMockState.factions["Northern Caucus"], grievance: 5 },
      },
    };
    const result = executeEntityAction(state, "faction:northern-caucus", "appease-faction");
    expect(result.factions["Northern Caucus"].grievance).toBe(0);
  });

  it("returns unchanged state when PC < 8", () => {
    const state = { ...baseMockState, politicalCapital: 7 };
    const result = executeEntityAction(state, "faction:northern-caucus", "appease-faction");
    expect(result.politicalCapital).toBe(7);
    expect(result.factions["Northern Caucus"].grievance).toBe(40);
  });
});

describe("executeEntityAction — negotiate-faction", () => {
  it("costs 5 PC, reduces grievance by 8, increases loyalty by 5", () => {
    const result = executeEntityAction(baseMockState, "faction:northern-caucus", "negotiate-faction");
    expect(result.politicalCapital).toBe(45); // 50 - 5
    expect(result.factions["Northern Caucus"].grievance).toBe(32); // 40 - 8
    expect(result.factions["Northern Caucus"].loyalty).toBe(60); // 55 + 5
  });

  it("returns unchanged state when PC < 5", () => {
    const state = { ...baseMockState, politicalCapital: 4 };
    const result = executeEntityAction(state, "faction:northern-caucus", "negotiate-faction");
    expect(result.politicalCapital).toBe(4);
  });
});

describe("executeEntityAction — empower-faction", () => {
  it("increases target faction influence by 10", () => {
    const result = executeEntityAction(baseMockState, "faction:northern-caucus", "empower-faction");
    expect(result.factions["Northern Caucus"].influence).toBe(40); // 30 + 10
  });

  it("increases rival faction grievance by 5", () => {
    const result = executeEntityAction(baseMockState, "faction:northern-caucus", "empower-faction");
    expect(result.factions["Progressive Alliance"].grievance).toBe(15); // 10 + 5
  });
});

describe("executeEntityAction — invalid entity ID", () => {
  it("returns unchanged state for malformed entity id", () => {
    const result = executeEntityAction(baseMockState, "invalid-no-colon", "visit-state");
    expect(result).toBe(baseMockState);
  });
});
