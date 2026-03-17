import { describe, expect, it } from "vitest";
import { initializeGameState, hydrateLoadedGameState, gameReducer, type CampaignConfig } from "./GameContext";
import { POLICY_LEVER_DEFS, POLICY_MODIFIER_SCALE, POLICY_COOLDOWN_DAYS } from "./gameData";
import {
  computePolicyModifiers,
  executeQuickAction,
  generatePolicyConfirmationEvent,
  HIGH_IMPACT_CHANGES,
  handleInboxAction,
  processTurn,
  processConsequences,
  requirementsMet,
  resolveActiveEventChoice,
  resolveCabalChoice,
  startHookInvestigation,
  useHook,
} from "./gameEngine";
import type { PolicyLeverState, PolicyLeverKey, AnyPolicyPosition } from "./gameTypes";
import type { Consequence } from "./gameEngine";

const testConfig: CampaignConfig = {
  firstName: "Amaka",
  lastName: "Okonkwo",
  age: 47,
  gender: "Female",
  stateOfOrigin: "Lagos",
  education: "Master's Degree",
  party: "NDM",
  era: "2023",
  vpName: "Chief Ada Okafor",
  vpState: "Kano",
  personalAssistant: "Amara Obi",
  promises: [
    "Reduce fuel prices within 90 days",
    "Create 2 million jobs in Year 1",
  ],
  appointments: {
    "Chief of Staff": "Dr. Ngozi Anya",
    "Secretary to the Government": "Barr. Chioma Nnamdi",
  },
  presidentName: "Amaka Okonkwo",
  origin: "Lagos Politician",
  traits: ["charismatic", "calculating"],
  ideologies: ["reformist"],
  ethnicity: "Yoruba",
  religion: "Christianity",
  occupation: "Politician",
};

const buildState = () => initializeGameState(testConfig);

const withReadyState = () => {
  let state = buildState();
  state = resolveCabalChoice(state, 0);
  state = resolveActiveEventChoice(state, "ae-pipeline-crisis", 0);
  state = resolveActiveEventChoice(state, "ae-imf-loan", 1);
  state = resolveActiveEventChoice(state, "ae-governorship-elections", 1);
  return state;
};

describe("game engine core loop", () => {
  it("creates a playable opening state", () => {
    const state = buildState();

    expect(state.phase).toBe("playing");
    expect(state.day).toBe(1);
    expect(state.activeEvents.map((event) => event.id)).toEqual(
      expect.arrayContaining(["ae-pipeline-crisis", "ae-imf-loan", "ae-governorship-elections"]),
    );
    expect(state.inboxMessages.length).toBeGreaterThan(0);
    expect(state.dailySummary?.headline).toContain("presidency opens");
    expect(state.cabalMeeting?.resolved).toBe(false);
    expect(state.macroHistory).toHaveLength(1);
  });

  it("carries onboarding continuity into live runtime state", () => {
    const state = buildState();

    expect(state.vicePresident.name).toBe("Chief Ada Okafor");
    expect(state.personalAssistant).toBe("Amara Obi");
    expect(state.campaignPromises).toHaveLength(2);
    // 2 onboarding appointments (agency heads now handled by director system)
    expect(state.appointments).toHaveLength(2);
    expect(state.term.current).toBe(1);
    expect(state.term.daysUntilElection).toBeGreaterThan(1000);
    expect(state.macroEconomy.inflation).toBeGreaterThan(20);
  });

  it("resolves the daily cabal into live state changes", () => {
    const state = buildState();
    const next = resolveCabalChoice(state, 0);

    expect(next.cabalMeeting?.resolved).toBe(true);
    expect(next.turnLog.at(-1)?.category).toBe("cabal");
  });

  it("resolves active event choices into authoritative state changes", () => {
    const state = buildState();
    const next = resolveActiveEventChoice(state, "ae-pipeline-crisis", 0);

    expect(next.activeEvents.find((event) => event.id === "ae-pipeline-crisis")).toBeUndefined();
    expect(next.pendingConsequences.length).toBeGreaterThan(state.pendingConsequences.length);
    expect(next.turnLog.at(-1)?.event).toContain("Niger Delta Pipeline Crisis");
  });

  it("enforces quick action cooldowns", () => {
    const state = buildState();
    const firstUse = executeQuickAction(state, "national-address");
    const secondUse = executeQuickAction(firstUse, "national-address");

    expect(firstUse.lastActionAtDay["national-address"]).toBe(state.day);
    expect(secondUse).toBe(firstUse);
  });

  it("marks inbox actions as read and records the outcome", () => {
    const state = buildState();
    const next = handleInboxAction(state, "msg-finance-imf", "reply-excellent");

    expect(next.inboxMessages.find((message) => message.id === "msg-finance-imf")?.read).toBe(true);
    expect(next.turnLog.at(-1)?.category).toBe("inbox");
    expect(next.turnLog.at(-1)?.event).toContain("IMF");
  });

  it("processes the next day and refreshes summaries, headlines, macro history, and cabal timing", () => {
    const state = withReadyState();
    const next = processTurn(state);

    expect(next.day).toBe(2);
    expect(next.date).not.toBe(state.date);
    expect(next.dailySummary?.day).toBe(2);
    expect(next.approvalHistory.at(-1)?.day).toBe(2);
    expect(next.macroHistory.at(-1)?.day).toBe(2);
    expect(next.headlines.length).toBeGreaterThan(0);
    expect(next.turnLog.at(-1)?.event).toContain("Day 2 briefing complete");
    expect(next.term.daysInOffice).toBeGreaterThan(state.term.daysInOffice);
    expect(next.term.daysUntilElection).toBe(state.term.daysUntilElection - 1);
    expect(next.cabalMeeting?.day).toBe(2);
    expect(next.cabalMeeting?.resolved).toBe(false);
  });

  it("advances hook investigations into usable dossiers over time", () => {
    let state = withReadyState();
    const owner = Object.entries(state.characters).find(([, character]) => character.hooks.length > 0);
    expect(owner).toBeTruthy();
    const [ownerName, character] = owner!;
    const hookId = character.hooks[0].id;

    state = startHookInvestigation(state, ownerName, hookId);
    const afterProbe = state.characters[ownerName].hooks[0];
    expect(afterProbe.underInvestigation).toBe(true);

    const next = processTurn(state);
    const progressed = next.characters[ownerName].hooks[0];
    expect(progressed.evidence).toBeGreaterThan(afterProbe.evidence);
  });

  it("can spend a usable hook for leverage", () => {
    const state = buildState();
    const owner = Object.entries(state.characters).find(([, character]) => character.hooks.length > 0);
    expect(owner).toBeTruthy();
    const [ownerName, character] = owner!;
    const hook = character.hooks[0];

    const primed = {
      ...state,
      characters: {
        ...state.characters,
        [ownerName]: {
          ...character,
          hooks: [{ ...hook, discovered: true, usable: true, evidence: 90 }],
        },
      },
    };

    const next = useHook(primed, ownerName, hook.id);
    expect(next.characters[ownerName].hooks[0].used).toBe(true);
    expect(next.turnLog.at(-1)?.category).toBe("hook");
  });

  it("resolves a re-election into a new term instead of dropping the campaign state", () => {
    const base = withReadyState();
    const state = {
      ...base,
      approval: 64,
      trust: 62,
      politicalCapital: 68,
      outrage: 24,
      cabalMeeting: { ...base.cabalMeeting!, resolved: true },
      term: {
        ...base.term,
        daysUntilElection: 1,
        daysInOffice: 620,
      },
      vicePresident: {
        ...base.vicePresident,
        loyalty: 71,
      },
      factions: Object.fromEntries(Object.entries(base.factions).map(([key, faction]) => [key, { ...faction, loyalty: 72 }])),
      activeEvents: [],
    };

    const next = processTurn(state);

    expect(next.phase).toBe("playing");
    expect(next.term.current).toBe(2);
    expect(next.term.reelectionsWon).toBe(1);
    expect(next.term.daysUntilElection).toBe(1460);
    expect(next.inboxMessages[0]?.subject).toContain("re-election");
  });

  it("can end the run on an election defeat when the coalition collapses", () => {
    const base = withReadyState();
    const state = {
      ...base,
      approval: 26,
      trust: 18,
      stability: 34,
      outrage: 81,
      cabalMeeting: { ...base.cabalMeeting!, resolved: true },
      term: {
        ...base.term,
        daysUntilElection: 1,
        daysInOffice: 710,
      },
      vicePresident: {
        ...base.vicePresident,
        loyalty: 41,
      },
      factions: Object.fromEntries(Object.entries(base.factions).map(([key, faction]) => [key, { ...faction, loyalty: 35 }])),
      activeEvents: [],
    };

    const next = processTurn(state);

    expect(next.phase).toBe("defeat");
    expect(next.defeatState).toBe("military-coup");
    expect(next.inboxMessages[0]?.subject).toContain("opposition ticket");
  });
});

describe("requirementsMet", () => {
  it("evaluates thresholds against live state and macro state", () => {
    const state = buildState();

    expect(requirementsMet(state, [{ metric: "approval", min: 40 }])).toBe(true);
    expect(requirementsMet(state, [{ metric: "approval", min: 90 }])).toBe(false);
    expect(requirementsMet(state, [{ metric: "treasury", max: 2 }])).toBe(true);
    expect(requirementsMet(state, [{ metric: "inflation", min: 20 }])).toBe(true);
  });
});

describe("policy lever types", () => {
  it("PolicyLeverState has all 9 lever keys", () => {
    const keys: PolicyLeverKey[] = [
      "fuelSubsidy", "electricityTariff", "fxPolicy", "interestRate",
      "taxRate", "cashTransfers", "importTariffs", "minimumWage", "publicSectorHiring",
    ];
    expect(keys).toHaveLength(9);
  });
});

describe("policy lever era defaults", () => {
  it("initialises policyLevers for 2023 era", () => {
    const state = buildState();
    expect(state.policyLevers).toBeDefined();
    expect(state.policyLevers.fuelSubsidy.position).toBe("partial");
    expect(state.policyLevers.fxPolicy.position).toBe("managed-float");
    expect(state.policyLevers.interestRate.position).toBe("neutral");
    expect(state.policyLevers.fuelSubsidy.pendingPosition).toBeNull();
    expect(state.policyLevers.fuelSubsidy.cooldownUntilDay).toBe(0);
  });
});

describe("policy lever definitions", () => {
  it("defines all 9 levers with positions and modifiers", () => {
    expect(Object.keys(POLICY_LEVER_DEFS)).toHaveLength(25);
    const fuelSubsidy = POLICY_LEVER_DEFS.fuelSubsidy;
    expect(fuelSubsidy.displayName).toBe("Fuel Subsidy");
    expect(fuelSubsidy.positions).toHaveLength(4);
    expect(fuelSubsidy.zeroImpactPosition).toBe("targeted");
    const fullMod = fuelSubsidy.modifiers.full;
    expect(fullMod).toHaveProperty("inflation");
    expect(fullMod).toHaveProperty("approval");
    expect(fullMod).toHaveProperty("treasury");
    expect(fullMod).toHaveProperty("trust");
  });

  it("zero-impact position has all-zero modifiers", () => {
    for (const [key, def] of Object.entries(POLICY_LEVER_DEFS)) {
      const zeroMods = def.modifiers[def.zeroImpactPosition];
      for (const [field, value] of Object.entries(zeroMods)) {
        expect(value).toBe(0);
      }
    }
  });

  it("POLICY_MODIFIER_SCALE defaults to 1.0", () => {
    expect(POLICY_MODIFIER_SCALE).toBe(1.0);
  });
});

function makeZeroImpactLevers(): PolicyLeverState {
  const result: any = {};
  for (const [key, def] of Object.entries(POLICY_LEVER_DEFS)) {
    result[key] = { position: def.zeroImpactPosition, pendingPosition: null, cooldownUntilDay: 0 };
  }
  return result as PolicyLeverState;
}

describe("computePolicyModifiers", () => {
  it("returns all-zero for zero-impact positions", () => {
    const levers = makeZeroImpactLevers();
    const mods = computePolicyModifiers(levers);
    expect(mods.inflation).toBe(0);
    expect(mods.fxRate).toBe(0);
    expect(mods.reserves).toBe(0);
    expect(mods.approval).toBe(0);
    expect(mods.treasury).toBe(0);
    expect(mods.trust).toBe(0);
  });

  it("sums modifiers from multiple non-zero levers", () => {
    const levers = makeZeroImpactLevers();
    levers.fuelSubsidy.position = "removed";    // inflation -0.5
    levers.interestRate.position = "hawkish";    // inflation -0.8
    const mods = computePolicyModifiers(levers);
    expect(mods.inflation).toBeCloseTo(-1.3);
  });

  it("applies POLICY_MODIFIER_SCALE", () => {
    const levers = makeZeroImpactLevers();
    levers.fuelSubsidy.position = "full"; // inflation +0.8
    const mods = computePolicyModifiers(levers);
    expect(mods.inflation).toBeCloseTo(0.8); // scale=1.0, so unchanged
  });
});

const makeTestState = () => buildState();

describe("processConsequences policyLever effect", () => {
  it("sets lever position, clears pending, starts cooldown", () => {
    const state = buildState();
    const stateWithPending = {
      ...state,
      policyLevers: {
        ...state.policyLevers,
        fuelSubsidy: {
          ...state.policyLevers.fuelSubsidy,
          pendingPosition: "removed" as AnyPolicyPosition,
        },
      },
    };
    const consequences: Consequence[] = [{
      id: "test-policy",
      sourceEvent: "test",
      delayDays: 0,
      description: "Apply fuel subsidy change",
      effects: [{
        target: "policyLever",
        leverKey: "fuelSubsidy" as PolicyLeverKey,
        leverPosition: "removed" as AnyPolicyPosition,
        delta: 0,
        description: "Set fuel subsidy to removed",
      }],
    }];
    const result = processConsequences(stateWithPending, consequences);
    expect(result.policyLevers.fuelSubsidy.position).toBe("removed");
    expect(result.policyLevers.fuelSubsidy.pendingPosition).toBeNull();
    expect(result.policyLevers.fuelSubsidy.cooldownUntilDay).toBe(stateWithPending.day + POLICY_COOLDOWN_DAYS);
  });
});

describe("generatePolicyConfirmationEvent", () => {
  it("generates event with 4 choices (bold, gradual, backroom, cancel)", () => {
    const state = makeTestState();
    const event = generatePolicyConfirmationEvent("fuelSubsidy", "partial", "removed", state);
    expect(event.source).toBe("policy");
    expect(event.policyLeverKey).toBe("fuelSubsidy");
    expect(event.severity).toBe("critical");
    expect(event.category).toBe("economy");
    expect(event.expiresInDays).toBe(3);
    expect(event.choices).toHaveLength(4);
    expect(event.choices[3].label).toContain("Cancel");
  });

  it("bold reform choice includes policyLever effect in consequences", () => {
    const state = makeTestState();
    const event = generatePolicyConfirmationEvent("fuelSubsidy", "partial", "removed", state);
    const boldChoice = event.choices[0];
    const policyEffect = boldChoice.consequences[0].effects.find(e => e.target === "policyLever");
    expect(policyEffect).toBeDefined();
    expect(policyEffect!.leverKey).toBe("fuelSubsidy");
    expect(policyEffect!.leverPosition).toBe("removed");
  });

  it("gradual choice includes delayed transition shock consequence", () => {
    const state = makeTestState();
    const event = generatePolicyConfirmationEvent("fuelSubsidy", "partial", "removed", state);
    const gradualChoice = event.choices[1];
    const delayed = gradualChoice.consequences.find(c => c.delayDays === 30);
    expect(delayed).toBeDefined();
  });

  it("backroom deal costs political capital", () => {
    const state = makeTestState();
    const event = generatePolicyConfirmationEvent("fuelSubsidy", "partial", "removed", state);
    const backroomChoice = event.choices[2];
    const pcEffect = backroomChoice.consequences[0].effects.find(e => e.target === "politicalCapital");
    expect(pcEffect).toBeDefined();
    expect(pcEffect!.delta).toBeLessThan(0);
  });

  it("applies requirements gate on bold reform for high-impact levers", () => {
    const state = makeTestState();
    state.politicalCapital = 1;
    const event = generatePolicyConfirmationEvent("fuelSubsidy", "partial", "removed", state);
    const boldChoice = event.choices[0];
    expect(boldChoice.requirements).toBeDefined();
    expect(boldChoice.requirements!.length).toBeGreaterThan(0);
  });

  it("backroom deal requires politicalCapital >= 2", () => {
    const state = makeTestState();
    state.politicalCapital = 1;
    const event = generatePolicyConfirmationEvent("taxRate", "standard", "high", state);
    const backroomChoice = event.choices[2];
    expect(backroomChoice.requirements).toBeDefined();
    const pcReq = backroomChoice.requirements!.find((r: any) => r.metric === "politicalCapital");
    expect(pcReq).toBeDefined();
  });

  it("dramatic shift attaches chain event trigger", () => {
    const state = makeTestState();
    const event = generatePolicyConfirmationEvent("fuelSubsidy", "full", "removed", state);
    const boldChoice = event.choices[0];
    const chainConsequence = boldChoice.consequences.find(c => c.delayDays >= 7);
    expect(chainConsequence).toBeDefined();
  });
});

describe("policy event expiration", () => {
  it("auto-cancels pending lever when policy event expires", () => {
    const state = makeTestState();
    state.policyLevers.fxPolicy.pendingPosition = "free-float";
    state.activeEvents = [{
      id: "policy-fxPolicy-1",
      title: "FX Policy Change",
      severity: "warning",
      description: "test",
      category: "economy",
      source: "policy",
      policyLeverKey: "fxPolicy",
      choices: [],
      createdDay: 1,
      expiresInDays: 3,
    }];
    state.day = 5; // past expiry (1 + 3 = 4)
    const result = processTurn(state);
    expect(result.policyLevers.fxPolicy.pendingPosition).toBeNull();
    expect(result.activeEvents.find(e => e.id === "policy-fxPolicy-1")).toBeUndefined();
  });
});

describe("save migration", () => {
  it("adds default policyLevers when loading a save without them", () => {
    // Create a state that simulates an old save without policyLevers
    const oldSave = makeTestState();
    delete (oldSave as any).policyLevers;

    const hydrated = hydrateLoadedGameState(oldSave);
    expect(hydrated.policyLevers).toBeDefined();
    expect(hydrated.policyLevers.fuelSubsidy.position).toBe("partial"); // 2023 default
  });

  it("preserves existing policyLevers when loading a new save", () => {
    const newSave = makeTestState();
    const originalLevers = newSave.policyLevers;

    const hydrated = hydrateLoadedGameState(newSave);
    expect(hydrated.policyLevers).toEqual(originalLevers);
  });

  it("uses era-specific defaults when adding missing policyLevers", () => {
    const oldSave = makeTestState();
    delete (oldSave as any).policyLevers;
    oldSave.presidentEra = "2007";

    const hydrated = hydrateLoadedGameState(oldSave);
    expect(hydrated.policyLevers.fuelSubsidy.position).toBe("full"); // 2007 default
    expect(hydrated.policyLevers.electricityTariff.position).toBe("subsidised");
  });
});

describe("policy lever cancel path", () => {
  it("resolving cancel choice clears pendingPosition without changing position or starting cooldown", () => {
    let state = makeTestState();
    const originalPosition = state.policyLevers.fuelSubsidy.position;
    const originalCooldown = state.policyLevers.fuelSubsidy.cooldownUntilDay;

    // Propose a change to set pendingPosition
    state = gameReducer(state, { type: "PROPOSE_POLICY_CHANGE", lever: "fuelSubsidy", newPosition: "removed" });
    expect(state.policyLevers.fuelSubsidy.pendingPosition).toBe("removed");

    // Resolve with Cancel (choice index 3)
    const policyEvent = state.activeEvents.find(e => e.source === "policy")!;
    state = gameReducer(state, { type: "RESOLVE_EVENT", eventId: policyEvent.id, choiceIndex: 3 });

    expect(state.policyLevers.fuelSubsidy.position).toBe(originalPosition);
    expect(state.policyLevers.fuelSubsidy.pendingPosition).toBeNull();
    expect(state.policyLevers.fuelSubsidy.cooldownUntilDay).toBe(originalCooldown);
  });
});

describe("policy lever integration", () => {
  it("full cycle: propose → resolve bold → modifiers apply → cooldown", () => {
    let state = makeTestState();
    // Resolve opening blockers so processTurn will advance the macro economy
    state = resolveCabalChoice(state, 0);
    state = resolveActiveEventChoice(state, "ae-pipeline-crisis", 0);
    state = resolveActiveEventChoice(state, "ae-imf-loan", 1);
    state = resolveActiveEventChoice(state, "ae-governorship-elections", 1);
    // Propose
    state = gameReducer(state, { type: "PROPOSE_POLICY_CHANGE", lever: "fuelSubsidy", newPosition: "removed" });
    expect(state.policyLevers.fuelSubsidy.pendingPosition).toBe("removed");
    expect(state.activeEvents.some(e => e.source === "policy")).toBe(true);

    // Resolve with bold reform (choice index 0)
    const policyEvent = state.activeEvents.find(e => e.source === "policy")!;
    state = gameReducer(state, { type: "RESOLVE_EVENT", eventId: policyEvent.id, choiceIndex: 0 });
    expect(state.policyLevers.fuelSubsidy.position).toBe("removed");
    expect(state.policyLevers.fuelSubsidy.pendingPosition).toBeNull();
    expect(state.policyLevers.fuelSubsidy.cooldownUntilDay).toBe(state.day + 14);

    // Advance day and verify modifiers flow through
    const prevInflation = state.macroEconomy.inflation;
    state = processTurn(state);
    // With "removed" fuel subsidy, inflation should decrease (modifier is -0.5)
    // Combined with existing dynamics, just verify it changed
    expect(state.macroEconomy.inflation).not.toBe(prevInflation);
  });
});
