import { createContext, useContext, useReducer, type ReactNode } from "react";
import { cloneInboxMessages, getOpeningEvents, initialHeadlines } from "./gameContent";
import {
  advanceDate,
  createDailyCabalMeeting,
  generatePolicyConfirmationEvent,
  type Consequence,
  type GameInboxMessage,
  type GameState,
  executeQuickAction,
  handleInboxAction,
  markInboxMessageRead,
  processTurn,
  relationshipFromLoyalty,
  requirementsMet,
  resolveActiveEventChoice,
  resolveCabalChoice,
  resolveChainChoice,
  startHookInvestigation,
  useHook,
} from "./gameEngine";
import {
  computeFailureRisks,
  computeVictoryProgress,
} from "./victorySystem";
import { assignInitialTraits } from "./traits";
import type {
  ActiveEvent,
  AppointmentState,
  CampaignPromiseState,
  CharacterState,
  ChoiceRequirement,
  CourtCase,
  DaySummary,
  FactionState,
  GameState as GameStateShape,
  GovernorState,
  HealthCrisisState,
  Hook,
  LegacyMilestoneRecord,
  MacroEconomicState,
  MacroHistoryPoint,
  CabalMeetingState,
  TermState,
  VicePresidentState,
  PolicyLeverKey,
  AnyPolicyPosition,
  SingleLeverState,
  PolicyLeverState,
} from "./gameTypes";
import { cabinetRoster, characters, factions, ministryPositions, cabinetCandidates } from "./gameData";
import { selectConstitutionalOfficers } from "./constitutionalOfficers";
import { registerConstitutionalPools } from "./constitutionalPools";
import { defaultLegislativeState, signBill, vetoBill, resolveLegislativeCrisis } from "./legislativeEngine";
import { seedLegislativeCalendar } from "./legislativeBills";

// Register constitutional officer pools at module load time
registerConstitutionalPools();

export type {
  ActiveEvent,
  CharacterState,
  Consequence,
  CourtCase,
  DaySummary,
  FactionState,
  GameInboxMessage,
  GameState,
  GovernorState,
  LegacyMilestoneRecord,
};

export interface CampaignConfig {
  firstName: string;
  lastName: string;
  age: number;
  gender: "Male" | "Female";
  stateOfOrigin: string;
  education: string;
  party: string;
  era: "1999" | "2007" | "2015" | "2023";
  vpName: string;
  vpState: string; // VP's state of origin — used for zonal balancing
  personalAssistant: string;
  promises: string[];
  appointments: Record<string, string>;
  presidentName: string;
  origin: string;
  traits: string[];
  ideologies: string[];
  title?: string;
  ethnicity: string;
  religion: string;
  occupation: string;
}

const TERM_LENGTH_DAYS = 1460;

const originModifiers: Record<string, { approval: number; treasury: number; stability: number; politicalCapital: number; stress: number }> = {
  "Lagos Politician": { approval: 5, treasury: 0.1, stability: 0, politicalCapital: 5, stress: 0 },
  "Northern Powerbroker": { approval: 0, treasury: 0, stability: 5, politicalCapital: 10, stress: 0 },
  "Military Veteran": { approval: -5, treasury: 0, stability: 10, politicalCapital: 0, stress: 0 },
  "Technocrat Outsider": { approval: 0, treasury: 0.15, stability: 0, politicalCapital: -5, stress: 0 },
  "People's Champion": { approval: 15, treasury: -0.05, stability: -3, politicalCapital: -5, stress: 0 },
};


const eraStartDates: Record<CampaignConfig["era"], { date: string; day: number }> = {
  "1999": { date: "29 May 1999", day: 1 },
  "2007": { date: "29 May 2007", day: 1 },
  "2015": { date: "29 May 2015", day: 1 },
  "2023": { date: "29 May 2023", day: 1 },
};

const eraTermPresets: Record<CampaignConfig["era"], { daysUntilElection: number; electionMomentum: number }> = {
  "1999": { daysUntilElection: TERM_LENGTH_DAYS, electionMomentum: 58 },
  "2007": { daysUntilElection: 240, electionMomentum: 44 },
  "2015": { daysUntilElection: 540, electionMomentum: 53 },
  "2023": { daysUntilElection: 1180, electionMomentum: 48 },
};

const mkLever = (position: AnyPolicyPosition): SingleLeverState => ({ position, pendingPosition: null, cooldownUntilDay: 0 });

export const eraPolicyPresets: Record<string, PolicyLeverState> = {
  "1999": {
    fuelSubsidy: mkLever("full"),
    electricityTariff: mkLever("subsidised"),
    fxPolicy: mkLever("peg"),
    interestRate: mkLever("neutral"),
    taxRate: mkLever("low"),
    cashTransfers: mkLever("none"),
    importTariffs: mkLever("restrictive"),
    minimumWage: mkLever("frozen"),
    publicSectorHiring: mkLever("expansion"),
  },
  "2007": {
    fuelSubsidy: mkLever("full"),
    electricityTariff: mkLever("subsidised"),
    fxPolicy: mkLever("managed-float"),
    interestRate: mkLever("accommodative"),
    taxRate: mkLever("low"),
    cashTransfers: mkLever("none"),
    importTariffs: mkLever("protective"),
    minimumWage: mkLever("modest"),
    publicSectorHiring: mkLever("normal"),
  },
  "2015": {
    fuelSubsidy: mkLever("partial"),
    electricityTariff: mkLever("subsidised"),
    fxPolicy: mkLever("peg"),
    interestRate: mkLever("tightening"),
    taxRate: mkLever("standard"),
    cashTransfers: mkLever("minimal"),
    importTariffs: mkLever("protective"),
    minimumWage: mkLever("modest"),
    publicSectorHiring: mkLever("essential-only"),
  },
  "2023": {
    fuelSubsidy: mkLever("partial"),
    electricityTariff: mkLever("subsidised"),
    fxPolicy: mkLever("managed-float"),
    interestRate: mkLever("neutral"),
    taxRate: mkLever("standard"),
    cashTransfers: mkLever("minimal"),
    importTariffs: mkLever("protective"),
    minimumWage: mkLever("modest"),
    publicSectorHiring: mkLever("normal"),
  },
};

const eraMacroPresets: Record<CampaignConfig["era"], MacroEconomicState> = {
  "1999": { inflation: 11.2, fxRate: 92, reserves: 7.5, debtToGdp: 29.4, oilOutput: 2.1, subsidyPressure: 28 },
  "2007": { inflation: 8.5, fxRate: 125, reserves: 46.1, debtToGdp: 19.8, oilOutput: 2.25, subsidyPressure: 24 },
  "2015": { inflation: 9.0, fxRate: 199, reserves: 29.2, debtToGdp: 15.7, oilOutput: 1.92, subsidyPressure: 48 },
  "2023": { inflation: 28.1, fxRate: 1702, reserves: 33.2, debtToGdp: 42.3, oilOutput: 1.36, subsidyPressure: 72 },
};

const defaultGovernors: GovernorState[] = [
  { name: "Gov. Musa Garba", zone: "North-West", party: "Ruling", loyalty: 50, competence: 70, approval: 39, relationship: "Wary", avatar: "MG", demands: "Fiscal autonomy and security support" },
  { name: "Gov. Yerima Kanuri", zone: "North-East", party: "Ruling", loyalty: 70, competence: 82, approval: 41, relationship: "Friendly", avatar: "YK", demands: "Counter-insurgency resources" },
  { name: "Gov. James Deshi", zone: "North-Central", party: "Opposition", loyalty: 40, competence: 65, approval: 44, relationship: "Neutral", avatar: "JD", demands: "Farmer-herder mediation" },
  { name: "Gov. Adewale Adekunle", zone: "South-West", party: "Ruling", loyalty: 72, competence: 78, approval: 52, relationship: "Friendly", avatar: "AA", demands: "Lagos special economic status" },
  { name: "Gov. Obiora Nwosu", zone: "South-East", party: "Opposition", loyalty: 25, competence: 88, approval: 33, relationship: "Hostile", avatar: "ON", demands: "South-East representation in cabinet" },
  { name: "Gov. Edet Okon", zone: "South-South", party: "Ruling", loyalty: 55, competence: 72, approval: 45, relationship: "Wary", avatar: "EO", demands: "Niger Delta oil revenue sharing" },
];

const defaultCases: CourtCase[] = [
  { id: "case-1", title: "Election Petition Tribunal", court: "Supreme Court", status: "Hearing", plaintiff: "Opposition Coalition", defendant: "INEC", stakes: "Constitutional", description: "Opposition challenges 3 gubernatorial results claiming electoral fraud.", daysToDecision: 30 },
  { id: "case-2", title: "Fuel Subsidy Legality", court: "Federal High Court", status: "Filed", plaintiff: "NLC/TUC", defendant: "Federal Government", stakes: "High", description: "Labour unions challenge subsidy policy without legislative cover.", daysToDecision: 45 },
  { id: "case-3", title: "EFCC Overreach Suit", court: "Appeal Court", status: "Deliberation", plaintiff: "Chief Adaeze Okonkwo", defendant: "EFCC", stakes: "Medium", description: "Petroleum Ministry allies claim selective prosecution.", daysToDecision: 20 },
  { id: "case-4", title: "Niger Intervention Legality", court: "ECOWAS Court", status: "Filed", plaintiff: "Civil Society Coalition", defendant: "ECOWAS/Nigeria", stakes: "High", description: "Civil society challenges regional intervention planning.", daysToDecision: 60 },
  { id: "case-5", title: "Digital Tax Constitutional Challenge", court: "Federal High Court", status: "Hearing", plaintiff: "Tech Companies Association", defendant: "FIRS", stakes: "Medium", description: "Tech companies challenge a new digital levy as double taxation.", daysToDecision: 35 },
];

const hashSeed = (value: string) => value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

const averageFactionLoyalty = (factionMap: Record<string, FactionState>): number => {
  const entries = Object.values(factionMap);
  if (entries.length === 0) return 50;
  return entries.reduce((sum, faction) => sum + faction.loyalty, 0) / entries.length;
};

const governingPhaseFromTerm = (daysInOffice: number, daysUntilElection: number): TermState["governingPhase"] => {
  if (daysUntilElection <= 30) return "election";
  if (daysUntilElection <= 180) return "campaign";
  if (daysUntilElection <= 540) return "pre-positioning";
  if (daysInOffice <= 90) return "honeymoon";
  return "governance";
};

const inferPromiseCategory = (promise: string): CampaignPromiseState["category"] => {
  if (/(job|naira|fuel|tax|econom|inflation|investment|power|budget|industry)/i.test(promise)) return "economy";
  if (/(security|police|army|bandit|terror|defence|insurg|crime)/i.test(promise)) return "security";
  if (/(health|school|education|poverty|housing|welfare|hospital|wage)/i.test(promise)) return "welfare";
  return "governance";
};

const promiseTargetDays: Record<CampaignPromiseState["category"], number> = {
  economy: 120,
  security: 160,
  governance: 210,
  welfare: 180,
};

const createCampaignPromises = (promises: string[]): CampaignPromiseState[] => promises.map((title, index) => {
  const category = inferPromiseCategory(title);
  return {
    id: `promise-${index + 1}`,
    title,
    category,
    targetDay: promiseTargetDays[category],
    progress: 0,
    status: "active",
  };
});

const createAppointments = (appointments: Record<string, string>): AppointmentState[] => Object.entries(appointments).map(([office, appointee]) => ({
  office,
  appointee,
  confirmed: true,
}));

const createVicePresidentState = (name: string): VicePresidentState => {
  const seed = hashSeed(name || "Vice President");
  const ambition = 55 + (seed % 31);
  const loyalty = Math.max(38, Math.min(82, 72 - Math.round((ambition - 55) * 0.65) + (seed % 5) - 2));
  return {
    name: name || "Vice President",
    loyalty,
    ambition,
    relationship: relationshipFromLoyalty(loyalty),
    mood: ambition >= 78 ? "Restless" : "Steady",
  };
};

const createTermState = (era: CampaignConfig["era"]): TermState => {
  const preset = eraTermPresets[era] ?? eraTermPresets["2023"];
  return {
    current: 1,
    daysInOffice: 1,
    daysUntilElection: preset.daysUntilElection,
    daysUntilMediaChat: 30,
    daysUntilFactionReport: 30,
    daysUntilEconomicSnapshot: 30,
    reelectionsWon: 0,
    overstayDays: 0,
    governingPhase: governingPhaseFromTerm(1, preset.daysUntilElection),
    electionMomentum: preset.electionMomentum,
  };
};

const createHealthCrisisState = (): HealthCrisisState => ({
  consecutiveHighStressDays: 0,
  rumorsActive: false,
  announced: false,
  concealmentActive: false,
  recoveryTurnsRemaining: 0,
});

const createMacroEconomyState = (era: CampaignConfig["era"], originKey?: string): MacroEconomicState => {
  const base = eraMacroPresets[era] ?? eraMacroPresets["2023"];
  const origin = originModifiers[originKey ?? "Lagos Politician"] ?? originModifiers["Lagos Politician"];
  return {
    inflation: Number((base.inflation + Math.max(0, -origin.stability) * 0.15).toFixed(1)),
    fxRate: Math.round(base.fxRate - origin.treasury * 120),
    reserves: Number((base.reserves + origin.treasury * 3).toFixed(1)),
    debtToGdp: Number(base.debtToGdp.toFixed(1)),
    oilOutput: Number((base.oilOutput + origin.stability * 0.01).toFixed(2)),
    subsidyPressure: Math.round(base.subsidyPressure + Math.max(0, -origin.approval) * 0.3),
  };
};

const createMacroHistory = (day: number, macroEconomy: MacroEconomicState): MacroHistoryPoint[] => [{ day, ...macroEconomy }];

const vpAvatar = (name: string) => name.split(" ").slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "VP";

const seedInitialHooks = (charactersMap: Record<string, CharacterState>): Record<string, CharacterState> => {
  const updated: Record<string, CharacterState> = {};
  for (const [name, character] of Object.entries(charactersMap)) {
    const hooks = [...character.hooks];
    const traits = new Set(character.traits);
    const seed = hashSeed(name);
    const shouldSeed = character.ambition >= 68 || traits.has("corrupt") || traits.has("schemer") || /petroleum|finance|chairman|vice president|security/i.test(character.portfolio);
    if (shouldSeed) {
      const type: Hook["type"] = traits.has("corrupt") || /finance|petroleum/i.test(character.portfolio)
        ? "financial"
        : /security|defence|nsa/i.test(character.portfolio)
          ? "criminal"
          : traits.has("schemer") || character.ambition >= 80
            ? "political"
            : "personal";
      const severity: Hook["severity"] = character.ambition >= 85 || traits.has("schemer") ? "devastating" : character.ambition >= 72 || traits.has("corrupt") ? "major" : "minor";
      const evidence = 22 + (seed % 28);
      hooks.push({
        id: `hook-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        target: name,
        type,
        severity,
        description: type === "financial"
          ? "Payment trails and procurement anomalies point to a vulnerable money channel."
          : type === "criminal"
            ? "Intelligence suggests off-book coercive operations tied to this office."
            : type === "political"
              ? "Private commitments and factional promises could become leverage."
              : "Personal indiscretions and private dependence have created quiet leverage.",
        discovered: evidence >= 24,
        usable: false,
        evidence,
        underInvestigation: false,
        used: false,
      });
    }
    updated[name] = { ...character, hooks };
  }
  return updated;
};

const buildCharacterMap = (vicePresident?: VicePresidentState): Record<string, CharacterState> => {
  const map: Record<string, CharacterState> = {};
  // Cabinet characters are NOT added here — they are added when the player appoints them
  for (const character of characters) {
    map[character.name] = {
      name: character.name,
      portfolio: character.portfolio,
      loyalty: character.loyalty,
      competence: character.competence,
      ambition: character.ambition,
      faction: character.faction,
      relationship: character.relationship,
      avatar: character.avatar,
      traits: [],
      betrayalThreshold: Math.max(15, 50 - character.ambition * 0.3),
      hooks: [],
      age: character.age,
      state: character.state,
      gender: character.gender,
    };
  }
  if (vicePresident && !map[vicePresident.name]) {
    map[vicePresident.name] = {
      name: vicePresident.name,
      portfolio: "Vice President",
      loyalty: vicePresident.loyalty,
      competence: 74,
      ambition: vicePresident.ambition,
      faction: "Presidential Ticket",
      relationship: vicePresident.relationship,
      avatar: vpAvatar(vicePresident.name),
      traits: vicePresident.ambition >= 78 ? ["ambitious", "pragmatic"] : ["loyal", "pragmatic"],
      betrayalThreshold: Math.max(15, 55 - vicePresident.ambition * 0.25),
      hooks: [],
    };
  }
  return seedInitialHooks(assignInitialTraits(map));
};

const buildFactionMap = (): Record<string, FactionState> => Object.fromEntries(factions.map((faction) => [
  faction.name,
  { name: faction.name, influence: faction.influence, loyalty: 50, stance: "Neutral" as const, grievance: 0, firedThresholds: [] },
]));

const computeElectionMomentumValue = (state: GameStateShape, vpLoyalty = state.vicePresident.loyalty): number => {
  const factionLoyalty = averageFactionLoyalty(state.factions);
  const raw = state.approval * 0.4 + factionLoyalty * 0.4 + state.trust * 0.2 + (vpLoyalty - 50) * 0.1 - Math.min(15, state.term.overstayDays * 0.05);
  return Math.round(Math.max(0, Math.min(100, raw)));
};

const deriveVicePresidentMood = (state: GameStateShape, loyalty: number, ambition: number): VicePresidentState["mood"] => {
  if (state.healthCrisis.rumorsActive || (state.term.current > 1 && ambition >= 75 && loyalty < 55)) {
    return loyalty < 35 ? "Plotting" : "Restless";
  }
  if (state.term.governingPhase === "campaign" && ambition >= 78) return "Restless";
  return loyalty < 32 ? "Plotting" : loyalty < 55 ? "Restless" : "Steady";
};

const syncStrategicState = (state: GameStateShape): GameStateShape => {
  const vpCharacter = state.characters[state.vicePresident.name];
  const loyalty = vpCharacter?.loyalty ?? state.vicePresident.loyalty;
  const ambition = vpCharacter?.ambition ?? state.vicePresident.ambition;
  const relationship = vpCharacter?.relationship ?? relationshipFromLoyalty(loyalty);
  const governingPhase = governingPhaseFromTerm(state.term.daysInOffice, state.term.daysUntilElection);
  const baseState = {
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
    ...baseState,
    vicePresident: {
      ...baseState.vicePresident,
      mood: deriveVicePresidentMood(baseState, loyalty, ambition),
    },
    term: {
      ...baseState.term,
      electionMomentum: computeElectionMomentumValue(baseState, loyalty),
    },
  };
};

const defaultGameState: GameState = {
  day: 0,
  date: "",
  phase: "menu",
  approval: 0,
  treasury: 0,
  politicalCapital: 0,
  stability: 0,
  presidentName: "",
  presidentOrigin: "",
  presidentTraits: [],
  stress: 0,
  presidentAge: 0,
  presidentGender: "",
  presidentState: "",
  presidentEducation: "",
  presidentTitle: "",
  presidentEthnicity: "",
  presidentReligion: "",
  presidentOccupation: "",
  presidentParty: "",
  partyLoyalty: 70,
  politicalState: { partyLoyalty: 70 },
  presidentEra: "",
  vicePresident: createVicePresidentState("Vice President"),
  constitutionalOfficers: [],
  personalAssistant: "",
  campaignPromises: [],
  appointments: [],
  term: createTermState("2023"),
  health: 85,
  healthCrisis: createHealthCrisisState(),
  macroEconomy: createMacroEconomyState("2023"),
  macroHistory: [],
  cabalMeeting: null,
  characters: {},
  factions: {},
  activeChains: [],
  activeEvents: [],
  pendingConsequences: [],
  victoryProgress: {},
  failureRisks: {},
  outrage: 0,
  trust: 0,
  activeCases: [],
  judicialIndependence: 0,
  governors: [],
  turnLog: [],
  inboxMessages: [],
  headlines: [...initialHeadlines],
  dailySummary: null,
  approvalHistory: [],
  legacyMilestones: [],
  lastActionAtDay: {},
  policyLevers: eraPolicyPresets["2023"],
  cabinetAppointments: {},
};

export const hydrateLoadedGameState = (state: GameState): GameState => {
  const era = (state.presidentEra as CampaignConfig["era"]) || "2023";
  const fallbackVp = createVicePresidentState(state.vicePresident?.name || "Vice President");
  const fallbackMacro = createMacroEconomyState(era);

  // Migration: add default policy levers if missing (for saves created before policyLevers existed)
  if (!state.policyLevers) {
    state.policyLevers = eraPolicyPresets[era] || eraPolicyPresets["2023"];
  }

  // Migration: add grievance fields to factions if missing (for saves created before faction drift)
  if (state.factions) {
    for (const key of Object.keys(state.factions)) {
      const f = state.factions[key];
      if (f.grievance === undefined) {
        state.factions[key] = { ...f, grievance: 0, firedThresholds: [] };
      }
    }
  }

  // Migration: backfill date on inbox messages created before date field existed
  if (state.inboxMessages?.length) {
    const era = (state.presidentEra as CampaignConfig["era"]) || "2023";
    const eraStart = eraStartDates[era] ?? eraStartDates["2023"];
    state.inboxMessages = state.inboxMessages.map((msg) => {
      if (msg.date) return msg;
      // Derive date from era start + message day offset
      let d = eraStart.date;
      for (let i = 1; i < msg.day; i++) d = advanceDate(d);
      return { ...msg, date: d };
    });
  }

  // Migration: backfill cabinetAppointments from existing characters for old saves
  if (!state.cabinetAppointments) {
    const appointments: Record<string, string | null> = {};
    for (const pos of ministryPositions) {
      // Check if any character in state has a matching portfolio
      const match = Object.values(state.characters ?? {}).find(
        (c) => c.portfolio === pos || c.portfolio === `Minister of ${pos}`
      );
      appointments[pos] = match ? match.name : null;
    }
    // If no characters match but cabinetRoster names exist in state.characters, use those
    if (Object.values(appointments).every((v) => v === null) && state.characters) {
      for (const member of cabinetRoster) {
        if (state.characters[member.name]) {
          appointments[member.portfolio] = member.name;
        }
      }
    }
    state.cabinetAppointments = appointments;
  }

  const hydratedBase: GameState = {
    ...defaultGameState,
    ...state,
    vicePresident: { ...fallbackVp, ...state.vicePresident },
    personalAssistant: state.personalAssistant ?? "Presidential Aide",
    campaignPromises: Array.isArray(state.campaignPromises) ? state.campaignPromises : [],
    appointments: Array.isArray(state.appointments) ? state.appointments : [],
    term: { ...createTermState(era), ...state.term },
    healthCrisis: { ...createHealthCrisisState(), ...state.healthCrisis },
    macroEconomy: { ...fallbackMacro, ...state.macroEconomy },
    macroHistory: Array.isArray(state.macroHistory) && state.macroHistory.length > 0 ? state.macroHistory : createMacroHistory(state.day || 1, { ...fallbackMacro, ...state.macroEconomy }),
    characters: Object.keys(state.characters ?? {}).length > 0 ? state.characters : buildCharacterMap(fallbackVp),
    factions: Object.keys(state.factions ?? {}).length > 0 ? state.factions : buildFactionMap(),
    headlines: state.headlines?.length ? state.headlines : [...initialHeadlines],
    lastActionAtDay: state.lastActionAtDay ?? {},
    cabalMeeting: state.cabalMeeting ?? null,
    policyLevers: state.policyLevers,
  };
  const hydrated = syncStrategicState(hydratedBase);
  return {
    ...hydrated,
    cabalMeeting: hydrated.phase === "playing"
      ? hydrated.cabalMeeting && hydrated.cabalMeeting.day === hydrated.day ? hydrated.cabalMeeting : createDailyCabalMeeting(hydrated)
      : hydrated.cabalMeeting,
  };
};

const withDerivedState = (state: GameState): GameState => {
  const synced = syncStrategicState(state);
  return {
    ...synced,
    victoryProgress: computeVictoryProgress(synced),
    failureRisks: computeFailureRisks(synced),
  };
};

export function initializeGameState(config: CampaignConfig): GameState {
  const origin = originModifiers[config.origin] ?? originModifiers["Lagos Politician"];
  const eraStart = eraStartDates[config.era] ?? eraStartDates["2023"];
  const vicePresident = createVicePresidentState(config.vpName);
  // Compute seed for constitutional officer selection
  let officerSeed = 0;
  for (const ch of config.party + config.stateOfOrigin + (config.vpState || "Lagos")) {
    officerSeed = ((officerSeed << 5) - officerSeed + ch.charCodeAt(0)) | 0;
  }
  const constitutionalOfficers = selectConstitutionalOfficers(
    config.stateOfOrigin,
    config.vpState || "Lagos",
    Math.abs(officerSeed) || 1,
  );
  const baseApproval = Math.round(43 + origin.approval);
  const macroEconomy = createMacroEconomyState(config.era, config.origin);
  let state: GameState = {
    day: eraStart.day,
    date: eraStart.date,
    phase: "playing",
    approval: baseApproval,
    treasury: +(1.1 + origin.treasury).toFixed(2),
    politicalCapital: Math.round(60 + origin.politicalCapital),
    stability: Math.round(47 + origin.stability),
    presidentName: config.presidentName || `${config.firstName} ${config.lastName}`,
    presidentOrigin: config.origin || config.stateOfOrigin,
    presidentTraits: config.traits,
    stress: 25 + origin.stress,
    presidentAge: config.age,
    presidentGender: config.gender,
    presidentState: config.stateOfOrigin,
    presidentEducation: config.education,
    presidentTitle: config.title || "",
    presidentEthnicity: config.ethnicity || "",
    presidentReligion: config.religion || "",
    presidentOccupation: config.occupation || "",
    presidentParty: config.party,
    partyLoyalty: 70,
    politicalState: { partyLoyalty: 70 },
    presidentEra: config.era,
    vicePresident,
    constitutionalOfficers,
    personalAssistant: config.personalAssistant,
    campaignPromises: createCampaignPromises(config.promises),
    appointments: createAppointments(config.appointments),
    term: createTermState(config.era),
    health: 85,
    healthCrisis: createHealthCrisisState(),
    macroEconomy,
    macroHistory: createMacroHistory(eraStart.day, macroEconomy),
    cabalMeeting: null,
    characters: buildCharacterMap(vicePresident),
    factions: buildFactionMap(),
    activeChains: [],
    activeEvents: getOpeningEvents(eraStart.day),
    pendingConsequences: [],
    victoryProgress: {},
    failureRisks: {},
    outrage: 42,
    trust: 38,
    activeCases: defaultCases.map((courtCase) => ({ ...courtCase })),
    judicialIndependence: 65,
    governors: defaultGovernors.map((governor) => ({ ...governor, relationship: relationshipFromLoyalty(governor.loyalty) })),
    turnLog: [],
    inboxMessages: cloneInboxMessages(undefined, eraStart.date),
    headlines: [...initialHeadlines],
    dailySummary: {
      day: eraStart.day,
      date: eraStart.date,
      headline: "The presidency opens under immediate pressure from security, markets, and party management.",
      items: [
        "Three cabinet-level decisions are already waiting in the Office tab.",
        `Your coalition starts in the ${governingPhaseFromTerm(1, createTermState(config.era).daysUntilElection).replace(/-/g, " ")} phase with ${createTermState(config.era).daysUntilElection} days to the next election.`,
      ],
      pendingCritical: 1,
    },
    approvalHistory: [{ day: eraStart.day, approval: baseApproval }],
    legacyMilestones: [],
    lastActionAtDay: {},
    policyLevers: eraPolicyPresets[config.era],
    cabinetAppointments: Object.fromEntries(ministryPositions.map((p) => [p, null])),
    legislature: {
      ...defaultLegislativeState(),
      legislativeCalendar: seedLegislativeCalendar(),
    },
  };

  state = syncStrategicState(state);
  state = { ...state, cabalMeeting: createDailyCabalMeeting(state) };
  return withDerivedState(state);
}

export type GameAction =
  | { type: "START_CAMPAIGN"; config: CampaignConfig }
  | { type: "END_DAY" }
  | { type: "RESOLVE_EVENT"; eventId: string; choiceIndex: number }
  | { type: "RESOLVE_CHAIN_CHOICE"; chainId: string; choiceIndex: number }
  | { type: "RESOLVE_CABAL_CHOICE"; choiceIndex: number }
  | { type: "EXECUTE_QUICK_ACTION"; actionId: string }
  | { type: "MARK_MESSAGE_READ"; messageId: string }
  | { type: "HANDLE_INBOX_ACTION"; messageId: string; actionId: string }
  | { type: "START_HOOK_INVESTIGATION"; ownerName: string; hookId: string }
  | { type: "USE_HOOK"; ownerName: string; hookId: string }
  | { type: "LOAD_STATE"; state: GameState }
  | { type: "RESET" }
  | { type: "GO_TO_SETUP" }
  | { type: "PROPOSE_POLICY_CHANGE"; lever: PolicyLeverKey; newPosition: AnyPolicyPosition }
  | { type: "SIGN_BILL"; billId: string }
  | { type: "VETO_BILL"; billId: string }
  | { type: "RESOLVE_CRISIS"; billId: string; leverIds: string[] };

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_CAMPAIGN":
      return initializeGameState(action.config);
    case "END_DAY":
      return state.phase !== "playing" ? state : withDerivedState(processTurn(state));
    case "RESOLVE_EVENT":
      return withDerivedState(resolveActiveEventChoice(state, action.eventId, action.choiceIndex));
    case "RESOLVE_CHAIN_CHOICE":
      return withDerivedState(resolveChainChoice(state, action.chainId, action.choiceIndex));
    case "RESOLVE_CABAL_CHOICE":
      return withDerivedState(resolveCabalChoice(state, action.choiceIndex));
    case "EXECUTE_QUICK_ACTION":
      return withDerivedState(executeQuickAction(state, action.actionId));
    case "MARK_MESSAGE_READ":
      return withDerivedState(markInboxMessageRead(state, action.messageId));
    case "HANDLE_INBOX_ACTION":
      return withDerivedState(handleInboxAction(state, action.messageId, action.actionId));
    case "START_HOOK_INVESTIGATION":
      return withDerivedState(startHookInvestigation(state, action.ownerName, action.hookId));
    case "USE_HOOK":
      return withDerivedState(useHook(state, action.ownerName, action.hookId));
    case "LOAD_STATE":
      return withDerivedState(hydrateLoadedGameState(action.state));
    case "RESET":
      return defaultGameState;
    case "GO_TO_SETUP":
      return { ...state, phase: "setup" };
    case "PROPOSE_POLICY_CHANGE": {
      const { lever, newPosition } = action;
      const s = { ...state };
      s.policyLevers = { ...s.policyLevers };
      s.policyLevers[lever] = { ...s.policyLevers[lever], pendingPosition: newPosition };
      const confirmEvent = generatePolicyConfirmationEvent(lever, s.policyLevers[lever].position, newPosition, s);
      s.activeEvents = [...s.activeEvents, confirmEvent];
      s.turnLog = [...s.turnLog, {
        day: s.day, date: s.date, event: `Policy proposal: ${lever}`,
        effects: [`Proposed changing ${lever} to ${newPosition}`],
        category: "decision" as const,
      }];
      return s;
    }
    case "SIGN_BILL":
      return withDerivedState(signBill(state, action.billId));
    case "VETO_BILL":
      return withDerivedState(vetoBill(state, action.billId));
    case "RESOLVE_CRISIS":
      return withDerivedState(resolveLegislativeCrisis(state, action.billId, action.leverIds));
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  endDay: () => void;
  startCampaign: (config: CampaignConfig) => void;
  resetGame: () => void;
  goToSetup: () => void;
  resolveEventChoice: (eventId: string, choiceIndex: number) => void;
  resolveChainChoice: (chainId: string, choiceIndex: number) => void;
  resolveCabalChoice: (choiceIndex: number) => void;
  executeQuickAction: (actionId: string) => void;
  markMessageRead: (messageId: string) => void;
  handleInboxAction: (messageId: string, actionId: string) => void;
  startHookInvestigation: (ownerName: string, hookId: string) => void;
  useHook: (ownerName: string, hookId: string) => void;
  loadGameState: (state: GameState) => void;
  canResolveChoice: (requirements?: Array<{ metric: string; min?: number; max?: number }>) => boolean;
  proposePolicyChange: (lever: PolicyLeverKey, newPosition: AnyPolicyPosition) => void;
  signBill: (billId: string) => void;
  vetoBill: (billId: string) => void;
  resolveCrisis: (billId: string, leverIds: string[]) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, defaultGameState);

  const value: GameContextValue = {
    state,
    dispatch,
    endDay: () => dispatch({ type: "END_DAY" }),
    startCampaign: (config) => dispatch({ type: "START_CAMPAIGN", config }),
    resetGame: () => dispatch({ type: "RESET" }),
    goToSetup: () => dispatch({ type: "GO_TO_SETUP" }),
    resolveEventChoice: (eventId, choiceIndex) => dispatch({ type: "RESOLVE_EVENT", eventId, choiceIndex }),
    resolveChainChoice: (chainId, choiceIndex) => dispatch({ type: "RESOLVE_CHAIN_CHOICE", chainId, choiceIndex }),
    resolveCabalChoice: (choiceIndex) => dispatch({ type: "RESOLVE_CABAL_CHOICE", choiceIndex }),
    executeQuickAction: (actionId) => dispatch({ type: "EXECUTE_QUICK_ACTION", actionId }),
    markMessageRead: (messageId) => dispatch({ type: "MARK_MESSAGE_READ", messageId }),
    handleInboxAction: (messageId, actionId) => dispatch({ type: "HANDLE_INBOX_ACTION", messageId, actionId }),
    startHookInvestigation: (ownerName, hookId) => dispatch({ type: "START_HOOK_INVESTIGATION", ownerName, hookId }),
    useHook: (ownerName, hookId) => dispatch({ type: "USE_HOOK", ownerName, hookId }),
    loadGameState: (loadedState) => dispatch({ type: "LOAD_STATE", state: loadedState }),
    canResolveChoice: (requirements) => requirementsMet(state, requirements),
    proposePolicyChange: (lever, newPosition) => dispatch({ type: "PROPOSE_POLICY_CHANGE", lever, newPosition }),
    signBill: (billId) => dispatch({ type: "SIGN_BILL", billId }),
    vetoBill: (billId) => dispatch({ type: "VETO_BILL", billId }),
    resolveCrisis: (billId, leverIds) => dispatch({ type: "RESOLVE_CRISIS", billId, leverIds }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
}
