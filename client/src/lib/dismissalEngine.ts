// client/src/lib/dismissalEngine.ts
// Unified dismissal engine for all appointable system types.
// Pure function: processDismissal(state, systemType, positionId, reason?) → DismissalResult

import type {
  GameState,
  ActiveEvent,
  Consequence,
  GameInboxMessage,
} from "./gameTypes";

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

  // 1. Remove from cabinetAppointments
  const updatedAppointments = { ...state.cabinetAppointments, [positionId]: null };

  // 2. Remove from ministerStatuses
  const updatedStatuses = { ...state.ministerStatuses };
  delete updatedStatuses[characterName];

  // 3. Generate consequences: -3 approval, -2 stability
  const consequence = makeConsequence(
    "dismissal-minister",
    [
      { target: "approval", value: -3 },
      { target: "stability", value: -2 },
    ],
    `Dismissal of ${characterName} from ${positionId} portfolio`,
  );

  // 4. Create inbox message
  const portfolioTitle = positionId.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const inboxMsg = makeInboxMessage(characterName, `Minister of ${portfolioTitle}`, state.day, state.date);

  // 5. Generate vacancy event (cabinet-appointment source)
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

  // 6. Lifecycle exit
  const lifecycleExit = { characterName, exitReason: "fired" as const };

  return {
    updatedState: {
      cabinetAppointments: updatedAppointments,
      ministerStatuses: updatedStatuses,
    },
    events: [vacancyEvent],
    consequences: [consequence],
    inboxMessages: [inboxMsg],
    lifecycleExit,
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
  switch (systemType) {
    case "minister":
      return processMinisterDismissal(state, positionId, reason);
    default:
      return emptyResult();
  }
}
