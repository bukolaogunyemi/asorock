import { getChainById, getChainStep, getTriggeredChains } from "./eventChains";
import { getQuickActionById, getTriggeredActiveEvents } from "./gameContent";
import { checkBetrayalRisk, getTraitEffect } from "./traits";
import { checkDefeat, checkVictory } from "./victorySystem";
import type { FailureState, VictoryPath } from "./victorySystem";
import type {
  ActiveEvent,
  AnyPolicyPosition,
  CabalFocus,
  CabalMeetingState,
  CharacterState,
  ChoiceRequirement,
  Consequence,
  CourtCase,
  Effect,
  EventChoice,
  FactionState,
  GameInboxMessage,
  GameState,
  GovernorState,
  Hook,
  LegacyMilestoneRecord,
  MacroKey,
  PolicyLeverKey,
  PolicyLeverState,
  Relationship,
  TurnLogEntry,
} from "./gameTypes";
import { POLICY_LEVER_DEFS, POLICY_MODIFIER_SCALE, POLICY_COOLDOWN_DAYS, type PolicyModifiers, ministryPositions, cabinetCandidates, type MinistryPosition } from "./gameData";
import { FACTION_PROFILES, DEMAND_EXPIRE_TIER70_LOYALTY_LOSS, DEMAND_EXPIRE_TIER90_LOYALTY_LOSS, DEMAND_EXPIRE_GRIEVANCE_GAIN, DEMAND_EXPIRE_STABILITY_LOSS } from "./factionProfiles";
import { processPartyTurn } from "./partyEngine";
import { computeFactionDrift, updateGrievance, checkGrievanceThresholds } from "./factionDrift";
import { generateAdvisorLine, generateHeadline, generateInboxMessage } from "./factionNarrative";
import { processLegislativeTurn, generateAdviserBriefing } from "./legislativeEngine";
import { processGodfatherTurn, getPatronageEffects } from "./godfatherEngine";
import { calculateComplianceScore, calculateZoneBalances, getConsequences } from "./federalCharacter";
import { processIntelligenceTurn } from "./intelligenceEngine";

export type {
  ActiveEvent,
  CharacterState,
  ChoiceRequirement,
  Consequence,
  CourtCase,
  Effect,
  FactionState,
  GameInboxMessage,
  GameState,
  GovernorState,
  Hook,
  LegacyMilestoneRecord,
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const roundMetric = (value: number) => Math.round(value * 100) / 100;
const TERM_LENGTH_DAYS = 1460;
const MACRO_LIMITS: Record<MacroKey, { min: number; max: number; digits: number }> = {
  inflation: { min: 0, max: 80, digits: 1 },
  fxRate: { min: 50, max: 4000, digits: 0 },
  reserves: { min: 0, max: 80, digits: 1 },
  debtToGdp: { min: 0, max: 120, digits: 1 },
  oilOutput: { min: 0.4, max: 3.5, digits: 2 },
  subsidyPressure: { min: 0, max: 100, digits: 0 },
};

const inferGoverningPhase = (daysInOffice: number, daysUntilElection: number): GameState["term"]["governingPhase"] => {
  if (daysUntilElection <= 30) return "election";
  if (daysUntilElection <= 180) return "campaign";
  if (daysUntilElection <= 540) return "pre-positioning";
  if (daysInOffice <= 90) return "honeymoon";
  return "governance";
};

const roundMacroValue = (key: MacroKey, value: number): number => {
  const limits = MACRO_LIMITS[key];
  const clamped = clamp(value, limits.min, limits.max);
  if (limits.digits === 0) return Math.round(clamped);
  const factor = 10 ** limits.digits;
  return Math.round(clamped * factor) / factor;
};

const getMetricValue = (state: GameState, metric: string): number | null => {
  const rootValue = state[metric as keyof GameState];
  if (typeof rootValue === "number") return rootValue;
  const macroValue = state.macroEconomy?.[metric as MacroKey];
  return typeof macroValue === "number" ? macroValue : null;
};

const averageFactionLoyalty = (state: GameState): number => {
  const factions = Object.values(state.factions);
  if (factions.length === 0) return 50;
  return factions.reduce((sum, faction) => sum + faction.loyalty, 0) / factions.length;
};

const weakestFactionName = (state: GameState): string | undefined => Object.values(state.factions)
  .sort((a, b) => a.loyalty - b.loyalty || b.influence - a.influence)[0]?.name;

const computeElectionScore = (state: GameState): number => {
  const factionLoyalty = averageFactionLoyalty(state);
  const macroTailwind = clamp((35 - state.macroEconomy.inflation) * 0.35 + (state.macroEconomy.reserves - 22) * 0.4 - Math.max(0, state.macroEconomy.fxRate - 1700) * 0.008, -10, 10);
  const raw = state.approval * 0.35
    + factionLoyalty * 0.32
    + state.trust * 0.18
    + state.stability * 0.08
    + (state.vicePresident.loyalty - 50) * 0.08
    + macroTailwind
    - Math.min(18, state.term.overstayDays * 0.06);
  return Math.round(clamp(raw, 0, 100));
};

const vicePresidentMood = (state: GameState, loyalty: number, ambition: number): GameState["vicePresident"]["mood"] => {
  if (state.healthCrisis.rumorsActive || state.healthCrisis.concealmentActive) {
    return loyalty < 35 ? "Plotting" : "Restless";
  }
  if (state.term.current > 1 && ambition >= 75 && loyalty < 55) return loyalty < 35 ? "Plotting" : "Restless";
  if (state.term.governingPhase === "campaign" && ambition >= 78) return "Restless";
  return loyalty < 32 ? "Plotting" : loyalty < 55 ? "Restless" : "Steady";
};

const syncStrategicState = (state: GameState): GameState => {
  const vpCharacter = state.characters[state.vicePresident.name];
  const loyalty = vpCharacter?.loyalty ?? state.vicePresident.loyalty;
  const ambition = vpCharacter?.ambition ?? state.vicePresident.ambition;
  const relationship = vpCharacter?.relationship ?? relationshipFromLoyalty(loyalty);
  const governingPhase = inferGoverningPhase(state.term.daysInOffice, state.term.daysUntilElection);
  const base = {
    ...state,
    vicePresident: {
      ...state.vicePresident,
      loyalty,
      ambition,
      relationship,
    },
    term: {
      ...state.term,
      governingPhase,
    },
  };
  return {
    ...base,
    vicePresident: {
      ...base.vicePresident,
      mood: vicePresidentMood(base, loyalty, ambition),
    },
    term: {
      ...base.term,
      electionMomentum: computeElectionScore(base),
    },
  };
};

export function relationshipFromLoyalty(loyalty: number): Relationship {
  if (loyalty >= 85) return "Loyal";
  if (loyalty >= 70) return "Friendly";
  if (loyalty >= 55) return "Neutral";
  if (loyalty >= 40) return "Wary";
  if (loyalty >= 25) return "Distrustful";
  return "Hostile";
}

const factionStanceFromLoyalty = (loyalty: number): GameState["factions"][string]["stance"] => {
  if (loyalty >= 75) return "Allied";
  if (loyalty >= 60) return "Cooperative";
  if (loyalty >= 45) return "Neutral";
  if (loyalty >= 30) return "Opposed";
  return "Hostile";
};

const focusToCategory = (focus: CabalFocus): ActiveEvent["category"] => {
  switch (focus) {
    case "economy":
      return "economy";
    case "security":
      return "security";
    default:
      return "politics";
  }
};

const maybeCharacterEffect = (name: string | undefined, delta: number, description: string): Effect[] => name ? [{ target: "character", characterName: name, delta, description }] : [];
const maybeFactionEffect = (name: string | undefined, delta: number, description: string): Effect[] => name ? [{ target: "faction", factionName: name, delta, description }] : [];

export function requirementsMet(state: GameState, requirements?: Array<{ metric: string; min?: number; max?: number }>): boolean {
  if (!requirements?.length) return true;
  return requirements.every((requirement) => {
    const rawValue = getMetricValue(state, requirement.metric);
    if (rawValue === null) return false;
    return (requirement.min === undefined || rawValue >= requirement.min)
      && (requirement.max === undefined || rawValue <= requirement.max);
  });
}


export function processConsequences(state: GameState, consequences: Consequence[]): GameState {
  let next: GameState = {
    ...state,
    characters: { ...state.characters },
    factions: { ...state.factions },
    governors: state.governors.map((governor) => ({ ...governor })),
    macroEconomy: { ...state.macroEconomy },
  };

  for (const consequence of consequences) {
    for (const effect of consequence.effects) {
      switch (effect.target) {
        case "approval":
          next.approval = Math.round(clamp(next.approval + effect.delta, 0, 100));
          break;
        case "treasury":
          next.treasury = roundMetric(next.treasury + effect.delta);
          break;
        case "stability":
          next.stability = Math.round(clamp(next.stability + effect.delta, 0, 100));
          break;
        case "outrage":
          next.outrage = Math.round(clamp(next.outrage + effect.delta, 0, 100));
          break;
        case "trust":
          next.trust = Math.round(clamp(next.trust + effect.delta, 0, 100));
          break;
        case "stress":
          next.stress = Math.round(clamp(next.stress + effect.delta, 0, 100));
          break;
        case "politicalCapital":
          next.politicalCapital = Math.round(clamp(next.politicalCapital + effect.delta, 0, 100));
          break;
        case "health":
          next.health = Math.round(clamp(next.health + effect.delta, 0, 100));
          break;
        case "judicialIndependence":
          next.judicialIndependence = Math.round(clamp(next.judicialIndependence + effect.delta, 0, 100));
          break;
        case "character":
          if (effect.characterName && next.characters[effect.characterName]) {
            const current = next.characters[effect.characterName];
            const loyalty = Math.round(clamp(current.loyalty + effect.delta, 0, 100));
            next.characters[effect.characterName] = { ...current, loyalty, relationship: relationshipFromLoyalty(loyalty) };
          }
          break;
        case "faction":
          if (effect.factionName && next.factions[effect.factionName]) {
            const current = next.factions[effect.factionName];
            const loyalty = Math.round(clamp(current.loyalty + effect.delta, 0, 100));
            next.factions[effect.factionName] = { ...current, loyalty, stance: factionStanceFromLoyalty(loyalty) };
          }
          break;
        case "governorApproval":
          if (effect.governorName) {
            next.governors = next.governors.map((governor) => governor.name === effect.governorName ? { ...governor, approval: Math.round(clamp(governor.approval + effect.delta, 0, 100)) } : governor);
          }
          break;
        case "governorLoyalty":
          if (effect.governorName) {
            next.governors = next.governors.map((governor) => {
              if (governor.name !== effect.governorName) return governor;
              const loyalty = Math.round(clamp(governor.loyalty + effect.delta, 0, 100));
              return { ...governor, loyalty, relationship: relationshipFromLoyalty(loyalty) };
            });
          }
          break;
        case "macro":
        case "metric":
          if (effect.macroKey) {
            next.macroEconomy[effect.macroKey] = roundMacroValue(effect.macroKey, next.macroEconomy[effect.macroKey] + effect.delta);
          }
          break;
        case "policyLever":
          if (effect.leverKey && effect.leverPosition) {
            next.policyLevers = { ...next.policyLevers };
            next.policyLevers[effect.leverKey] = {
              position: effect.leverPosition,
              pendingPosition: null,
              cooldownUntilDay: effect.skipCooldown ? next.policyLevers[effect.leverKey].cooldownUntilDay : next.day + POLICY_COOLDOWN_DAYS,
            };
          }
          break;
        case "grievance":
          if (effect.factionName && next.factions[effect.factionName]) {
            const current = next.factions[effect.factionName];
            const grievance = Math.round(Math.max(0, Math.min(100, (current.grievance ?? 0) + effect.delta)));
            next.factions[effect.factionName] = { ...current, grievance };
          }
          break;
        default:
          break;
      }
    }
  }

  return next;
}
const appendTurnLog = (state: GameState, entry: TurnLogEntry): GameState => ({
  ...state,
  turnLog: [...state.turnLog, entry].slice(-120),
});

const queueFutureConsequences = (state: GameState, consequences: Consequence[]): GameState => {
  const delayed = consequences.filter((consequence) => consequence.delayDays > 0).map((consequence) => ({
    ...consequence,
    effects: consequence.effects.map((effect) => ({ ...effect })),
  }));

  if (!delayed.length) return state;
  return { ...state, pendingConsequences: [...state.pendingConsequences, ...delayed] };
};

const createInboxMessage = (
  state: GameState,
  partial: Omit<GameInboxMessage, "day" | "read"> & { day?: number; read?: boolean },
): GameInboxMessage => ({ day: partial.day ?? state.day, date: state.date, read: partial.read ?? false, ...partial });

const addInboxMessage = (state: GameState, message: GameInboxMessage): GameState => ({
  ...state,
  inboxMessages: [message, ...state.inboxMessages].slice(0, 40),
});

const updateHookState = (
  state: GameState,
  ownerName: string,
  hookId: string,
  updater: (hook: Hook) => Hook,
): GameState => {
  const owner = state.characters[ownerName];
  if (!owner) return state;
  const hookIndex = owner.hooks.findIndex((hook) => hook.id === hookId);
  if (hookIndex < 0) return state;
  const hooks = owner.hooks.map((hook, index) => index === hookIndex ? updater(hook) : hook);
  return {
    ...state,
    characters: {
      ...state.characters,
      [ownerName]: {
        ...owner,
        hooks,
      },
    },
  };
};

const getHookReference = (state: GameState, ownerName: string, hookId: string): { owner: CharacterState; hook: Hook } | null => {
  const owner = state.characters[ownerName];
  const hook = owner?.hooks.find((candidate) => candidate.id === hookId);
  return owner && hook ? { owner, hook } : null;
};

const hookSeverityThreshold = (severity: Hook["severity"]): number => {
  switch (severity) {
    case "minor":
      return 52;
    case "major":
      return 64;
    default:
      return 78;
  }
};

const bestHookCandidate = (state: GameState): { ownerName: string; hook: Hook } | null => {
  const severityWeight: Record<Hook["severity"], number> = { minor: 1, major: 2, devastating: 3 };
  const candidates = Object.entries(state.characters)
    .flatMap(([ownerName, character]) => character.hooks.map((hook) => ({ ownerName, hook })))
    .filter(({ hook }) => !hook.used && !hook.usable && !hook.underInvestigation)
    .sort((a, b) => (severityWeight[b.hook.severity] * 30 + b.hook.evidence) - (severityWeight[a.hook.severity] * 30 + a.hook.evidence));
  return candidates[0] ?? null;
};

const createProbeInbox = (state: GameState, hook: Hook): GameInboxMessage => createInboxMessage(state, {
  id: `probe-${hook.id}-${state.day}`,
  sender: "Presidential Intelligence Cell",
  role: "Internal Security Desk",
  initials: "PI",
  subject: `Quiet probe opened on ${hook.target}`,
  preview: "Analysts have begun consolidating evidence and pressure points for the presidency.",
  fullText: `A quiet probe is now open on ${hook.target}. Current evidence level: ${hook.evidence}%. The file will mature over the next few days if pressure is maintained.`,
  priority: "Normal",
  source: "system",
  responseOptions: [
    { label: "Acknowledge", actionId: "acknowledge" },
    { label: "Accelerate Probe", actionId: "investigate" },
    { label: "Suspend Probe", actionId: "dismiss" },
  ],
});

const primeHookInvestigation = (state: GameState, ownerName: string, hookId: string, silent = false): GameState => {
  const reference = getHookReference(state, ownerName, hookId);
  if (!reference || reference.hook.used || reference.hook.usable || reference.hook.underInvestigation) return state;

  let next = updateHookState(state, ownerName, hookId, (hook) => ({
    ...hook,
    discovered: true,
    underInvestigation: true,
  }));

  if (!silent) {
    next = processConsequences(next, [{
      id: `hook-investigation-${hookId}-${state.day}`,
      sourceEvent: hookId,
      delayDays: 0,
      description: `A discreet investigative file has been opened on ${reference.hook.target}`,
      effects: [
        { target: "politicalCapital", delta: -1, description: "A probe consumes insider bandwidth" },
        { target: "stress", delta: 1, description: "Managing the file adds personal strain" },
      ],
    }]);
    next = appendTurnLog(next, {
      day: state.day,
      date: state.date,
      event: `Quiet probe opened on ${reference.hook.target}`,
      effects: [reference.hook.description],
      category: "hook",
    });
    next = addInboxMessage(next, createProbeInbox(next, reference.hook));
  }

  return next;
};

const setVicePresidentLoyalty = (state: GameState, delta: number): GameState => {
  const loyalty = Math.round(clamp(state.vicePresident.loyalty + delta, 0, 100));
  const relationship = relationshipFromLoyalty(loyalty);
  const characters = state.characters[state.vicePresident.name]
    ? {
        ...state.characters,
        [state.vicePresident.name]: {
          ...state.characters[state.vicePresident.name],
          loyalty,
          relationship,
        },
      }
    : state.characters;

  return {
    ...state,
    characters,
    vicePresident: {
      ...state.vicePresident,
      loyalty,
      relationship,
    },
  };
};

const strategicConsequence = (id: string, sourceEvent: string, description: string, effects: Consequence["effects"], delayDays = 0): Consequence => ({
  id,
  sourceEvent,
  description,
  effects,
  delayDays,
});

const createStrategicEvent = (state: GameState, kind: "media-chat" | "faction-report" | "economic-snapshot"): ActiveEvent => {
  const suffix = `${kind}-${state.day}`;
  if (kind === "media-chat") {
    return {
      id: `scheduled-${suffix}`,
      title: "Monthly Presidential Media Chat",
      severity: "warning",
      description: "The monthly media chat is due. Your framing now will shape the next leg of the presidency.",
      category: "media",
      source: "contextual",
      createdDay: state.day,
      choices: [
        {
          id: `scheduled-${suffix}-steady`,
          label: "Project calm authority",
          context: "Keep the message disciplined and reassure both elites and the street.",
          consequences: [
            strategicConsequence(`scheduled-${suffix}-steady-now`, suffix, "The media chat steadies the national mood", [
              { target: "trust", delta: 3, description: "The presidency looks composed" },
              { target: "approval", delta: 1, description: "The public hears a coherent message" },
            ]),
          ],
        },
        {
          id: `scheduled-${suffix}-populist`,
          label: "Attack opponents and rally the base",
          context: "Lean into political combat and dare your rivals to answer.",
          consequences: [
            strategicConsequence(`scheduled-${suffix}-populist-now`, suffix, "The base is energized but elite trust slips", [
              { target: "approval", delta: 3, description: "Supporters love the aggression" },
              { target: "trust", delta: -2, description: "Institutional confidence slips" },
              { target: "stress", delta: 1, description: "The political temperature rises" },
            ]),
          ],
        },
        {
          id: `scheduled-${suffix}-cancel`,
          label: "Cancel the chat and hide behind surrogates",
          context: "Avoid the risk today and leave allies to defend the line.",
          consequences: [
            strategicConsequence(`scheduled-${suffix}-cancel-now`, suffix, "The cancellation creates a vacuum", [
              { target: "trust", delta: -4, description: "Silence fuels speculation" },
              { target: "outrage", delta: 2, description: "Commentary turns hostile" },
            ]),
          ],
        },
      ],
    };
  }

  if (kind === "faction-report") {
    return {
      id: `scheduled-${suffix}`,
      title: "Coalition Faction Report",
      severity: "warning",
      description: "Your advisers have delivered a fresh coalition map. Someone needs to decide how much political cash to spend holding the party together.",
      category: "politics",
      source: "contextual",
      createdDay: state.day,
      choices: [
        {
          id: `scheduled-${suffix}-buy-time`,
          label: "Spend capital to calm the coalition",
          context: "Offer concessions and a clearer succession map to the party elders.",
          consequences: [
            strategicConsequence(`scheduled-${suffix}-buy-time-now`, suffix, "Concessions buy a month of unity", [
              { target: "politicalCapital", delta: -4, description: "Concessions cost leverage" },
              { target: "trust", delta: 1, description: "Insiders see a functioning coalition" },
            ]),
          ],
        },
        {
          id: `scheduled-${suffix}-hold-line`,
          label: "Hold the line on appointments",
          context: "Signal that the presidency still sets the terms of coalition management.",
          consequences: [
            strategicConsequence(`scheduled-${suffix}-hold-line-now`, suffix, "The line holds for now but some allies feel slighted", [
              { target: "politicalCapital", delta: 2, description: "You preserve leverage" },
              { target: "approval", delta: -1, description: "The coalition grumbling leaks out" },
            ]),
          ],
        },
      ],
    };
  }

  return {
    id: `scheduled-${suffix}`,
    title: "Monthly Economic Snapshot",
    severity: "warning",
    description: "The monthly economic snapshot is on your desk. Markets want to know whether the presidency still has a reform story.",
    category: "economy",
    source: "contextual",
    createdDay: state.day,
    choices: [
      {
        id: `scheduled-${suffix}-reform`,
        label: "Announce a disciplined reform package",
        context: "Accept short-term pain and tell the country where the sacrifices are going.",
        consequences: [
          strategicConsequence(`scheduled-${suffix}-reform-now`, suffix, "Markets reward the reform signal", [
            { target: "trust", delta: 2, description: "Markets believe the centre is holding" },
            { target: "treasury", delta: 0.05, description: "Financing conditions improve slightly" },
            { target: "approval", delta: -1, description: "The message is still painful on the street" },
          ]),
          strategicConsequence(`scheduled-${suffix}-reform-later`, suffix, "The reform story stabilizes after the first shock", [
            { target: "stability", delta: 2, description: "Confidence returns over time" },
          ], 4),
        ],
      },
      {
        id: `scheduled-${suffix}-subsidy`,
        label: "Order emergency relief spending",
        context: "Buy immediate breathing room and deal with the fiscal hole later.",
        consequences: [
          strategicConsequence(`scheduled-${suffix}-subsidy-now`, suffix, "The emergency package calms the public but costs cash", [
            { target: "approval", delta: 2, description: "Relief spending lands quickly" },
            { target: "treasury", delta: -0.06, description: "Fiscal room narrows" },
            { target: "stability", delta: 1, description: "The street settles for now" },
          ]),
        ],
      },
    ],
  };
};

const queueContextualEvent = (state: GameState, event: ActiveEvent): GameState => {
  if (state.activeEvents.some((candidate) => candidate.title === event.title && candidate.source === "contextual")) {
    return state;
  }
  return {
    ...state,
    activeEvents: [...state.activeEvents, event],
  };
};

const economyPromiseProgress = (state: GameState): number => {
  const inflationScore = clamp((36 - state.macroEconomy.inflation) * 3, 0, 100);
  const fxScore = clamp(100 - Math.max(0, state.macroEconomy.fxRate - 900) / 10, 0, 100);
  const reservesScore = clamp(state.macroEconomy.reserves * 2.4, 0, 100);
  const subsidyScore = clamp(100 - state.macroEconomy.subsidyPressure, 0, 100);
  return Math.round(clamp(
    inflationScore * 0.28
      + fxScore * 0.2
      + reservesScore * 0.16
      + subsidyScore * 0.12
      + state.trust * 0.14
      + state.stability * 0.1,
    0,
    100,
  ));
};

const createMacroHistoryPoint = (day: number, macroEconomy: GameState["macroEconomy"]): GameState["macroHistory"][number] => ({ day, ...macroEconomy });

const economyPressureScore = (state: GameState): number => state.macroEconomy.inflation * 1.6
  + state.macroEconomy.subsidyPressure
  + Math.max(0, state.macroEconomy.fxRate - 1200) * 0.03
  + Math.max(0, 28 - state.macroEconomy.reserves) * 3
  + Math.max(0, state.macroEconomy.debtToGdp - 38) * 0.9
  + Math.max(0, 50 - state.trust) * 0.8;

const securityPressureScore = (state: GameState): number => (100 - state.stability) * 1.3
  + state.outrage * 0.5
  + state.activeEvents.filter((event) => event.category === "security" || event.category === "governance").length * 12;

const politicsPressureScore = (state: GameState): number => (100 - state.politicalCapital)
  + (100 - averageFactionLoyalty(state)) * 0.9
  + Math.max(0, 70 - state.vicePresident.loyalty) * 0.8
  + Math.max(0, state.vicePresident.ambition - 65) * 0.7
  + state.activeEvents.filter((event) => event.category === "politics").length * 10;

export function createDailyCabalMeeting(state: GameState): CabalMeetingState {
  const scores: Record<CabalFocus, number> = {
    economy: economyPressureScore(state),
    security: securityPressureScore(state),
    politics: politicsPressureScore(state),
  };

  const focus = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "economy") as CabalFocus;
  const weakestFaction = weakestFactionName(state);

  if (focus === "security") {
    return {
      day: state.day,
      focus,
      adviser: "Brig. Kabiru Musa (Rtd)",
      role: "National Security Adviser",
      title: "Morning Cabal: Security Posture",
      brief: `National stability is ${state.stability}. The villa needs a clear line before theatre commanders, governors, and the press start free-lancing.`,
      recommendedChoiceId: state.stability < 40 ? "cabal-security-surge" : "cabal-security-truce",
      resolved: false,
      choices: [
        {
          id: "cabal-security-surge",
          label: "Authorize a hard surge",
          summary: "Push men and money forward fast, accept the heat, and buy immediate control.",
          consequences: [
            strategicConsequence(`cabal-security-surge-${state.day}`, "cabal-security", "The villa orders a visible security surge", [
              { target: "stability", delta: 4, description: "Command and control tightens" },
              { target: "approval", delta: 1, description: "Supporters read decisiveness" },
              { target: "stress", delta: 2, description: "The escalation increases presidential strain" },
              { target: "treasury", delta: -0.06, description: "Forward deployments consume cash" },
              { target: "outrage", delta: 1, description: "Civil liberties concerns begin to surface" },
              { target: "macro", macroKey: "oilOutput", delta: 0.04, description: "Protected corridors support output" },
            ]),
          ],
        },
        {
          id: "cabal-security-truce",
          label: "Broker a local truce",
          summary: "Trade tempo for political cover by bringing governors and intermediaries into the room.",
          consequences: [
            strategicConsequence(`cabal-security-truce-${state.day}`, "cabal-security", "A governor-backed truce line is adopted", [
              { target: "stability", delta: 2, description: "Violence cools at the edges" },
              { target: "trust", delta: 2, description: "Observers see a political strategy" },
              { target: "outrage", delta: -3, description: "The public welcomes de-escalation" },
              { target: "politicalCapital", delta: -2, description: "Broader consultation costs leverage" },
              { target: "macro", macroKey: "oilOutput", delta: 0.08, description: "Critical infrastructure sees faster normalization" },
            ]),
          ],
        },
        {
          id: "cabal-security-fortify",
          label: "Fortify and communicate",
          summary: "Accept slower progress, protect core assets, and narrate the state as calm and competent.",
          consequences: [
            strategicConsequence(`cabal-security-fortify-${state.day}`, "cabal-security", "The presidency chooses containment with a strong communications shield", [
              { target: "stability", delta: 1, description: "Core sites are secured" },
              { target: "approval", delta: 1, description: "The public hears a calmer line" },
              { target: "trust", delta: 1, description: "The system looks coordinated" },
              { target: "stress", delta: 1, description: "The cautious posture still weighs on the centre" },
              { target: "macro", macroKey: "oilOutput", delta: 0.02, description: "Output edges up without a dramatic gamble" },
            ]),
          ],
        },
      ],
    };
  }

  if (focus === "politics") {
    return {
      day: state.day,
      focus,
      adviser: "Chief Chidubem Okafor",
      role: "Party Chairman",
      title: "Morning Cabal: Hold The Coalition",
      brief: `${state.vicePresident.name} is ${state.vicePresident.mood.toLowerCase()} and the weakest bloc is ${weakestFaction ?? "the coalition fringe"}. Abuja expects the villa to pick a line before the gossip outruns the whip.`,
      recommendedChoiceId: state.politicalCapital < 42 ? "cabal-politics-freeze" : "cabal-politics-patronage",
      resolved: false,
      choices: [
        {
          id: "cabal-politics-patronage",
          label: "Spend appointments and patronage",
          summary: "Stabilise the coalition the old way and live with the reputational bill.",
          consequences: [
            strategicConsequence(`cabal-politics-patronage-${state.day}`, "cabal-politics", "The villa spends patronage to quiet coalition nerves", [
              { target: "politicalCapital", delta: -5, description: "Patronage burns strategic leverage" },
              { target: "approval", delta: 1, description: "Short-term noise falls" },
              { target: "trust", delta: 1, description: "The coalition sees a working centre" },
              ...maybeFactionEffect(weakestFaction, 8, "The weakest bloc gets a visible concession"),
              ...maybeCharacterEffect(state.vicePresident.name, 3, "The vice president reads the move as inclusion, not exclusion"),
            ]),
          ],
        },
        {
          id: "cabal-politics-freeze",
          label: "Freeze out the loudest rivals",
          summary: "Reassert hierarchy fast and dare disloyal actors to make the first open move.",
          consequences: [
            strategicConsequence(`cabal-politics-freeze-${state.day}`, "cabal-politics", "The villa decides to discipline the coalition rather than feed it", [
              { target: "politicalCapital", delta: 2, description: "Leverage is preserved" },
              { target: "trust", delta: -2, description: "Insiders hear the threat" },
              { target: "approval", delta: -1, description: "The fight leaks into public view" },
              ...maybeFactionEffect(weakestFaction, -6, "The weakest faction feels cornered"),
              ...maybeCharacterEffect(state.vicePresident.name, -4, "The vice president sees the circle tightening"),
            ]),
          ],
        },
        {
          id: "cabal-politics-dossiers",
          label: "Open quiet dossiers on the elite",
          summary: "Trade time and deniability for leverage you can use later.",
          consequences: [
            strategicConsequence(`cabal-politics-dossiers-${state.day}`, "cabal-politics", "The villa authorizes a quiet dossier campaign", [
              { target: "trust", delta: 2, description: "Reformers sense a more disciplined core" },
              { target: "politicalCapital", delta: -2, description: "Investigative attention has a cost" },
              ...maybeFactionEffect(weakestFaction, 2, "Suspicion alone can calm the most unruly bloc"),
            ]),
          ],
        },
      ],
    };
  }

  return {
    day: state.day,
    focus: "economy",
    adviser: "Alhaji Bello Kazeem",
    role: "Finance Minister",
    title: "Morning Cabal: Stabilise The Economy",
    brief: `Inflation is ${state.macroEconomy.inflation}% and FX is ${state.macroEconomy.fxRate.toLocaleString()} NGN/USD. The cabal wants a line before importers, labour, and the governors create their own.`,
    recommendedChoiceId: state.trust < 45 ? "cabal-economy-discipline" : state.approval < 40 ? "cabal-economy-relief" : "cabal-economy-discipline",
    resolved: false,
    choices: [
      {
        id: "cabal-economy-discipline",
        label: "Back painful reform discipline",
        summary: "Signal orthodoxy, accept immediate anger, and buy macro credibility.",
        consequences: [
          strategicConsequence(`cabal-economy-discipline-${state.day}`, "cabal-economy", "The villa backs a disciplined reform line", [
            { target: "trust", delta: 3, description: "Markets and institutions buy the signal" },
            { target: "approval", delta: -2, description: "Households hear more pain coming" },
            { target: "politicalCapital", delta: -2, description: "The coalition hates the austerity message" },
            { target: "macro", macroKey: "inflation", delta: -1.2, description: "Tighter policy cools inflation expectations" },
            { target: "macro", macroKey: "fxRate", delta: -60, description: "The naira finds a firmer floor" },
            { target: "macro", macroKey: "subsidyPressure", delta: -5, description: "Price support obligations ease" },
          ]),
          strategicConsequence(`cabal-economy-discipline-later-${state.day}`, "cabal-economy", "External buffers respond to the reform line", [
            { target: "macro", macroKey: "reserves", delta: 0.8, description: "Confidence rebuilds external buffers" },
            { target: "macro", macroKey: "debtToGdp", delta: -0.4, description: "Borrowing needs moderate" },
          ], 2),
        ],
      },
      {
        id: "cabal-economy-relief",
        label: "Spend to buy social calm",
        summary: "Keep the street onside first and accept that the macro picture may sag later.",
        consequences: [
          strategicConsequence(`cabal-economy-relief-${state.day}`, "cabal-economy", "The villa chooses relief over orthodoxy", [
            { target: "approval", delta: 3, description: "The public feels immediate relief" },
            { target: "stability", delta: 2, description: "Tension eases for now" },
            { target: "treasury", delta: -0.08, description: "Relief spending narrows fiscal room" },
            { target: "macro", macroKey: "inflation", delta: 0.9, description: "Fresh spending adds price pressure" },
            { target: "macro", macroKey: "debtToGdp", delta: 0.7, description: "Borrowing climbs" },
            { target: "macro", macroKey: "subsidyPressure", delta: 7, description: "More constituencies now expect compensation" },
          ]),
        ],
      },
      {
        id: "cabal-economy-cover",
        label: "Lean on insiders for temporary FX cover",
        summary: "Use private networks and off-book bargaining to stop the worst headlines today.",
        consequences: [
          strategicConsequence(`cabal-economy-cover-${state.day}`, "cabal-economy", "The presidency leans on elite channels to steady the tape", [
            { target: "trust", delta: -2, description: "The market senses improvised management" },
            { target: "politicalCapital", delta: 1, description: "Insider channels now owe the villa" },
            { target: "macro", macroKey: "fxRate", delta: -35, description: "FX pressure eases for a moment" },
            { target: "macro", macroKey: "reserves", delta: -1.5, description: "Temporary cover burns scarce buffers" },
          ]),
        ],
      },
    ],
  };
}

const promiseProgressForState = (state: GameState, category: GameState["campaignPromises"][number]["category"]): number => {
  switch (category) {
    case "economy":
      return economyPromiseProgress(state);
    case "security":
      return Math.round(clamp(state.stability * 0.55 + state.trust * 0.1 + averageFactionLoyalty(state) * 0.1 + state.approval * 0.15, 0, 100));
    case "welfare":
      return Math.round(clamp(state.approval * 0.35 + state.stability * 0.16 + state.trust * 0.12 + clamp(100 - state.macroEconomy.inflation * 2, 0, 100) * 0.2 + clamp(100 - state.macroEconomy.subsidyPressure, 0, 100) * 0.17, 0, 100));
    default:
      return Math.round(clamp(state.trust * 0.45 + state.politicalCapital * 0.3 + state.judicialIndependence * 0.25, 0, 100));
  }
};

const evaluateCampaignPromises = (state: GameState): { state: GameState; items: string[] } => {
  let next = { ...state, campaignPromises: state.campaignPromises.map((promise) => ({ ...promise })) };
  const items: string[] = [];

  next.campaignPromises = next.campaignPromises.map((promise) => {
    const progress = promiseProgressForState(next, promise.category);
    let status = promise.status;

    if (promise.status === "active") {
      if (progress >= 85 && next.day >= Math.round(promise.targetDay * 0.6)) {
        status = "fulfilled";
      } else if (next.day >= promise.targetDay && progress < 45) {
        status = "broken";
      }
    }

    if (status !== promise.status) {
      if (status === "fulfilled") {
        next.approval = Math.round(clamp(next.approval + 1, 0, 100));
        next.trust = Math.round(clamp(next.trust + 1, 0, 100));
        items.push(`Campaign promise delivered: ${promise.title}`);
      } else if (status === "broken") {
        next.approval = Math.round(clamp(next.approval - 2, 0, 100));
        next.trust = Math.round(clamp(next.trust - 2, 0, 100));
        next.outrage = Math.round(clamp(next.outrage + 2, 0, 100));
        items.push(`Campaign promise is now viewed as broken: ${promise.title}`);
      }
    }

    return {
      ...promise,
      progress,
      status,
    };
  });

  return { state: next, items };
};

const processStrategicRhythm = (state: GameState): { state: GameState; items: string[] } => {
  let next = syncStrategicState({
    ...state,
    term: { ...state.term },
    healthCrisis: { ...state.healthCrisis },
    vicePresident: { ...state.vicePresident },
    campaignPromises: state.campaignPromises.map((promise) => ({ ...promise })),
  });
  const items: string[] = [];

  next.term.daysInOffice += 1;
  next.term.daysUntilElection = Math.max(0, next.term.daysUntilElection - 1);
  next.term.daysUntilMediaChat -= 1;
  next.term.daysUntilFactionReport -= 1;
  next.term.daysUntilEconomicSnapshot -= 1;
  next.term.governingPhase = inferGoverningPhase(next.term.daysInOffice, next.term.daysUntilElection);

  if (next.term.daysUntilMediaChat <= 0) {
    next.term.daysUntilMediaChat = 30;
    next = queueContextualEvent(next, createStrategicEvent(next, "media-chat"));
    items.push("The monthly presidential media chat is now due");
  }

  if (next.term.daysUntilFactionReport <= 0) {
    next.term.daysUntilFactionReport = 30;
    next = queueContextualEvent(next, createStrategicEvent(next, "faction-report"));
    items.push("A fresh faction report has landed on your desk");
  }

  if (next.term.daysUntilEconomicSnapshot <= 0) {
    next.term.daysUntilEconomicSnapshot = 30;
    next = queueContextualEvent(next, createStrategicEvent(next, "economic-snapshot"));
    items.push("A monthly economic snapshot is demanding strategic attention");
  }

  if (next.term.daysUntilElection <= 180 && next.term.daysUntilElection > 0 && next.term.daysUntilElection % 14 == 0) {
    next.stress = Math.round(clamp(next.stress + 1, 0, 100));
    if (next.approval >= 52) {
      next.approval = Math.round(clamp(next.approval + 1, 0, 100));
      items.push("Campaign momentum is lifting your public standing");
    } else {
      next.politicalCapital = Math.round(clamp(next.politicalCapital - 1, 0, 100));
      items.push("Campaign season is draining political capital faster than expected");
    }
  }

  if (next.term.current > 1 && next.vicePresident.ambition >= 70) {
    next = setVicePresidentLoyalty(next, -1);
    if (next.term.daysInOffice % 10 === 0) {
      items.push(`${next.vicePresident.name} is growing more vocal about succession`);
    }
  }

  if (next.term.current > 2) {
    next.term.overstayDays += 1;
    if (next.term.overstayDays % 10 === 0) {
      next.outrage = Math.round(clamp(next.outrage + 1, 0, 100));
      next.trust = Math.round(clamp(next.trust - 1, 0, 100));
      items.push("Overstay talk is now a live part of the political atmosphere");
    }
  }

  if (next.stress > 85) {
    next.healthCrisis.consecutiveHighStressDays += 1;
  } else {
    next.healthCrisis.consecutiveHighStressDays = 0;
    if (next.health < 92 && next.stress < 55) {
      next.health = Math.round(clamp(next.health + 1, 0, 100));
    }
  }

  if (!next.healthCrisis.rumorsActive && next.healthCrisis.consecutiveHighStressDays >= 7) {
    next.healthCrisis.rumorsActive = true;
    next.outrage = Math.round(clamp(next.outrage + 5, 0, 100));
    next.stability = Math.round(clamp(next.stability - 4, 0, 100));
    next = setVicePresidentLoyalty(next, -3);
    items.push("Rumours about the president's health are beginning to circulate");
  }

  if (next.healthCrisis.rumorsActive && next.health < 20 && !next.healthCrisis.announced && !next.healthCrisis.concealmentActive) {
    next.healthCrisis.concealmentActive = true;
    next.trust = Math.round(clamp(next.trust - 2, 0, 100));
    items.push("A health emergency is now being quietly concealed inside the villa");
  }

  const promises = evaluateCampaignPromises(next);
  next = promises.state;
  items.push(...promises.items);

  return { state: syncStrategicState(next), items };
};

const resolveElectionCycle = (state: GameState): { state: GameState; items: string[]; defeatState?: string } => {
  if (state.term.daysUntilElection > 0) return { state, items: [] };

  const score = computeElectionScore(state);
  if (score >= 50) {
    let next: GameState = {
      ...state,
      term: {
        ...state.term,
        current: state.term.current + 1,
        daysInOffice: 0,
        daysUntilElection: TERM_LENGTH_DAYS,
        daysUntilMediaChat: 30,
        daysUntilFactionReport: 30,
        daysUntilEconomicSnapshot: 30,
        reelectionsWon: state.term.reelectionsWon + 1,
        governingPhase: "honeymoon" as const,
        electionMomentum: Math.max(45, score - 5),
      },
      approval: Math.round(clamp(state.approval + 4, 0, 100)),
      trust: Math.round(clamp(state.trust + 4, 0, 100)),
      politicalCapital: Math.round(clamp(state.politicalCapital + 8, 0, 100)),
      outrage: Math.round(clamp(state.outrage - 6, 0, 100)),
      healthCrisis: {
        ...state.healthCrisis,
        announced: false,
        concealmentActive: false,
      },
    };

    next = setVicePresidentLoyalty(next, next.vicePresident.ambition >= 75 ? -6 : 2);
    next = addInboxMessage(next, createInboxMessage(next, {
      id: `election-win-${state.day}`,
      sender: "INEC Situation Room",
      role: "Election Control",
      initials: "IN",
      subject: "INEC certifies your re-election",
      preview: "The coalition held. A new term begins, but succession politics just became sharper.",
      fullText: `Estimated governing margin: ${score}%. Your coalition has been returned to office, but the next term resets neither ambition nor elite expectations.`,
      priority: "Urgent",
      source: "system",
      responseOptions: [
        { label: "Address the Nation", actionId: "approve" },
        { label: "Acknowledge", actionId: "acknowledge" },
      ],
    }));

    next = syncStrategicState(next);
    return {
      state: next,
      items: [
        `You secured re-election with an estimated ${score}% governing edge`,
        `${next.vicePresident.name} enters the new term looking ${next.vicePresident.mood.toLowerCase()}`,
      ],
    };
  }

  const defeatState = state.outrage >= 75 ? "military-coup" : state.outrage >= 45 || state.healthCrisis.concealmentActive ? "constitutional-crisis" : "electoral-defeat";
  const next = addInboxMessage(state, createInboxMessage(state, {
    id: `election-loss-${state.day}`,
    sender: "INEC Situation Room",
    role: "Election Control",
    initials: "IN",
    subject: "INEC declares the opposition ticket the winner",
    preview: "The ruling coalition has been defeated and the transfer of power is now the dominant file in Abuja.",
    fullText: `Estimated governing score: ${score}%. The coalition failed to carry the election. Attention now turns to whether the handover will be orderly, disputed, or violent.`,
    priority: "Critical",
    source: "system",
    responseOptions: [
      { label: "Concede Gracefully", actionId: "approve" },
      { label: "Demand Recount", actionId: "appeal" },
      { label: "Consult Legal Team", actionId: "investigate" },
    ],
  }));

  return {
    state: next,
    items: [`The opposition defeated you in the election with an estimated ${100 - score}% edge`],
    defeatState,
  };
};

const sourceRoleForCategory = (category: ActiveEvent["category"]): { sender: string; role: string; initials: string } => {
  switch (category) {
    case "economy":
      return { sender: "Alhaji Bello Kazeem", role: "Finance Minister", initials: "BK" };
    case "security":
      return { sender: "Brig. Kabiru Musa (Rtd)", role: "National Security Adviser", initials: "KM" };
    case "politics":
      return { sender: "Chief Chidubem Okafor", role: "Party Chairman", initials: "CO" };
    case "diplomacy":
      return { sender: "Amb. Ibrahim Garba", role: "Foreign Affairs", initials: "IG" };
    case "media":
      return { sender: "State House Press Desk", role: "Media Desk", initials: "MD" };
    default:
      return { sender: "State House Situation Room", role: "Presidential Secretariat", initials: "SR" };
  }
};

const inferPillarFromConsequences = (consequences: Consequence[]): LegacyMilestoneRecord["pillar"] => {
  const effects = consequences.flatMap((consequence) => consequence.effects);
  if (effects.some((effect) => effect.target === "stability" || effect.target === "governorLoyalty")) return "Security & Peace";
  if (effects.some((effect) => effect.target === "treasury" || effect.target === "politicalCapital" || effect.target === "macro")) return "Economic Reform";
  if (effects.some((effect) => effect.target === "judicialIndependence" || effect.target === "trust")) return "Democratic Process";
  if (effects.some((effect) => effect.target === "approval" || effect.target === "outrage")) return "Social Welfare";
  return "Statecraft";
};

const inferImpact = (consequences: Consequence[]): number => consequences.reduce((sum, consequence) => sum + consequence.effects.reduce((effectSum, effect) => {
  switch (effect.target) {
    case "approval":
    case "trust":
    case "stability":
    case "politicalCapital":
    case "judicialIndependence":
      return effectSum + effect.delta;
    case "outrage":
    case "stress":
      return effectSum - effect.delta;
    case "treasury":
      return effectSum + effect.delta * 10;
    case "macro":
      switch (effect.macroKey) {
        case "inflation":
        case "debtToGdp":
        case "subsidyPressure":
          return effectSum - effect.delta * 3;
        case "fxRate":
          return effectSum - effect.delta * 0.05;
        case "reserves":
          return effectSum + effect.delta * 4;
        case "oilOutput":
          return effectSum + effect.delta * 15;
        default:
          return effectSum;
      }
    default:
      return effectSum;
  }
}, 0), 0);

const maybeRecordMilestone = (state: GameState, title: string, description: string, consequences: Consequence[]): GameState => {
  const impact = Math.round(inferImpact(consequences));
  if (Math.abs(impact) < 4) return state;
  const milestone: LegacyMilestoneRecord = {
    title,
    date: state.date,
    day: state.day,
    pillar: inferPillarFromConsequences(consequences),
    impact,
    description,
  };
  return { ...state, legacyMilestones: [...state.legacyMilestones, milestone].slice(-24) };
};

const buildHeadlines = (state: GameState): string[] => {
  const strategicState = syncStrategicState(state);
  const critical = strategicState.activeEvents.filter((event) => event.severity === "critical").map((event) => `URGENT: ${event.title}`);
  const recent = [...strategicState.turnLog].slice(-4).reverse().map((entry) => entry.event);
  const metrics = [
    `Approval ${strategicState.approval}% as the presidency enters Day ${strategicState.day}`,
    `Term ${strategicState.term.current} is in the ${strategicState.term.governingPhase.replace(/-/g, " ")} phase with ${strategicState.term.daysUntilElection} days to election day`,
    `Vice President ${strategicState.vicePresident.name} is ${strategicState.vicePresident.mood.toLowerCase()} at loyalty ${strategicState.vicePresident.loyalty}%`,
    `Treasury now at ₦${strategicState.treasury.toFixed(2)}T with stability ${strategicState.stability}`,
    `Trust ${strategicState.trust}% and outrage ${strategicState.outrage}% define the public mood`,
  ];
  return [...critical, ...recent, ...metrics].slice(0, 8);
};

const finalizePresentation = (state: GameState): GameState => {
  const strategicState = syncStrategicState(state);
  return {
    ...strategicState,
    headlines: buildHeadlines(strategicState),
    dailySummary: strategicState.dailySummary,
  };
};

const applyDecisionConsequences = (
  state: GameState,
  title: string,
  description: string,
  consequences: Consequence[],
  category: TurnLogEntry["category"],
  categoryForMessage: ActiveEvent["category"] = "governance",
): GameState => {
  const immediate = consequences.filter((consequence) => consequence.delayDays <= 0);
  let next = processConsequences(state, immediate);
  next = queueFutureConsequences(next, consequences);
  next = appendTurnLog(next, {
    day: state.day,
    date: state.date,
    event: title,
    effects: consequences.map((consequence) => consequence.description),
    category,
  });
  next = maybeRecordMilestone(next, title, description, consequences);
  const source = sourceRoleForCategory(categoryForMessage);
  const msgSource = category === "event" ? "random" : category === "court" ? "court" : category === "chain" ? "chain" : "decision";
  const contextualResponses = msgSource === "court"
    ? [{ label: "Comply", actionId: "comply" }, { label: "Appeal Ruling", actionId: "appeal" }, { label: "Seek Delay", actionId: "delay" }]
    : msgSource === "chain"
      ? [{ label: "Accept Outcome", actionId: "accept" }, { label: "Escalate", actionId: "escalate" }, { label: "Order Investigation", actionId: "investigate" }]
      : categoryForMessage === "security"
        ? [{ label: "Authorise Action", actionId: "approve" }, { label: "Assign to NSA", actionId: "delegate" }, { label: "Monitor Situation", actionId: "acknowledge" }]
        : [{ label: "Acknowledge", actionId: "acknowledge" }, { label: "Assign to Minister", actionId: "delegate" }, { label: "Review Personally", actionId: "investigate" }];
  next = addInboxMessage(next, createInboxMessage(next, {
    id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${state.day}`,
    sender: source.sender,
    role: source.role,
    initials: source.initials,
    subject: title,
    preview: description,
    fullText: `${description}\n\nOperational note: ${consequences.map((consequence) => consequence.description).join(" ")}`,
    priority: categoryForMessage === "security" ? "Urgent" : "Normal",
    source: msgSource,
    responseOptions: contextualResponses,
  }));
  return finalizePresentation(next);
};

export function resolveActiveEventChoice(state: GameState, eventId: string, choiceIndex: number): GameState {
  const event = state.activeEvents.find((candidate) => candidate.id === eventId);
  if (!event) return state;
  const choice = event.choices[choiceIndex];
  if (!choice || !requirementsMet(state, choice.requirements)) return state;

  let next = applyDecisionConsequences(
    { ...state, activeEvents: state.activeEvents.filter((candidate) => candidate.id !== eventId) },
    `${event.title}: ${choice.label}`,
    choice.context,
    choice.consequences,
    "decision",
    event.category,
  );

  // Cabinet appointment: add the appointed character to state.characters and update cabinetAppointments
  if (event.source === "cabinet-appointment" && event.cabinetPortfolio) {
    const portfolio = event.cabinetPortfolio as MinistryPosition;
    const candidates = cabinetCandidates[portfolio];
    if (candidates && candidates[choiceIndex]) {
      const c = candidates[choiceIndex];
      const newChar: CharacterState = {
        name: c.name,
        portfolio: `Minister of ${c.portfolio}`,
        loyalty: c.loyalty,
        competence: c.competence,
        ambition: c.ambition,
        faction: c.faction,
        relationship: c.relationship as Relationship,
        avatar: c.avatar,
        traits: [],
        betrayalThreshold: Math.max(15, 50 - c.ambition * 0.3),
        hooks: [],
        age: c.age,
        state: c.state,
        gender: c.gender,
      };
      next = {
        ...next,
        characters: { ...next.characters, [c.name]: newChar },
        cabinetAppointments: { ...next.cabinetAppointments, [portfolio]: c.name },
        inboxMessages: [
          ...next.inboxMessages,
          {
            id: `cabinet-confirmed-${portfolio}-${next.day}`,
            day: next.day,
            date: next.date,
            sender: "Secretary to the Government",
            role: "SGF Office",
            initials: "SG",
            subject: `${c.name} Confirmed as Minister of ${portfolio}`,
            preview: `${c.name} has been formally appointed as Minister of ${portfolio}.`,
            fullText: `${c.name} has been formally appointed as Minister of ${portfolio}. The appointee is expected to begin duties immediately. Faction reaction: ${c.faction}.`,
            priority: "Normal" as const,
            read: false,
            source: "system" as const,
          },
        ],
      };
    }
  }

  return finalizePresentation(next);
}

export function resolveChainChoice(state: GameState, chainId: string, choiceIndex: number): GameState {
  const instance = state.activeChains.find((candidate) => candidate.chainId === chainId && !candidate.resolved);
  const chain = getChainById(chainId);
  if (!instance || !chain) return state;

  const currentStep = chain.steps[instance.currentStepIndex];
  const choice = currentStep?.choices[choiceIndex];
  if (!currentStep || !choice || !requirementsMet(state, choice.requirements)) return state;

  let next = applyDecisionConsequences(
    state,
    `${chain.title}: ${choice.label}`,
    currentStep.narrative,
    choice.consequences,
    "chain",
    chain.category === "intrigue" ? "politics" : chain.category === "opportunity" ? "economy" : chain.category === "crisis" ? "security" : "diplomacy",
  );

  next = {
    ...next,
    activeChains: next.activeChains.map((candidate) => {
      if (candidate.chainId !== chainId || candidate.resolved) return candidate;
      if (choice.chainEnd || !choice.nextStepId) return { ...candidate, resolved: true };
      const nextStep = getChainStep(chain, choice.nextStepId);
      const currentStepIndex = nextStep ? chain.steps.findIndex((step) => step.id === nextStep.id) : candidate.currentStepIndex;
      return { ...candidate, currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : candidate.currentStepIndex };
    }),
  };

  return finalizePresentation(next);
}

export function resolveCabalChoice(state: GameState, choiceIndex: number): GameState {
  const meeting = state.cabalMeeting;
  if (!meeting || meeting.day !== state.day || meeting.resolved) return state;
  const choice = meeting.choices[choiceIndex];
  if (!choice) return state;

  let next = applyDecisionConsequences(
    {
      ...state,
      cabalMeeting: {
        ...meeting,
        resolved: true,
      },
    },
    `${meeting.title}: ${choice.label}`,
    choice.summary,
    choice.consequences,
    "cabal",
    focusToCategory(meeting.focus),
  );

  if (choice.id === "cabal-politics-dossiers") {
    const candidate = bestHookCandidate(next);
    if (candidate) {
      next = primeHookInvestigation(next, candidate.ownerName, candidate.hook.id, true);
      next = appendTurnLog(next, {
        day: next.day,
        date: next.date,
        event: `A quiet dossier begins to form on ${candidate.hook.target}`,
        effects: [candidate.hook.description],
        category: "hook",
      });
    }
  }

  return finalizePresentation({
    ...next,
    cabalMeeting: {
      ...(next.cabalMeeting ?? meeting),
      resolved: true,
    },
  });
}

const buildHookConsequences = (state: GameState, ownerName: string, hook: Hook): Consequence[] => {
  const severityBoost = hook.severity === "minor" ? 5 : hook.severity === "major" ? 8 : 12;
  const owner = state.characters[ownerName];
  const factionName = owner?.faction;
  const immediate: Effect[] = [{ target: "character", characterName: ownerName, delta: severityBoost, description: "The subject falls back into line under pressure" }];

  switch (hook.type) {
    case "financial":
      immediate.push(
        { target: "politicalCapital", delta: Math.round(severityBoost / 2), description: "Financial leverage buys room with other elites" },
        { target: "trust", delta: 1, description: "The presidency looks tougher on graft behind the scenes" },
        ...maybeFactionEffect(factionName, 2, "The subject's faction becomes more manageable"),
      );
      break;
    case "political":
      immediate.push(
        { target: "politicalCapital", delta: Math.round(severityBoost / 1.8), description: "Blackmail sharpens whip discipline" },
        { target: "trust", delta: -1, description: "Rumours of hardball politics unsettle the system" },
        ...maybeFactionEffect(factionName, 3, "The faction closes ranks under pressure"),
      );
      break;
    case "criminal":
      immediate.push(
        { target: "stability", delta: 2, description: "Security spoilers pull back from open confrontation" },
        { target: "trust", delta: -1, description: "Hard methods leave a trace in elite circles" },
        { target: "stress", delta: -1, description: "Control eases immediate presidential anxiety" },
      );
      break;
    default:
      immediate.push(
        { target: "approval", delta: 1, description: "The presidency looks more composed after privately settling the matter" },
        { target: "stress", delta: -2, description: "A personal pressure point is defused" },
      );
      break;
  }

  const delayed = hook.severity === "devastating"
    ? [strategicConsequence(`hook-${hook.id}-aftershock-${state.day}`, hook.id, "Whispers spread about the methods being used inside the villa", [
        { target: "trust", delta: -2, description: "Elite circles recoil from the hardball tactics" },
      ], 3)]
    : [];

  return [strategicConsequence(`hook-${hook.id}-deploy-${state.day}`, hook.id, `Pressure is applied to ${hook.target} using a ${hook.severity} ${hook.type} hook`, immediate), ...delayed];
};

export function startHookInvestigation(state: GameState, ownerName: string, hookId: string): GameState {
  const next = primeHookInvestigation(state, ownerName, hookId);
  return next === state ? state : finalizePresentation(next);
}

export function useHook(state: GameState, ownerName: string, hookId: string): GameState {
  const reference = getHookReference(state, ownerName, hookId);
  if (!reference || reference.hook.used || !reference.hook.usable) return state;

  let next = updateHookState(state, ownerName, hookId, (hook) => ({
    ...hook,
    used: true,
    usable: false,
    underInvestigation: false,
  }));

  next = applyDecisionConsequences(
    next,
    `Deploy Hook: ${reference.hook.target}`,
    reference.hook.description,
    buildHookConsequences(next, ownerName, reference.hook),
    "hook",
    "politics",
  );

  return finalizePresentation(next);
}

export function executeQuickAction(state: GameState, actionId: string): GameState {
  const action = getQuickActionById(actionId);
  if (!action) return state;
  const lastUsedDay = state.lastActionAtDay[actionId];
  if (lastUsedDay !== undefined && state.day - lastUsedDay < 2) return state;

  let next = applyDecisionConsequences(
    { ...state, lastActionAtDay: { ...state.lastActionAtDay, [actionId]: state.day } },
    action.label,
    action.summary,
    action.consequences,
    "quick-action",
  );

  if (actionId === "probe-commission") {
    const candidate = bestHookCandidate(next);
    if (candidate) {
      next = primeHookInvestigation(next, candidate.ownerName, candidate.hook.id, true);
      next = appendTurnLog(next, {
        day: next.day,
        date: next.date,
        event: `Probe commission quietly targets ${candidate.hook.target}`,
        effects: [candidate.hook.description],
        category: "hook",
      });
    }
  }

  return finalizePresentation(next);
}

export function markInboxMessageRead(state: GameState, messageId: string): GameState {
  return {
    ...state,
    inboxMessages: state.inboxMessages.map((message) => message.id === messageId ? { ...message, read: true } : message),
  };
}

const inboxActionConsequences = (state: GameState, messageId: string, actionId: string): Consequence[] => {
  const message = state.inboxMessages.find((candidate) => candidate.id === messageId);
  if (!message) return [];
  const senderTarget = state.characters[message.sender] ? message.sender : undefined;
  const sourceEvent = `${message.id}-${actionId}`;
  const senderEffect = (delta: number, description: string): Effect[] => senderTarget
    ? [{ target: "character", characterName: senderTarget, delta, description }]
    : [];

  // Map action IDs to effect tiers
  // Strong positive: approve, comply, engage, accept, address
  // Moderate positive: acknowledge, note, modify, escalate, investigate, appeal
  // Neutral/weak: defer, delay, delegate, dismiss, forward
  // Negative: reject, ignore, ignore-response

  // Backward compat: keep old IDs working
  const strongPositive = ["reply-excellent", "approve", "comply", "engage", "accept", "address"];
  const moderate = ["reply-good", "acknowledge", "note", "modify", "escalate", "investigate", "appeal"];
  const neutral = ["reply-poor", "defer", "delay", "delegate", "dismiss", "forward"];
  const negative = ["reply-terrible", "reject", "ignore", "ignore-response"];

  if (strongPositive.includes(actionId)) {
    return [{
      id: `${sourceEvent}-now`,
      sourceEvent,
      delayDays: 0,
      description: "A decisive response sharpens discipline and alignment",
      effects: [
        { target: "approval", delta: 1, description: "The response leaks positively through the system" },
        { target: "trust", delta: 2, description: "Leadership looks composed" },
        ...senderEffect(5, "The sender leaves reassured"),
      ],
    }];
  }
  if (moderate.includes(actionId)) {
    return [{
      id: `${sourceEvent}-now`,
      sourceEvent,
      delayDays: 0,
      description: "A professional response steadies the conversation",
      effects: [
        { target: "trust", delta: 1, description: "The institution sees responsive leadership" },
        ...senderEffect(3, "The sender feels heard"),
      ],
    }];
  }
  if (neutral.includes(actionId)) {
    return [{
      id: `${sourceEvent}-now`,
      sourceEvent,
      delayDays: 0,
      description: "A non-committal response buys little goodwill",
      effects: [
        { target: "trust", delta: -1, description: "The reply feels non-committal" },
        ...senderEffect(-3, "The sender remains unconvinced"),
      ],
    }];
  }
  if (negative.includes(actionId)) {
    return [{
      id: `${sourceEvent}-now`,
      sourceEvent,
      delayDays: 0,
      description: "A dismissive reply deepens the political problem",
      effects: [
        { target: "approval", delta: -2, description: "The tone leaks and hurts your standing" },
        { target: "trust", delta: -3, description: "Your team looks erratic" },
        ...senderEffect(-8, "The sender feels publicly insulted"),
      ],
    }];
  }

  return [];
};

export function handleInboxAction(state: GameState, messageId: string, actionId: string): GameState {
  const message = state.inboxMessages.find((candidate) => candidate.id === messageId);
  if (!message) return state;
  let next = markInboxMessageRead(state, messageId);
  next = applyDecisionConsequences(next, `${message.subject}: ${actionId}`, message.preview, inboxActionConsequences(next, messageId, actionId), "inbox");
  return finalizePresentation(next);
}

export function checkVictoryConditions(state: GameState): VictoryPath | null {
  return checkVictory(state);
}

export function checkDefeatConditions(state: GameState): FailureState | null {
  return checkDefeat(state);
}

export function driftMetrics(state: GameState): GameState {
  const rand = () => (Math.random() - 0.5) * 2;
  const crisisMultiplier = 1.0;
  const negativeBias = state.outrage > 55 || state.trust < 35 ? 1.2 : 1;
  const inflationDrag = Math.max(0, state.macroEconomy.inflation - 20) * 0.04;
  const fxDrag = Math.max(0, state.macroEconomy.fxRate - 1400) * 0.0009;
  const reserveSupport = Math.max(0, state.macroEconomy.reserves - 28) * 0.02;
  const subsidyDrag = Math.max(0, state.macroEconomy.subsidyPressure - 55) * 0.015;

  return {
    ...state,
    approval: Math.round(clamp(state.approval + rand() * 0.6 - inflationDrag - subsidyDrag * 0.2 - (crisisMultiplier - 1) * 0.4, 0, 100)),
    treasury: roundMetric(state.treasury + rand() * 0.02 + (state.macroEconomy.oilOutput - 1.5) * 0.025 - subsidyDrag * 0.003 - Math.max(0, negativeBias - 1) * 0.01),
    stability: Math.round(clamp(state.stability + rand() * 0.5 - fxDrag * 12 - (negativeBias - 1) * 1.2 + reserveSupport * 0.4, 0, 100)),
    outrage: Math.round(clamp(state.outrage + rand() * 0.5 + inflationDrag * 1.2 + (crisisMultiplier - 1) * 0.8, 0, 100)),
    trust: Math.round(clamp(state.trust + rand() * 0.4 - fxDrag * 10 + reserveSupport * 0.3 - (crisisMultiplier - 1) * 0.5, 0, 100)),
    stress: Math.round(clamp(state.stress + rand() * 0.4 + Math.max(0, 55 - state.stability) * 0.03 + Math.max(0, state.macroEconomy.inflation - 25) * 0.03, 0, 100)),
    politicalCapital: Math.round(clamp(state.politicalCapital + rand() * 0.4 - Math.max(0, 50 - state.approval) * 0.02 - subsidyDrag * 0.15, 0, 100)),
  };
}

const randomEventPool = [
  {
    description: "A new corruption scandal surfaces in the Ministry of Works",
    effects: [
      { target: "outrage" as const, delta: 5, description: "Public anger rises" },
      { target: "trust" as const, delta: -3, description: "Government trust drops" },
    ],
    probability: 0.12,
  },
  {
    description: "Oil prices surge on global markets",
    effects: [
      { target: "treasury" as const, delta: 0.08, description: "Revenue improves" },
      { target: "stability" as const, delta: 2, description: "The macro picture looks steadier" },
    ],
    probability: 0.08,
  },
  {
    description: "Student protests erupt at major universities",
    effects: [
      { target: "outrage" as const, delta: 4, description: "Youth anger rises" },
      { target: "approval" as const, delta: -2, description: "Public patience weakens" },
    ],
    probability: 0.1,
  },
  {
    description: "A successful anti-banditry sweep boosts confidence in the North-West",
    effects: [
      { target: "stability" as const, delta: 3, description: "Security improves" },
      { target: "approval" as const, delta: 2, description: "Public confidence rises" },
    ],
    probability: 0.08,
  },
  {
    description: "Power grid failure causes nationwide blackouts for 48 hours",
    effects: [
      { target: "outrage" as const, delta: 7, description: "Public fury spikes" },
      { target: "approval" as const, delta: -3, description: "Approval drops" },
      { target: "stress" as const, delta: 4, description: "The presidency takes the strain" },
    ],
    probability: 0.08,
  },
];

export function generateRandomEvent(state: GameState): Consequence | null {
  const stressMultiplier = state.stress > 50 ? 1.25 : 1;
  for (const event of randomEventPool) {
    if (Math.random() < event.probability * stressMultiplier) {
      return {
        id: `random-${state.day}-${Date.now()}`,
        sourceEvent: "random",
        delayDays: 0,
        effects: event.effects,
        description: event.description,
      };
    }
  }
  return null;
}

export function advanceDate(currentDate: string): string {
  const [dayText, month, yearText] = currentDate.split(" ");
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const date = new Date(Number.parseInt(yearText, 10), months.indexOf(month), Number.parseInt(dayText, 10));
  date.setDate(date.getDate() + 1);
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const processPendingConsequences = (state: GameState): { state: GameState; items: string[] } => {
  const due = state.pendingConsequences.filter((consequence) => consequence.delayDays <= 0);
  const future = state.pendingConsequences.filter((consequence) => consequence.delayDays > 0).map((consequence) => ({ ...consequence, delayDays: consequence.delayDays - 1 }));
  let next = { ...state, pendingConsequences: future };
  if (due.length) {
    next = processConsequences(next, due);
    next = appendTurnLog(next, { day: state.day, date: state.date, event: "Delayed consequences resolved", effects: due.map((consequence) => consequence.description), category: "system" });
  }
  return { state: next, items: due.map((consequence) => consequence.description) };
};

const processTraitDrift = (state: GameState): { state: GameState; items: string[] } => {
  let changed = false;
  const items: string[] = [];
  const characters = Object.fromEntries(Object.entries(state.characters).map(([name, character]) => {
    const effect = getTraitEffect(character);
    const drift = effect.loyaltyDrift + (state.stress > 70 ? -0.2 : 0);
    if (drift === 0) return [name, character];
    changed = true;
    const loyalty = Math.round(clamp(character.loyalty + drift, 0, 100));
    if (Math.abs(drift) >= 0.2) items.push(`${name} ${drift > 0 ? "steadied" : "frayed"}`);
    return [name, { ...character, loyalty, relationship: relationshipFromLoyalty(loyalty) }];
  }));
  return changed ? { state: { ...state, characters }, items } : { state, items: [] };
};

const processFactionAndGovernorMood = (state: GameState): { state: GameState; summaryItems: string[]; newEvents: ActiveEvent[] } => {
  const summaryItems: string[] = [];
  const newEvents: ActiveEvent[] = [];

  // ── Governor drift (unchanged) ────────────────────────
  const macroSupport = clamp(
    (32 - state.macroEconomy.inflation) * 0.12 +
    state.macroEconomy.reserves * 0.04 -
    Math.max(0, state.macroEconomy.fxRate - 1500) * 0.004,
    -3, 3,
  );
  const governorDelta = (state.stability - 50) * 0.03 + (state.treasury - 1) * 3 + macroSupport * 0.4;
  const governors = state.governors.map((governor) => {
    const loyalty = Math.round(clamp(governor.loyalty + governorDelta, 0, 100));
    const approval = Math.round(clamp(governor.approval + (state.approval - 45) * 0.04 + macroSupport * 0.25, 0, 100));
    return { ...governor, loyalty, approval, relationship: relationshipFromLoyalty(loyalty) };
  });

  // ── Per-faction drift ─────────────────────────────────
  const factions = { ...state.factions };
  let runningState = { ...state, factions, governors };
  for (const profile of FACTION_PROFILES) {
    const faction = factions[profile.key];
    if (!faction) continue;

    const driftDelta = computeFactionDrift(profile, runningState);
    const newLoyalty = Math.round(clamp(faction.loyalty + driftDelta, 0, 100));
    const newGrievance = updateGrievance(faction.grievance ?? 0, driftDelta, profile.temperament);

    const thresholdResult = checkGrievanceThresholds(
      profile.key,
      newGrievance,
      faction.firedThresholds ?? [],
      runningState.day,
    );

    if (thresholdResult.breakingPointConsequences) {
      runningState = processConsequences(
        { ...runningState, factions },
        [thresholdResult.breakingPointConsequences],
      );
      Object.assign(factions, runningState.factions);
    }

    factions[profile.key] = {
      ...factions[profile.key],
      loyalty: thresholdResult.breakingPointConsequences ? factions[profile.key].loyalty : newLoyalty,
      stance: factionStanceFromLoyalty(thresholdResult.breakingPointConsequences ? factions[profile.key].loyalty : newLoyalty),
      grievance: newGrievance,
      firedThresholds: thresholdResult.firedThresholds,
    };

    newEvents.push(...thresholdResult.events);

    if (thresholdResult.advisorLine) {
      summaryItems.push(thresholdResult.advisorLine);
    }

    if (Math.abs(driftDelta) >= 5) {
      const direction = driftDelta > 0 ? "pleased with recent shifts" : "frustrated with your direction";
      summaryItems.push(`The ${profile.key} are reportedly ${direction}.`);
    }
  }

  return {
    state: { ...runningState, factions },
    summaryItems,
    newEvents,
  };
};

/** High-impact lever changes that require political capital + approval gates */
export const HIGH_IMPACT_CHANGES: Partial<Record<PolicyLeverKey, AnyPolicyPosition[]>> = {
  fuelSubsidy: ["removed"],
  fxPolicy: ["free-float"],
  interestRate: ["hawkish"],
  electricityTariff: ["market-rate"],
};

const DRAMATIC_SHIFT_CHAINS: Record<string, { delayDays: number; title: string; description: string }> = {
  "fuelSubsidy:removed": { delayDays: 10, title: "Street Protests Erupt", description: "Fuel subsidy removal has triggered mass protests in Lagos and Abuja." },
  "fxPolicy:free-float": { delayDays: 7, title: "Currency Markets React", description: "The naira is in freefall as markets adjust to the new FX regime." },
  "interestRate:hawkish": { delayDays: 14, title: "Business Lobby Pushback", description: "The Manufacturers Association is demanding an urgent meeting about borrowing costs." },
};

function computeModifierDelta(from: PolicyModifiers, to: PolicyModifiers): PolicyModifiers {
  return {
    inflation: to.inflation - from.inflation,
    fxRate: to.fxRate - from.fxRate,
    reserves: to.reserves - from.reserves,
    debtToGdp: to.debtToGdp - from.debtToGdp,
    subsidyPressure: to.subsidyPressure - from.subsidyPressure,
    approval: to.approval - from.approval,
    treasury: to.treasury - from.treasury,
    trust: to.trust - from.trust,
  };
}

export function generatePolicyConfirmationEvent(
  lever: PolicyLeverKey,
  currentPosition: AnyPolicyPosition,
  newPosition: AnyPolicyPosition,
  state: GameState,
): ActiveEvent {
  const def = POLICY_LEVER_DEFS[lever];
  const currentMods = def.modifiers[currentPosition];
  const newMods = def.modifiers[newPosition];
  const delta = computeModifierDelta(currentMods, newMods);
  const highImpact = HIGH_IMPACT_CHANGES[lever]?.includes(newPosition) ?? false;

  const policyEffect: Effect = {
    target: "policyLever", leverKey: lever, leverPosition: newPosition, delta: 0, description: `Set ${def.displayName} to ${newPosition}`,
  };

  // Bold Reform
  const boldConsequences: Consequence[] = [{
    id: `bold-${lever}`, sourceEvent: `policy-${lever}`, delayDays: 0,
    description: `Immediate ${def.displayName} reform`,
    effects: [
      policyEffect,
      { target: "approval", delta: delta.approval, description: "Public reaction to bold reform" },
      { target: "trust", delta: (delta.trust || 0) + 1, description: "Trust bonus for transparency" },
    ],
  }];
  const chainKey = `${lever}:${newPosition}`;
  const chainDef = DRAMATIC_SHIFT_CHAINS[chainKey];
  if (chainDef) {
    boldConsequences.push({
      id: `chain-${lever}`, sourceEvent: `policy-${lever}`, delayDays: chainDef.delayDays,
      description: chainDef.title,
      effects: [{ target: "stability", delta: -5, description: chainDef.description }],
    });
  }
  const boldChoice: EventChoice = {
    id: `bold-${lever}`,
    label: "Bold Reform",
    context: "Implement immediately with full transparency",
    consequences: boldConsequences,
    requirements: highImpact ? [
      { metric: "politicalCapital", min: 3, description: "Requires 3+ political capital" },
      { metric: "approval", min: 35, description: "Requires 35%+ approval" },
    ] : undefined,
  };

  // Gradual Phase-in
  const gradualConsequences: Consequence[] = [
    {
      id: `gradual-${lever}`, sourceEvent: `policy-${lever}`, delayDays: 0,
      description: `Gradual ${def.displayName} transition`,
      effects: [
        policyEffect,
        { target: "approval", delta: Math.trunc(delta.approval / 2), description: "Softened initial reaction" },
      ],
    },
    {
      id: `shock-${lever}`, sourceEvent: `policy-${lever}`, delayDays: 30,
      description: `Transition shock from ${def.displayName} change`,
      effects: [
        { target: "approval", delta: Math.trunc(delta.approval / 2), description: "Delayed adjustment impact" },
        { target: "stability", delta: -2, description: "Temporary instability during transition" },
      ],
    },
  ];
  if (chainDef) {
    gradualConsequences.push({
      id: `chain-gradual-${lever}`, sourceEvent: `policy-${lever}`, delayDays: chainDef.delayDays,
      description: chainDef.title,
      effects: [{ target: "stability", delta: -3, description: chainDef.description }],
    });
  }
  const gradualChoice: EventChoice = {
    id: `gradual-${lever}`,
    label: "Gradual Phase-in",
    context: "Staggered rollout to manage expectations",
    consequences: gradualConsequences,
  };

  // Backroom Deal
  const pcCost = highImpact ? -4 : -2;
  const backroomConsequences: Consequence[] = [{
    id: `backroom-${lever}`, sourceEvent: `policy-${lever}`, delayDays: 0,
    description: `Quiet ${def.displayName} implementation`,
    effects: [
      policyEffect,
      { target: "approval", delta: Math.trunc(delta.approval / 2), description: "Muted public reaction" },
      { target: "politicalCapital", delta: pcCost, description: "Political horse-trading cost" },
      { target: "trust", delta: -1, description: "Backroom dealing erodes trust" },
    ],
  }];
  const backroomChoice: EventChoice = {
    id: `backroom-${lever}`,
    label: "Backroom Deal",
    context: "Quiet implementation through political channels",
    consequences: backroomConsequences,
    requirements: [{ metric: "politicalCapital", min: 2, description: "Requires 2+ political capital" }],
  };

  // Cancel
  const cancelChoice: EventChoice = {
    id: `cancel-${lever}`,
    label: "Cancel — Maintain Status Quo",
    context: "Abort the policy change",
    consequences: [{
      id: `cancel-${lever}`, sourceEvent: `policy-${lever}`, delayDays: 0,
      description: `Cancel ${def.displayName} change`,
      effects: [{
        target: "policyLever", leverKey: lever, leverPosition: currentPosition, skipCooldown: true, delta: 0,
        description: `Revert ${def.displayName} to ${currentPosition}`,
      }],
    }],
  };

  return {
    id: `policy-${lever}-${state.day}`,
    title: `${def.displayName} Policy Change`,
    severity: highImpact ? "critical" : "warning",
    description: `Your economic team is ready to shift ${def.displayName} policy. How should this be implemented?`,
    category: "economy",
    source: "policy",
    policyLeverKey: lever,
    choices: [boldChoice, gradualChoice, backroomChoice, cancelChoice],
    createdDay: state.day,
    expiresInDays: 3,
  };
}

export function computePolicyModifiers(levers: PolicyLeverState): PolicyModifiers {
  const result: PolicyModifiers = { inflation: 0, fxRate: 0, reserves: 0, debtToGdp: 0, subsidyPressure: 0, approval: 0, treasury: 0, trust: 0 };
  for (const key of Object.keys(levers) as PolicyLeverKey[]) {
    const pos = levers[key].position;
    const def = POLICY_LEVER_DEFS[key];
    const mods = def.modifiers[pos];
    if (!mods) continue;
    for (const field of Object.keys(result) as (keyof PolicyModifiers)[]) {
      result[field] += mods[field] * POLICY_MODIFIER_SCALE;
    }
  }
  return result;
}

const processMacroEconomy = (state: GameState): { state: GameState; items: string[]; policyApproval: number; policyTreasury: number; policyTrust: number } => {
  let next: GameState = {
    ...state,
    macroEconomy: { ...state.macroEconomy },
  };
  const items: string[] = [];

  const policyMods = computePolicyModifiers(state.policyLevers);

  const inflationDelta = clamp(
    0.2
      + Math.max(0, state.outrage - 45) * 0.02
      + Math.max(0, state.macroEconomy.subsidyPressure - 55) * 0.015
      + Math.max(0, state.macroEconomy.fxRate - 1400) / 600
      - state.trust * 0.015
      - state.stability * 0.01
      - state.treasury * 0.06
      + policyMods.inflation,
    -1.4,
    2.2,
  );
  const nextInflation = roundMacroValue("inflation", state.macroEconomy.inflation + inflationDelta);

  const fxDelta = clamp(
    Math.max(0, 50 - state.trust) * 4
      + Math.max(0, 55 - state.stability) * 3
      + Math.max(0, nextInflation - 20) * 6
      - state.macroEconomy.reserves * 1.8
      - state.treasury * 20
      - state.politicalCapital * 0.12
      + policyMods.fxRate,
    -140,
    180,
  );
  const nextFx = roundMacroValue("fxRate", state.macroEconomy.fxRate + fxDelta);

  const reservesDelta = clamp(
    state.treasury * 0.12
      + (state.macroEconomy.oilOutput - 1.4) * 0.7
      - Math.max(0, fxDelta) / 140
      - Math.max(0, state.macroEconomy.subsidyPressure - 60) * 0.02
      + state.trust * 0.005
      + policyMods.reserves,
    -1.5,
    1.1,
  );
  const nextReserves = roundMacroValue("reserves", state.macroEconomy.reserves + reservesDelta);

  const debtDelta = clamp(
    Math.max(0, 1.1 - state.treasury) * 1.2
      + Math.max(0, state.macroEconomy.subsidyPressure - 50) * 0.03
      + Math.max(0, nextInflation - 24) * 0.02
      - Math.max(0, state.trust - 55) * 0.01
      + policyMods.debtToGdp,
    -0.4,
    1.4,
  );
  const nextDebt = roundMacroValue("debtToGdp", state.macroEconomy.debtToGdp + debtDelta);

  const oilDelta = clamp(
    (state.stability - 50) * 0.004
      + Math.max(0, 45 - state.outrage) * 0.002
      - Math.max(0, state.outrage - 60) * 0.004,
    -0.08,
    0.08,
  );
  const nextOil = roundMacroValue("oilOutput", state.macroEconomy.oilOutput + oilDelta);

  const subsidyDelta = clamp(
    (nextInflation - 20) * 0.18
      + Math.max(0, state.outrage - 40) * 0.05
      - state.trust * 0.04
      - Math.max(0, state.politicalCapital - 60) * 0.02
      + policyMods.subsidyPressure,
    -3.5,
    4.5,
  );
  const nextSubsidy = roundMacroValue("subsidyPressure", state.macroEconomy.subsidyPressure + subsidyDelta);

  next.macroEconomy = {
    inflation: nextInflation,
    fxRate: nextFx,
    reserves: nextReserves,
    debtToGdp: nextDebt,
    oilOutput: nextOil,
    subsidyPressure: nextSubsidy,
  };

  const descriptors: Array<[MacroKey, number]> = [
    ["inflation", 0.5],
    ["fxRate", 35],
    ["reserves", 0.5],
    ["debtToGdp", 0.5],
    ["oilOutput", 0.03],
    ["subsidyPressure", 3],
  ];
  for (const [key, threshold] of descriptors) {
    const delta = next.macroEconomy[key] - state.macroEconomy[key];
    if (Math.abs(delta) >= threshold) {
      items.push(`${key} ${delta >= 0 ? "moved" : "softened"}`);
    }
  }

  if (next.macroEconomy.inflation > 30) {
    next = processConsequences(next, [{
      id: `macro-inflation-${state.day}`,
      sourceEvent: "macro-economy",
      delayDays: 0,
      description: "High inflation keeps eating away at household confidence",
      effects: [
        { target: "approval", delta: -1, description: "Households feel the squeeze" },
        { target: "outrage", delta: 1, description: "Price anger rises" },
      ],
    }]);
    items.push("Inflation is visibly eroding household confidence");
  }

  if (next.macroEconomy.fxRate > 1900) {
    next = processConsequences(next, [{
      id: `macro-fx-${state.day}`,
      sourceEvent: "macro-economy",
      delayDays: 0,
      description: "FX instability is shaking market confidence",
      effects: [
        { target: "trust", delta: -1, description: "The naira slide unsettles investors" },
        { target: "stability", delta: -1, description: "Economic coordination looks weaker" },
      ],
    }]);
    items.push("FX instability is shaking market confidence");
  }

  if (next.macroEconomy.reserves < 25) {
    next = processConsequences(next, [{
      id: `macro-reserves-${state.day}`,
      sourceEvent: "macro-economy",
      delayDays: 0,
      description: "Thin reserves limit policy room",
      effects: [
        { target: "trust", delta: -1, description: "Buffers look too thin for comfort" },
      ],
    }]);
    items.push("Thin reserves are narrowing policy room");
  }

  if (next.macroEconomy.debtToGdp > 50) {
    next = processConsequences(next, [{
      id: `macro-debt-${state.day}`,
      sourceEvent: "macro-economy",
      delayDays: 0,
      description: "Debt service is crowding out your room to manoeuvre",
      effects: [
        { target: "politicalCapital", delta: -1, description: "Debt trade-offs are consuming strategic space" },
      ],
    }]);
    items.push("Debt service is crowding out room to manoeuvre");
  }

  if (next.macroEconomy.subsidyPressure > 75) {
    next = processConsequences(next, [{
      id: `macro-subsidy-${state.day}`,
      sourceEvent: "macro-economy",
      delayDays: 0,
      description: "Subsidy expectations are hardening into a political trap",
      effects: [
        { target: "approval", delta: -1, description: "The public expects relief you may not afford" },
        { target: "outrage", delta: 1, description: "The cost-of-living debate grows harsher" },
      ],
    }]);
    items.push("Subsidy pressure is becoming a political trap");
  }

  if (next.macroEconomy.oilOutput >= 1.9) {
    next = processConsequences(next, [{
      id: `macro-oil-${state.day}`,
      sourceEvent: "macro-economy",
      delayDays: 0,
      description: "Improved output gives the treasury a little breathing room",
      effects: [
        { target: "treasury", delta: 0.02, description: "Oil cash flow improves" },
      ],
    }]);
  }

  return { state: next, items, policyApproval: policyMods.approval, policyTreasury: policyMods.treasury, policyTrust: policyMods.trust };
};

const processHookInvestigations = (state: GameState): { state: GameState; items: string[] } => {
  const probeBonus = state.lastActionAtDay["probe-commission"] === state.day ? 6 : 0;
  let changed = false;
  const items: string[] = [];

  const characters = Object.fromEntries(Object.entries(state.characters).map(([name, character]) => {
    let loyaltyPenalty = 0;
    const hooks = character.hooks.map((hook) => {
      if (!hook.underInvestigation || hook.used) return hook;
      changed = true;
      const evidenceGain = (hook.severity === "minor" ? 9 : hook.severity === "major" ? 11 : 14) + probeBonus;
      const evidence = clamp(hook.evidence + evidenceGain, 0, 100);
      const discovered = hook.discovered || evidence >= 25;
      const usableThreshold = hookSeverityThreshold(hook.severity);
      const usable = hook.usable || evidence >= usableThreshold;
      const nextHook: Hook = {
        ...hook,
        evidence,
        discovered,
        usable,
        underInvestigation: usable ? false : true,
      };
      if (!hook.discovered && discovered) {
        items.push(`Investigators found a real line into ${hook.target}`);
      }
      if (!hook.usable && usable) {
        items.push(`A ${hook.severity} hook on ${hook.target} is now usable`);
        loyaltyPenalty += 1;
      }
      return nextHook;
    });

    const loyalty = loyaltyPenalty > 0 ? Math.round(clamp(character.loyalty - loyaltyPenalty, 0, 100)) : character.loyalty;
    return [name, loyaltyPenalty > 0 ? { ...character, hooks, loyalty, relationship: relationshipFromLoyalty(loyalty) } : { ...character, hooks }];
  }));

  return changed ? { state: { ...state, characters }, items } : { state, items: [] };
};

const applyCourtOutcomes = (state: GameState): { state: GameState; items: string[] } => {
  const items: string[] = [];
  let next = { ...state, activeCases: state.activeCases.map((courtCase) => ({ ...courtCase })) };
  next.activeCases = next.activeCases.map((courtCase) => {
    if (courtCase.status === "Decided") return courtCase;
    const updated = { ...courtCase, daysToDecision: courtCase.daysToDecision - 1 };
    if (updated.daysToDecision > 0) return updated;
    updated.status = "Decided";
    items.push(`${updated.title} reached judgment`);
    const consequences: Consequence[] = updated.title === "Digital Tax Constitutional Challenge"
      ? [{ id: `${updated.id}-result`, sourceEvent: updated.id, delayDays: 0, description: "The levy survives with modifications", effects: [{ target: "treasury", delta: 0.06, description: "Projected revenues improve" }, { target: "trust", delta: 1, description: "The ruling feels balanced" }] }]
      : updated.title === "Fuel Subsidy Legality"
      ? [{ id: `${updated.id}-result`, sourceEvent: updated.id, delayDays: 0, description: "The court demands clearer legislative cover", effects: [{ target: "judicialIndependence", delta: 3, description: "The bench asserts itself" }, { target: "politicalCapital", delta: -3, description: "The executive must renegotiate" }] }]
      : [{ id: `${updated.id}-result`, sourceEvent: updated.id, delayDays: 0, description: "The judgment nudges the system without a dramatic shock", effects: [{ target: "judicialIndependence", delta: 2, description: "The courts look more assertive" }] }];
    next = applyDecisionConsequences(next, updated.title, updated.description, consequences, "court");
    return updated;
  });
  return { state: next, items };
};

const maybeTriggerBetrayal = (state: GameState): { state: GameState; items: string[] } => {
  const topRisk = checkBetrayalRisk(state).find((risk) => risk.isAtRisk && risk.risk >= 35);
  if (!topRisk || Math.random() > Math.min(0.45, topRisk.risk / 140)) return { state, items: [] };
  const target = state.characters[topRisk.characterName];
  if (!target) return { state, items: [] };
  const consequence: Consequence = {
    id: `betrayal-${state.day}-${target.name}`,
    sourceEvent: "betrayal-risk",
    delayDays: 0,
    description: `${target.name} leaks damaging information and undermines the presidency`,
    effects: [
      { target: "approval", delta: -3, description: "The leak weakens the presidency" },
      { target: "trust", delta: -4, description: "Insiders look unreliable" },
      { target: "character", characterName: target.name, delta: -6, description: "The relationship collapses" },
      { target: "stress", delta: 4, description: "The betrayal hits personally" },
    ],
  };
  return { state: applyDecisionConsequences(state, `Betrayal Risk: ${target.name}`, consequence.description, [consequence], "system"), items: [consequence.description] };
};

const spawnNarrativePressure = (state: GameState): { state: GameState; items: string[] } => {
  let next = state;
  const items: string[] = [];
  const newChains = getTriggeredChains(state, state.activeChains.filter((chain) => !chain.resolved).map((chain) => chain.chainId)).slice(0, 1);
  if (newChains.length) {
    next = { ...next, activeChains: [...next.activeChains, ...newChains.map((chain) => ({ chainId: chain.id, currentStepIndex: 0, startedDay: state.day, resolved: false }))] };
    items.push(...newChains.map((chain) => `${chain.title} has emerged`));
  }
  const newEvents = getTriggeredActiveEvents(state, state.activeEvents.map((event) => event.id));
  if (newEvents.length) {
    next = { ...next, activeEvents: [...next.activeEvents, ...newEvents] };
    items.push(...newEvents.map((event) => `${event.title} now requires a decision`));
  }
  return { state: next, items };
};

/**
 * Generate a cabinet appointment ActiveEvent for a ministry position.
 * One position is presented per day on days 2-8.
 */
function generateCabinetAppointmentEvent(state: GameState): ActiveEvent | null {
  // Only on days 2 through 8
  const appointmentDay = state.day - 1; // day 2 → index 0 (Finance), day 3 → index 1 (Petroleum), etc.
  if (appointmentDay < 1 || appointmentDay > ministryPositions.length) return null;

  const portfolio = ministryPositions[appointmentDay - 1] as MinistryPosition;

  // Skip if already appointed (shouldn't happen in normal flow, but guard for save migration)
  if (state.cabinetAppointments[portfolio]) return null;

  // Skip if there's already a pending appointment event for this portfolio
  if (state.activeEvents.some((e) => e.source === "cabinet-appointment" && e.cabinetPortfolio === portfolio)) return null;

  const candidates = cabinetCandidates[portfolio];
  if (!candidates || candidates.length === 0) return null;

  const choices: EventChoice[] = candidates.map((c, i) => ({
    id: `appoint-${portfolio.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-")}-${i}`,
    label: `Appoint ${c.name}`,
    context: `${c.name} — ${c.faction}. ${c.tradeOff}`,
    consequences: [
      {
        id: `cabinet-appoint-${portfolio}-${i}`,
        sourceEvent: `cabinet-appointment-${portfolio}`,
        delayDays: 0,
        description: `${c.name} appointed as Minister of ${portfolio}`,
        effects: [
          { target: "approval", delta: c.competence >= 80 ? 2 : -1, description: c.competence >= 80 ? "A credible appointment boosts confidence" : "Questions arise about the appointment" },
          ...(c.faction ? [{ target: "faction" as const, factionName: c.faction, delta: c.loyalty >= 70 ? 5 : -3, description: c.loyalty >= 70 ? `${c.faction} approves of the appointment` : `${c.faction} is wary of this choice` }] : []),
        ],
      },
    ],
  }));

  return {
    id: `cabinet-appointment-${portfolio.toLowerCase().replace(/\s+&\s+/g, "-").replace(/\s+/g, "-")}`,
    title: `Appoint Minister of ${portfolio}`,
    severity: "critical",
    description: `The Ministry of ${portfolio} awaits your appointment. Each candidate brings different strengths, faction ties, and political trade-offs.`,
    category: "governance",
    source: "cabinet-appointment",
    choices,
    createdDay: state.day,
    expiresInDays: 10,
    cabinetPortfolio: portfolio,
  };
}

export function processTurn(state: GameState): GameState {
  if (state.cabalMeeting && state.cabalMeeting.day === state.day && !state.cabalMeeting.resolved) {
    return finalizePresentation(state);
  }

  let next = { ...state };
  const summaryItems: string[] = [];

  const pending = processPendingConsequences(next);
  next = pending.state;
  summaryItems.push(...pending.items);

  next = driftMetrics(next);
  summaryItems.push("Daily pressure nudged approval, treasury, and stability");

  const traitDrift = processTraitDrift(next);
  next = traitDrift.state;
  summaryItems.push(...traitDrift.items.slice(0, 2));

  const factionMood = processFactionAndGovernorMood(next);
  next = factionMood.state;
  summaryItems.push(...factionMood.summaryItems.slice(0, 3));
  next.activeEvents = [...next.activeEvents, ...factionMood.newEvents];
  for (const profile of FACTION_PROFILES) {
    const faction = next.factions[profile.key];
    if (!faction) continue;
    const headline = generateHeadline(profile.key, faction.grievance ?? 0);
    if (headline && !next.headlines.includes(headline)) {
      next = { ...next, headlines: [headline, ...next.headlines].slice(0, 20) };
    }
    const inboxMsg = generateInboxMessage(profile.key, faction.grievance ?? 0, next.day, next.date);
    if (inboxMsg && !next.inboxMessages.some((m) => m.id === inboxMsg.id)) {
      next = { ...next, inboxMessages: [...next.inboxMessages, inboxMsg] };
    }
  }

  const randomEvent = generateRandomEvent(next);
  if (randomEvent) {
    next = applyDecisionConsequences(next, randomEvent.description, randomEvent.description, [randomEvent], "event");
    summaryItems.push(randomEvent.description);
  }

  const courts = applyCourtOutcomes(next);
  next = courts.state;
  summaryItems.push(...courts.items);

  const macro = processMacroEconomy(next);
  next = macro.state;
  next.approval = clamp(next.approval + macro.policyApproval, 0, 100);
  next.treasury = roundMetric(next.treasury + macro.policyTreasury);
  next.trust = clamp(next.trust + macro.policyTrust, 0, 100);
  summaryItems.push(...macro.items.slice(0, 2));

  const hookProgress = processHookInvestigations(next);
  next = hookProgress.state;
  summaryItems.push(...hookProgress.items.slice(0, 2));

  const betrayal = maybeTriggerBetrayal(next);
  next = betrayal.state;
  summaryItems.push(...betrayal.items);

  if (next.stress > 70) {
    next = processConsequences(next, [{ id: `stress-${next.day}`, sourceEvent: "stress", delayDays: 0, description: "High stress reduces effectiveness", effects: [{ target: "approval", delta: -1, description: "Fatigue shows in public appearances" }, { target: "health", delta: -1, description: "The strain has a physical cost" }] }]);
    summaryItems.push("High stress visibly eroded effectiveness");
  }

  if (next.outrage > 80) {
    next = processConsequences(next, [{ id: `outrage-${next.day}`, sourceEvent: "outrage", delayDays: 0, description: "Popular anger spills into the streets", effects: [{ target: "approval", delta: -1, description: "Approval slips under pressure" }, { target: "stability", delta: -2, description: "Street action disrupts order" }] }]);
    summaryItems.push("Popular anger spilled into the streets");
  }

  const pressure = spawnNarrativePressure(next);
  next = pressure.state;
  summaryItems.push(...pressure.items);

  const strategic = processStrategicRhythm(next);
  next = strategic.state;
  summaryItems.push(...strategic.items);

  // Cabinet appointment events — one per day on days 2-8
  const cabinetEvent = generateCabinetAppointmentEvent(next);
  if (cabinetEvent) {
    next = { ...next, activeEvents: [...next.activeEvents, cabinetEvent] };
    summaryItems.push(`${cabinetEvent.title} — candidates await your decision`);
  }

  const election = resolveElectionCycle(next);
  next = election.state;
  summaryItems.push(...election.items);

  // Handle expiration of policy events and auto-cancel pending lever changes
  for (const event of next.activeEvents) {
    if (event.expiresInDays && next.day > event.createdDay + event.expiresInDays) {
      if (event.source === "policy" && event.policyLeverKey) {
        next.policyLevers = { ...next.policyLevers };
        next.policyLevers[event.policyLeverKey] = {
          ...next.policyLevers[event.policyLeverKey],
          pendingPosition: null,
        };
      }
      if (event.source === "faction-demand" && event.factionKey) {
        const isTier90 = event.severity === "critical";
        const loyaltyLoss = isTier90 ? DEMAND_EXPIRE_TIER90_LOYALTY_LOSS : DEMAND_EXPIRE_TIER70_LOYALTY_LOSS;
        next = processConsequences(next, [{
          id: `fd-expire-${event.factionKey}-${next.day}`,
          sourceEvent: event.id,
          delayDays: 0,
          description: `${event.factionKey} demand expired unanswered`,
          effects: [
            { target: "faction", factionName: event.factionKey, delta: -loyaltyLoss, description: `${event.factionKey} loses patience` },
            { target: "grievance", factionName: event.factionKey, delta: DEMAND_EXPIRE_GRIEVANCE_GAIN, description: `${event.factionKey} grievance deepens` },
            { target: "stability", delta: -DEMAND_EXPIRE_STABILITY_LOSS, description: "Unanswered demands erode stability" },
          ],
        }]);
      }
    }
  }

  // Filter out expired events
  next.activeEvents = next.activeEvents.filter((event) => !event.expiresInDays || next.day <= event.createdDay + event.expiresInDays);

  const pendingCritical = next.activeEvents.filter((event) => event.severity === "critical").length;
  next = {
    ...next,
    day: next.day + 1,
    date: advanceDate(next.date),
    approvalHistory: [...next.approvalHistory, { day: next.day + 1, approval: next.approval }].slice(-60),
    macroHistory: [...next.macroHistory, createMacroHistoryPoint(next.day + 1, next.macroEconomy)].slice(-120),
    cabalMeeting: null,
  };

  next = appendTurnLog(next, {
    day: next.day,
    date: next.date,
    event: `Day ${next.day} briefing complete`,
    effects: (summaryItems.length ? summaryItems : ["A relatively quiet day in Aso Rock"]).slice(0, 6),
    category: "system",
  });

  if (!election.defeatState) {
    next = {
      ...next,
      cabalMeeting: createDailyCabalMeeting(next),
    };
  }

  next = finalizePresentation({
    ...next,
    dailySummary: {
      day: next.day,
      date: next.date,
      headline: summaryItems[0] ?? "The day closed without a defining crisis",
      items: summaryItems.slice(0, 6),
      pendingCritical,
    },
  });

  if (election.defeatState) {
    return finalizePresentation({ ...next, phase: "defeat", defeatState: election.defeatState, cabalMeeting: null });
  }

  // Legislative engine — process bills each turn
  next = processLegislativeTurn(next);

  // Godfather engine — process patronage each turn
  if (next.patronage) {
    const gfResult = processGodfatherTurn(next, next.patronage);
    next = { ...next, patronage: gfResult.patronageState };

    // Apply patronage tier effects
    const pEffects = getPatronageEffects(next.patronage.patronageIndex);
    if (pEffects.approvalCeiling && next.approval > pEffects.approvalCeiling) {
      next = { ...next, approval: pEffects.approvalCeiling };
    }
    if (pEffects.stabilityPenalty) {
      next = { ...next, stability: Math.max(0, next.stability + pEffects.stabilityPenalty) };
    }

    // Generate inbox messages for godfather approaches
    for (const approach of gfResult.approaches) {
      const gf = next.patronage.godfathers.find(g => g.id === approach.godfatherId);
      if (gf) {
        const msg = {
          id: `gf-approach-${gf.id}-${next.day}`,
          day: next.day,
          date: next.date,
          sender: gf.name,
          role: "Power Broker",
          initials: gf.name.split(" ").map(n => n[0]).join("").slice(0, 2),
          subject: `${approach.type === "contract" ? "Business Proposition" : "A Favour to Discuss"}`,
          preview: approach.godfatherOffers,
          fullText: `${approach.godfatherOffers}\n\nIn return: ${approach.playerOwes}`,
          priority: "Normal" as const,
          read: false,
          source: "system" as const,
        };
        if (!next.inboxMessages.some(m => m.id === msg.id)) {
          next = { ...next, inboxMessages: [...next.inboxMessages, msg] };
        }
      }
    }
  }

  // Federal Character compliance check
  if (next.federalCharacter) {
    const fcAppointments = next.federalCharacter.appointments;
    const fcBudget = next.federalCharacter.budgetAllocation;
    const newScore = calculateComplianceScore(fcAppointments, fcBudget);
    const newZoneScores = calculateZoneBalances(fcAppointments);
    const consequences = getConsequences(newScore);

    next = {
      ...next,
      federalCharacter: {
        ...next.federalCharacter,
        complianceScore: newScore,
        zoneScores: newZoneScores,
      },
    };

    // Apply consequence effects
    for (const effect of consequences.effects) {
      if (effect.target === "stability") {
        next = { ...next, stability: Math.max(0, next.stability + effect.delta) };
      } else if (effect.target === "approval") {
        next = { ...next, approval: Math.max(0, next.approval + effect.delta) };
      }
    }
  }

  // Intelligence engine — process operations each turn
  if (next.intelligence && next.intelligence.dniId) {
    const intelResult = processIntelligenceTurn(next.intelligence, next.day);
    next = { ...next, intelligence: intelResult };

    // Generate inbox messages for completed operations
    for (const completed of intelResult.completedOperations) {
      // Only notify about operations completed this turn (not previously)
      const alreadyNotified = next.inboxMessages.some(m => m.id === `intel-${completed.operationId}`);
      if (!alreadyNotified) {
        const msg = {
          id: `intel-${completed.operationId}`,
          day: next.day,
          date: next.date,
          sender: "Director of National Intelligence",
          role: "DNI",
          initials: "DN",
          subject: completed.success ? "Operation Complete — Findings" : completed.exposed ? "CRITICAL: Operation Exposed" : "Operation Failed",
          preview: completed.success
            ? `Operation ${completed.type} succeeded. ${completed.findings.length} findings.`
            : completed.exposed
              ? `Operation ${completed.type} was exposed. Political damage expected.`
              : `Operation ${completed.type} failed to produce results.`,
          fullText: completed.success
            ? `The ${completed.type} operation has concluded successfully.\n\nFindings:\n${completed.findings.map(f => `- ${f.description}`).join("\n")}`
            : completed.exposed
              ? `CRITICAL FAILURE: The ${completed.type} operation has been exposed. Expect political backlash and potential media coverage.`
              : `The ${completed.type} operation did not produce actionable intelligence.`,
          priority: (completed.exposed ? "Urgent" : "Normal") as "Urgent" | "Normal",
          read: false,
          source: "system" as const,
        };
        next = { ...next, inboxMessages: [...next.inboxMessages, msg] };
      }
    }

    // Apply exposure penalties
    for (const completed of intelResult.completedOperations) {
      if (completed.exposed) {
        next = { ...next, approval: Math.max(0, next.approval - 5), trust: Math.max(0, next.trust - 8) };
      }
    }
  }

  // Adviser briefing — add legislative inbox message each day
  {
    const briefing = generateAdviserBriefing(next);
    const briefText = briefing.weeklySummary
      ? `${briefing.dailyBrief} ${briefing.weeklySummary}`
      : briefing.dailyBrief;
    const briefMsg = {
      id: `legislative-brief-${next.day}`,
      day: next.day,
      date: next.date,
      sender: "Sen. Adaobi Nwosu",
      role: "Legislative Affairs Adviser",
      initials: "AN",
      subject: briefing.weeklySummary ? "Weekly Legislative Summary" : "Legislative Update",
      preview: briefing.dailyBrief,
      fullText: briefText,
      priority: (next.legislature?.activeBills.some((b) => b.isCrisis) ? "Urgent" : "Normal") as "Urgent" | "Normal",
      read: false,
      source: "system" as const,
    };
    if (!next.inboxMessages.some((m) => m.id === briefMsg.id)) {
      next = { ...next, inboxMessages: [...next.inboxMessages, briefMsg] };
    }
  }

  // Party internals — process each turn
  if (next.partyInternals) {
    next = {
      ...next,
      partyInternals: processPartyTurn(next.partyInternals, {
        day: next.day,
        approval: next.approval,
        stability: next.stability,
        partyLoyalty: next.partyLoyalty,
      }),
    };
  }

  const defeat = checkDefeatConditions(next);
  const victory = checkVictoryConditions(next);
  if (defeat) return finalizePresentation({ ...next, phase: "defeat", defeatState: defeat.id, cabalMeeting: null });
  if (victory) return finalizePresentation({ ...next, phase: "victory", victoryPath: victory.id, cabalMeeting: null });
  return next;
}






