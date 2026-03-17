// client/src/lib/dismissalEngine.ts
// Unified dismissal engine for all appointable system types.
// Pure function: processDismissal(state, systemType, positionId, reason?) → DismissalResult

import type {
  GameState,
  ActiveEvent,
  Consequence,
  GameInboxMessage,
} from "./gameTypes";
import type { DirectorSystemState } from "./directorTypes";
import type { DiplomatSystemState, AmbassadorAppointment } from "./diplomatTypes";
import type { MilitarySystemState } from "./militaryTypes";
import type { PatronageState, Godfather } from "./godfatherTypes";
import { ALL_DIPLOMAT_POSTS } from "./diplomatPosts";
import { cabinetCandidates } from "./handcraftedCharacters";
import { checkGodfatherDismissal } from "./godfatherEngine";

// ══════════════════════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════════════════════

export type DismissableSystem = "minister" | "director" | "diplomat" | "military" | "aide";

export interface DismissalResult {
  updatedState: Partial<GameState>;
  events: ActiveEvent[];
  consequences: Consequence[];
  inboxMessages: GameInboxMessage[];
  lifecycleExit: { characterName: string; exitReason: "fired" } | null;
}

// ══════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════

let dismissalCounter = 0;
function nextId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++dismissalCounter}`;
}

function emptyResult(): DismissalResult {
  return {
    updatedState: {},
    events: [],
    consequences: [],
    inboxMessages: [],
    lifecycleExit: null,
  };
}

function makeConsequence(
  sourceEvent: string,
  effects: { target: string; value: number }[],
  description: string,
): Consequence {
  return {
    id: nextId("csq-dismissal"),
    sourceEvent,
    delayDays: 0,
    effects: effects.map(e => ({ ...e } as any)),
    description,
  };
}

function makeInboxMessage(
  characterName: string,
  positionTitle: string,
  day: number,
  date: string,
): GameInboxMessage {
  return {
    id: nextId("inbox-dismissal"),
    sender: "Chief of Staff",
    role: "Chief of Staff",
    initials: "CS",
    subject: `${characterName} has been relieved of duties as ${positionTitle}`,
    preview: `${characterName} has been dismissed from the position of ${positionTitle}.`,
    fullText: `Your Excellency,\n\nAs directed, ${characterName} has been officially relieved of duties as ${positionTitle}. The position is now vacant and requires a replacement appointment.`,
    day,
    date,
    priority: "normal",
    read: false,
    source: "system",
  };
}

function titleCase(str: string): string {
  return str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ══════════════════════════════════════════════════════════════
// Faction penalty (Task 3)
// ══════════════════════════════════════════════════════════════

function applyFactionPenalty(
  state: GameState,
  characterName: string,
  result: DismissalResult,
): void {
  const character = state.characters[characterName];
  if (!character) return;

  const factionName = character.faction;
  if (!factionName || !state.factions[factionName]) return;

  const updatedFactions = result.updatedState.factions
    ? { ...result.updatedState.factions }
    : { ...state.factions };

  const faction = updatedFactions[factionName];
  updatedFactions[factionName] = {
    ...faction,
    loyalty: Math.max(0, faction.loyalty - 5),
  };

  result.updatedState.factions = updatedFactions;
}

// ══════════════════════════════════════════════════════════════
// Godfather escalation (Task 3)
// ══════════════════════════════════════════════════════════════

function applyGodfatherEscalation(
  state: GameState,
  systemType: DismissableSystem,
  positionId: string,
  result: DismissalResult,
): void {
  if (!state.patronage?.godfathers?.length) return;

  let anyEscalated = false;
  const updatedGodfathers: Godfather[] = state.patronage.godfathers.map(gf => {
    let hasInterest = false;

    if (systemType === "minister") {
      hasInterest = gf.stable.cabinetCandidates.includes(positionId);
    }
    if (systemType === "military" && gf.stable.militaryInterests) {
      hasInterest = hasInterest || gf.stable.militaryInterests.includes(positionId);
    }
    if (systemType === "diplomat" && gf.stable.diplomaticInterests) {
      hasInterest = hasInterest || gf.stable.diplomaticInterests.includes(positionId);
    }
    if (systemType === "director" && gf.stable.directorInterests) {
      hasInterest = hasInterest || gf.stable.directorInterests.includes(positionId);
    }

    if (hasInterest && gf.escalationStage < 4) {
      anyEscalated = true;
      return {
        ...gf,
        escalationStage: Math.min(4, gf.escalationStage + 1) as 0 | 1 | 2 | 3 | 4,
      };
    }
    return gf;
  });

  if (anyEscalated) {
    result.updatedState.patronage = {
      ...state.patronage,
      godfathers: updatedGodfathers,
    };
  } else {
    // Still include patronage so it's present in updatedState (unchanged)
    result.updatedState.patronage = {
      ...state.patronage,
      godfathers: updatedGodfathers,
    };
  }
}

// ══════════════════════════════════════════════════════════════
// Minister dismissal
// ══════════════════════════════════════════════════════════════

function processMinisterDismissal(
  state: GameState,
  positionId: string,
  _reason?: string,
): DismissalResult {
  const characterName = state.cabinetAppointments[positionId];
  if (!characterName) return emptyResult();

  const updatedAppointments = { ...state.cabinetAppointments, [positionId]: null };
  const updatedStatuses = { ...state.ministerStatuses };
  delete updatedStatuses[characterName];

  const consequence = makeConsequence(
    "dismissal-minister",
    [
      { target: "approval", value: -3 },
      { target: "stability", value: -2 },
    ],
    `Dismissal of ${characterName} from ${positionId} portfolio`,
  );

  const portfolioTitle = titleCase(positionId);
  const inboxMsg = makeInboxMessage(characterName, `Minister of ${portfolioTitle}`, state.day, state.date);

  const vacancyEvent: ActiveEvent = {
    id: nextId("evt-vacancy"),
    title: `Vacancy: Minister of ${portfolioTitle}`,
    severity: "medium",
    description: `The position of Minister of ${portfolioTitle} is now vacant following the dismissal of ${characterName}. A replacement must be appointed.`,
    category: "governance",
    source: "cabinet-appointment",
    choices: [],
    cabinetPortfolio: positionId,
    createdDay: state.day,
  };

  const result: DismissalResult = {
    updatedState: {
      cabinetAppointments: updatedAppointments,
      ministerStatuses: updatedStatuses,
    },
    events: [vacancyEvent],
    consequences: [consequence],
    inboxMessages: [inboxMsg],
    lifecycleExit: { characterName, exitReason: "fired" },
  };

  // Task 3: faction + godfather
  applyFactionPenalty(state, characterName, result);
  applyGodfatherEscalation(state, "minister", positionId, result);

  return result;
}

// ══════════════════════════════════════════════════════════════
// Director dismissal
// ══════════════════════════════════════════════════════════════

function processDirectorDismissal(
  state: GameState,
  positionId: string,
  _reason?: string,
): DismissalResult {
  const appointment = state.directors.appointments.find(a => a.positionId === positionId);
  if (!appointment || !appointment.characterName) return emptyResult();

  const characterName = appointment.characterName;

  // Update appointments array — set characterName to null
  const updatedAppointments = state.directors.appointments.map(a =>
    a.positionId === positionId
      ? { ...a, characterName: null }
      : a,
  );

  // Update vacancy tracking
  const updatedVacancyTracking = {
    ...state.directors.vacancyTracking,
    [positionId]: state.day,
  };

  const updatedDirectors: DirectorSystemState = {
    ...state.directors,
    appointments: updatedAppointments,
    vacancyTracking: updatedVacancyTracking,
    technocratsFired: state.directors.technocratsFired + 1,
  };

  const consequence = makeConsequence(
    "dismissal-director",
    [{ target: "approval", value: -1 }],
    `Dismissal of ${characterName} from ${positionId}`,
  );

  const posTitle = titleCase(positionId);
  const inboxMsg = makeInboxMessage(characterName, posTitle, state.day, state.date);

  const result: DismissalResult = {
    updatedState: { directors: updatedDirectors },
    events: [],
    consequences: [consequence],
    inboxMessages: [inboxMsg],
    lifecycleExit: { characterName, exitReason: "fired" },
  };

  applyFactionPenalty(state, characterName, result);
  applyGodfatherEscalation(state, "director", positionId, result);

  return result;
}

// ══════════════════════════════════════════════════════════════
// Diplomat dismissal
// ══════════════════════════════════════════════════════════════

function getDiplomatPostCategory(postId: string): string {
  const post = ALL_DIPLOMAT_POSTS.find(p => p.id === postId);
  return post?.category ?? "minor";
}

function processDiplomatDismissal(
  state: GameState,
  postId: string,
  _reason?: string,
): DismissalResult {
  const appointment = state.diplomats.appointments.find(a => a.postId === postId);
  if (!appointment || !appointment.characterName) return emptyResult();

  const characterName = appointment.characterName;

  const updatedAppointments: AmbassadorAppointment[] = state.diplomats.appointments.map(a =>
    a.postId === postId
      ? { ...a, characterName: null, vacantSinceDay: state.day }
      : a,
  );

  const updatedDiplomats: DiplomatSystemState = {
    ...state.diplomats,
    appointments: updatedAppointments,
  };

  // Consequence scale: bilateral/institution = -2, minor = -1
  const category = getDiplomatPostCategory(postId);
  const approvalPenalty = category === "minor" ? -1 : -2;

  const consequence = makeConsequence(
    "dismissal-diplomat",
    [{ target: "approval", value: approvalPenalty }],
    `Dismissal of ${characterName} from ${postId}`,
  );

  const post = ALL_DIPLOMAT_POSTS.find(p => p.id === postId);
  const posTitle = post?.title ?? titleCase(postId);
  const inboxMsg = makeInboxMessage(characterName, posTitle, state.day, state.date);

  const result: DismissalResult = {
    updatedState: { diplomats: updatedDiplomats },
    events: [],
    consequences: [consequence],
    inboxMessages: [inboxMsg],
    lifecycleExit: { characterName, exitReason: "fired" },
  };

  applyFactionPenalty(state, characterName, result);
  applyGodfatherEscalation(state, "diplomat", postId, result);

  return result;
}

// ══════════════════════════════════════════════════════════════
// Military dismissal
// ══════════════════════════════════════════════════════════════

function processMilitaryDismissal(
  state: GameState,
  positionId: string,
  _reason?: string,
): DismissalResult {
  const appointment = state.military.appointments.find(a => a.positionId === positionId);
  if (!appointment || !appointment.characterName) return emptyResult();

  const characterName = appointment.characterName;

  const updatedAppointments = state.military.appointments.map(a =>
    a.positionId === positionId
      ? { ...a, characterName: null }
      : a,
  );

  const updatedMilitary: MilitarySystemState = {
    ...state.military,
    appointments: updatedAppointments,
  };

  const consequence = makeConsequence(
    "dismissal-military",
    [
      { target: "approval", value: -4 },
      { target: "stability", value: -3 },
    ],
    `Dismissal of ${characterName} from ${positionId}`,
  );

  const posTitle = titleCase(positionId);
  const inboxMsg = makeInboxMessage(characterName, posTitle, state.day, state.date);

  const result: DismissalResult = {
    updatedState: { military: updatedMilitary },
    events: [],
    consequences: [consequence],
    inboxMessages: [inboxMsg],
    lifecycleExit: { characterName, exitReason: "fired" },
  };

  applyFactionPenalty(state, characterName, result);
  applyGodfatherEscalation(state, "military", positionId, result);

  return result;
}

// ══════════════════════════════════════════════════════════════
// Aide dismissal
// ══════════════════════════════════════════════════════════════

function processAideDismissal(
  state: GameState,
  positionId: string,
  _reason?: string,
): DismissalResult {
  const appointment = state.appointments.find(a => a.office === positionId);
  if (!appointment) return emptyResult();

  const characterName = appointment.appointee;

  // Remove from appointments array
  const updatedAppointments = state.appointments.filter(a => a.office !== positionId);

  const consequence = makeConsequence(
    "dismissal-aide",
    [{ target: "approval", value: -2 }],
    `Dismissal of ${characterName} from ${positionId}`,
  );

  const inboxMsg = makeInboxMessage(characterName, positionId, state.day, state.date);

  const result: DismissalResult = {
    updatedState: {
      appointments: updatedAppointments,
    },
    events: [],
    consequences: [consequence],
    inboxMessages: [inboxMsg],
    lifecycleExit: { characterName, exitReason: "fired" },
  };

  // For PA, also clear personalAssistant
  if (positionId === "Personal Assistant") {
    result.updatedState.personalAssistant = "";
  }

  applyFactionPenalty(state, characterName, result);
  applyGodfatherEscalation(state, "aide", positionId, result);

  return result;
}

// ══════════════════════════════════════════════════════════════
// Main entry point
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// Dismissal Preview (Task 4)
// ══════════════════════════════════════════════════════════════

export interface DismissalPreview {
  characterName: string;
  positionTitle: string;
  approvalCost: number;
  stabilityCost: number;
  affectedFactions: string[];
  interestedGodfathers: string[];
  replacementPoolAvailable: boolean;
}

/** Cost constants per system type: [approvalCost, stabilityCost] */
const DISMISSAL_COSTS: Record<DismissableSystem, [number, number]> = {
  minister:  [-3, -2],
  director:  [-1,  0],
  diplomat:  [-2,  0], // default for bilateral; minor overridden below
  military:  [-4, -3],
  aide:      [-2,  0],
};

function resolveCharacterName(
  state: GameState,
  systemType: DismissableSystem,
  positionId: string,
): string | null {
  switch (systemType) {
    case "minister":
      return state.cabinetAppointments[positionId] ?? null;
    case "director": {
      const appt = state.directors.appointments.find(a => a.positionId === positionId);
      return appt?.characterName ?? null;
    }
    case "diplomat": {
      const appt = state.diplomats.appointments.find(a => a.postId === positionId);
      return appt?.characterName ?? null;
    }
    case "military": {
      const appt = state.military.appointments.find(a => a.positionId === positionId);
      return appt?.characterName ?? null;
    }
    case "aide": {
      const appt = state.appointments.find(a => a.office === positionId);
      return appt?.appointee ?? null;
    }
    default:
      return null;
  }
}

function resolvePositionTitle(
  systemType: DismissableSystem,
  positionId: string,
): string {
  switch (systemType) {
    case "minister":
      return `Minister of ${titleCase(positionId)}`;
    case "diplomat": {
      const post = ALL_DIPLOMAT_POSTS.find(p => p.id === positionId);
      return post?.title ?? titleCase(positionId);
    }
    default:
      return titleCase(positionId);
  }
}

function checkReplacementPool(
  state: GameState,
  systemType: DismissableSystem,
  positionId: string,
): boolean {
  if (systemType !== "minister") return false;

  // cabinetCandidates keys are titleCase (e.g., "Finance")
  // cabinetAppointments keys are lowercase (e.g., "finance")
  const portfolioKey = titleCase(positionId);
  const candidates = (cabinetCandidates as Record<string, any[]>)[portfolioKey];
  if (!candidates || candidates.length === 0) return false;

  // Check if there are candidates not currently appointed to any position
  const currentlyAppointed = new Set(
    Object.values(state.cabinetAppointments).filter(Boolean) as string[],
  );

  return candidates.some((c: { name: string }) => !currentlyAppointed.has(c.name));
}

/**
 * Pure read-only preview of what a dismissal would cost.
 * Does NOT mutate state. Used by the confirmation UI.
 */
export function computeDismissalPreview(
  state: GameState,
  systemType: DismissableSystem,
  positionId: string,
): DismissalPreview {
  const characterName = resolveCharacterName(state, systemType, positionId);

  if (!characterName) {
    return {
      characterName: "",
      positionTitle: resolvePositionTitle(systemType, positionId),
      approvalCost: 0,
      stabilityCost: 0,
      affectedFactions: [],
      interestedGodfathers: [],
      replacementPoolAvailable: false,
    };
  }

  // Costs
  let [approvalCost, stabilityCost] = DISMISSAL_COSTS[systemType];

  // Diplomat minor posts get reduced approval penalty
  if (systemType === "diplomat") {
    const category = getDiplomatPostCategory(positionId);
    if (category === "minor") approvalCost = -1;
  }

  // Affected factions
  const affectedFactions: string[] = [];
  const character = state.characters[characterName];
  if (character?.faction) {
    affectedFactions.push(character.faction);
  }

  // Interested godfathers
  const interestedGodfathers: string[] = [];
  if (state.patronage?.godfathers?.length) {
    for (const gf of state.patronage.godfathers) {
      let hasInterest = false;
      if (systemType === "minister") {
        hasInterest = gf.stable.cabinetCandidates.includes(positionId);
      }
      if (systemType === "military" && gf.stable.militaryInterests) {
        hasInterest = hasInterest || gf.stable.militaryInterests.includes(positionId);
      }
      if (systemType === "diplomat" && gf.stable.diplomaticInterests) {
        hasInterest = hasInterest || gf.stable.diplomaticInterests.includes(positionId);
      }
      if (systemType === "director" && gf.stable.directorInterests) {
        hasInterest = hasInterest || gf.stable.directorInterests.includes(positionId);
      }
      if (hasInterest) {
        interestedGodfathers.push(gf.name);
      }
    }
  }

  // Replacement pool
  const replacementPoolAvailable = checkReplacementPool(state, systemType, positionId);

  return {
    characterName,
    positionTitle: resolvePositionTitle(systemType, positionId),
    approvalCost,
    stabilityCost,
    affectedFactions,
    interestedGodfathers,
    replacementPoolAvailable,
  };
}

// ══════════════════════════════════════════════════════════════
// Main entry point
// ══════════════════════════════════════════════════════════════

export function processDismissal(
  state: GameState,
  systemType: DismissableSystem,
  positionId: string,
  reason?: string,
): DismissalResult {
  let result: DismissalResult;
  switch (systemType) {
    case "minister":
      result = processMinisterDismissal(state, positionId, reason);
      break;
    case "director":
      result = processDirectorDismissal(state, positionId, reason);
      break;
    case "diplomat":
      result = processDiplomatDismissal(state, positionId, reason);
      break;
    case "military":
      result = processMilitaryDismissal(state, positionId, reason);
      break;
    case "aide":
      result = processAideDismissal(state, positionId, reason);
      break;
    default:
      return emptyResult();
  }

  // Godfather dismissal reaction — generates pressure events
  const godfatherEvents = checkGodfatherDismissal(state, positionId);
  if (godfatherEvents.length > 0) {
    result = {
      ...result,
      events: [...result.events, ...godfatherEvents],
    };
  }

  return result;
}
