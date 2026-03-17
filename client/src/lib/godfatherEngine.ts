// client/src/lib/godfatherEngine.ts
import type { GameState, ActiveEvent } from "./gameTypes";
import type {
  Godfather,
  GodfatherArchetype,
  GodfatherDeal,
  PatronageState,
} from "./godfatherTypes";
import type { GameStateModifier } from "./legislativeTypes";
import { generateDealProposal } from "./godfatherDeals";
import { GODFATHER_PROFILES } from "./godfatherProfiles";
import { selectBusinessOligarchs } from "./businessOligarchEngine";


// ── PatronageEffects ─────────────────────────────────────────────────

export interface PatronageEffects {
  tier: "clean" | "pragmatic" | "compromised" | "captured";
  approvalCeiling?: number;
  scandalRisk: number;       // 0-1 probability per turn of a scandal event
  stabilityPenalty: number;  // negative modifier to stability per turn
  description: string;
}

export function getPatronageEffects(index: number): PatronageEffects {
  if (index <= 20) {
    return {
      tier: "clean",
      scandalRisk: 0,
      stabilityPenalty: 0,
      description: "Your administration is free from patronage obligations.",
    };
  }
  if (index <= 45) {
    return {
      tier: "pragmatic",
      scandalRisk: 0.05,
      stabilityPenalty: 0,
      description: "Minor patronage deals are in play. Small scandal risk.",
    };
  }
  if (index <= 70) {
    return {
      tier: "compromised",
      approvalCeiling: 60,
      scandalRisk: 0.15,
      stabilityPenalty: -1,
      description: "Significant patronage obligations limit your approval and threaten stability.",
    };
  }
  return {
    tier: "captured",
    approvalCeiling: 50,
    scandalRisk: 0.30,
    stabilityPenalty: -2,
    description: "Your presidency is captured by patronage networks. Severe scandal risk and instability.",
  };
}

// ── Constants ────────────────────────────────────────────────────────

const DEFAULT_COOLDOWN_DAYS = 30;
const TRIGGER_COOLDOWN_DAYS = 15;

// ── advanceEscalation ────────────────────────────────────────────────

/**
 * Moves a godfather's escalation stage up by 1, capping at 4.
 * Stage 4 represents nuclear event territory.
 */
export function advanceEscalation(godfather: Godfather): Godfather {
  const newStage = Math.min(4, godfather.escalationStage + 1) as 0 | 1 | 2 | 3 | 4;
  return {
    ...godfather,
    escalationStage: newStage,
  };
}

// ── checkTriggerWindows ──────────────────────────────────────────────

/**
 * Scans the current game state for active trigger windows that affect
 * godfather approach frequency and behaviour.
 */
export function checkTriggerWindows(state: GameState): string[] {
  const triggers: string[] = [];

  // Budget season: economy bill with critical stakes is active
  const hasCriticalEconomyBill = state.legislature.activeBills.some(
    (bill) => bill.subjectTag === "economy" && bill.stakes === "critical",
  );
  if (hasCriticalEconomyBill) {
    triggers.push("budget-season");
  }

  // Election approach: late in the term
  if (state.day > 900) {
    triggers.push("election-approach");
  }

  // Low approval
  if (state.approval < 35) {
    triggers.push("low-approval");
  }

  // Low stability
  if (state.stability < 30) {
    triggers.push("low-stability");
  }

  // Impeachment threat: both approval and stability critically low
  if (state.approval < 20 && state.stability < 25) {
    triggers.push("impeachment-threat");
  }

  return triggers;
}

// ── processGodfatherTurn ─────────────────────────────────────────────

/**
 * Pick a deal context based on active trigger windows and game state.
 */
function pickDealContext(triggers: string[]): string {
  if (triggers.includes("budget-season")) return "legislative-support";
  if (triggers.includes("impeachment-threat")) return "street-protest";
  if (triggers.includes("low-stability")) return "security-crisis";
  if (triggers.includes("election-approach")) return "campaign-funding";
  if (triggers.includes("low-approval")) return "media-coverage";
  return "legislative-support";
}

/**
 * Main per-turn processing function for the godfather/patronage system.
 * Checks cooldowns, generates approaches, and applies stable effects.
 */
export function processGodfatherTurn(
  state: GameState,
  patronageState: PatronageState,
): { patronageState: PatronageState; approaches: GodfatherDeal[]; events: any[] } {
  const triggers = checkTriggerWindows(state);
  const cooldownThreshold = triggers.length > 0 ? TRIGGER_COOLDOWN_DAYS : DEFAULT_COOLDOWN_DAYS;
  const context = pickDealContext(triggers);

  const approaches: GodfatherDeal[] = [];
  const events: any[] = [];
  const updatedCooldowns = { ...patronageState.approachCooldowns };

  for (const godfather of patronageState.godfathers) {
    // Skip neutralized godfathers
    if (godfather.neutralized) continue;

    // Check cooldown
    const lastApproach = updatedCooldowns[godfather.id] ?? 0;
    const daysSinceLastApproach = state.day - lastApproach;

    if (daysSinceLastApproach >= cooldownThreshold) {
      // Generate approach
      const deal = generateDealProposal(godfather, context);
      approaches.push(deal);
      updatedCooldowns[godfather.id] = state.day;
    }

    // Apply hostile godfather stable effects
    if (godfather.disposition === "hostile" && !godfather.neutralized) {
      for (const connection of godfather.stable.connections) {
        if (connection.effect.length > 0) {
          events.push({
            type: "hostile-stable-effect",
            godfatherId: godfather.id,
            godfatherName: godfather.name,
            connection: connection.description,
            effects: connection.effect,
          });
        }
      }
    }
  }

  // NOTE: Ally amplification (processAllyAmplification) removed — replaced by
  // processCoalitionPressure in affinityRegistry.ts, which uses NPCLink
  // strength-weighted probabilities (40%/25%/10% for strength 3/2/1).

  return {
    patronageState: {
      ...patronageState,
      approachCooldowns: updatedCooldowns,
    },
    approaches,
    events,
  };
}

// ── neutralizeGodfather ──────────────────────────────────────────────

/**
 * Neutralize a godfather through intelligence, political means, or
 * pitting godfathers against each other. Sets neutralized flag, adds
 * to the neutralized list, and reduces patronageIndex.
 */
export function neutralizeGodfather(
  patronageState: PatronageState,
  godfatherId: string,
  _method: "intelligence" | "political" | "godfather-vs-godfather",
): PatronageState {
  const godfathers = patronageState.godfathers.map((gf) => {
    if (gf.id !== godfatherId) return gf;
    return { ...gf, neutralized: true };
  });

  return {
    ...patronageState,
    godfathers,
    neutralizedGodfathers: [...patronageState.neutralizedGodfathers, godfatherId],
    patronageIndex: Math.max(0, patronageState.patronageIndex - 10),
  };
}

// ── defaultPatronageState ────────────────────────────────────────────

/**
 * Creates the initial PatronageState with all godfather profiles loaded.
 */
export function defaultPatronageState(): PatronageState {
  return {
    godfathers: GODFATHER_PROFILES.map((gf) => ({ ...gf })),
    patronageIndex: 0,
    activeDeals: 0,
    neutralizedGodfathers: [],
    approachCooldowns: {},
  };
}

/**
 * Creates a seeded PatronageState that replaces the 5 hardcoded business-oligarch
 * godfathers with 20 selected from the 100-candidate pool.
 * Non-business godfathers (19) are kept as-is.
 */
export function seededPatronageState(seed: number): PatronageState {
  const nonBusiness = GODFATHER_PROFILES.filter(
    gf => gf.archetype !== "business-oligarch",
  );
  const businessOligarchs = selectBusinessOligarchs(seed, 20);
  return {
    godfathers: [...nonBusiness, ...businessOligarchs].map(gf => ({ ...gf })),
    patronageIndex: 0,
    activeDeals: 0,
    neutralizedGodfathers: [],
    approachCooldowns: {},
  };
}

// ── getGodfatherVoteModifier ─────────────────────────────────────────

const DISPOSITION_MULTIPLIER: Record<Godfather["disposition"], number> = {
  friendly: 1,
  neutral: 0,
  cold: -0.5,
  hostile: -1,
};

/**
 * Returns the vote modifier a godfather applies to a legislative bill
 * based on their disposition, legislative bloc size, and interest match.
 */
export function getGodfatherVoteModifier(
  godfather: Godfather,
  billSubjectTag: string,
): { house: number; senate: number } {
  if (godfather.neutralized) {
    return { house: 0, senate: 0 };
  }

  const multiplier = DISPOSITION_MULTIPLIER[godfather.disposition];
  if (multiplier === 0) {
    return { house: 0, senate: 0 };
  }

  const interestMatch = godfather.interests.some(
    (interest) => interest.toLowerCase().includes(billSubjectTag.toLowerCase()),
  );
  const interestMultiplier = interestMatch ? 1.5 : 1;

  const { house, senate } = godfather.stable.legislativeBloc;

  return {
    house: Math.round(house * multiplier * interestMultiplier),
    senate: Math.round(senate * multiplier * interestMultiplier),
  };
}

// ── generateNuclearEvent ─────────────────────────────────────────────

interface NuclearEventTemplate {
  type: string;
  title: string;
  description: string;
  effects: GameStateModifier[];
}

const NUCLEAR_EVENTS: Record<GodfatherArchetype, (gf: Godfather) => NuclearEventTemplate> = {
  "business-oligarch": (gf) => ({
    type: "capital-flight",
    title: "Capital Flight Crisis",
    description: `${gf.name} has orchestrated a massive capital flight. Foreign investors are pulling out and the naira is in freefall as confidence in the economy collapses.`,
    effects: [
      { target: "stability", delta: -15 },
      { target: "macroEconomy", delta: -20 },
    ],
  }),
  "military-elder": (gf) => ({
    type: "coup-signals",
    title: "Coup Signals Detected",
    description: `${gf.name}'s network within the military establishment is sending unmistakable signals of discontent. Troop movements have been reported near Abuja.`,
    effects: [
      { target: "stability", delta: -20 },
      { target: "trust", delta: -15 },
    ],
  }),
  "party-boss": (gf) => ({
    type: "party-split",
    title: "Ruling Party Split",
    description: `${gf.name} has led a faction out of the ruling party, taking key legislators and governors. The party's legislative majority is in jeopardy.`,
    effects: [
      { target: "partyLoyalty", delta: -25 },
      { target: "politicalCapital", delta: -15 },
    ],
  }),
  "labour-civil": (gf) => ({
    type: "general-strike",
    title: "Nationwide General Strike",
    description: `${gf.name} has called a general strike. Markets, schools, and transport are shut down across the country as workers demand the president's resignation.`,
    effects: [
      { target: "approval", delta: -15 },
      { target: "stability", delta: -10 },
      { target: "outrage", delta: 20 },
    ],
  }),
  "religious-leader": (gf) => ({
    type: "sectarian-crisis",
    title: "Sectarian Crisis Erupts",
    description: `${gf.name} has inflamed sectarian tensions, leading to communal violence in multiple states. The president is blamed for failing to maintain order.`,
    effects: [
      { target: "stability", delta: -15 },
      { target: "trust", delta: -10 },
      { target: "outrage", delta: 15 },
    ],
  }),
  "regional-strongman": (gf) => ({
    type: "secession-threat",
    title: "Secession Threat",
    description: `${gf.name} has rallied regional governors and legislators behind a secession ultimatum. The territorial integrity of the nation is at stake.`,
    effects: [
      { target: "stability", delta: -20 },
      { target: "approval", delta: -10 },
    ],
  }),
  "media-mogul": (gf) => ({
    type: "media-war",
    title: "Total Media War",
    description: `${gf.name} has unleashed a coordinated media blitz across television, newspapers, and social media. The presidency's reputation is being systematically destroyed.`,
    effects: [
      { target: "approval", delta: -20 },
      { target: "trust", delta: -15 },
    ],
  }),
};

/**
 * Generates an archetype-specific nuclear crisis event when a godfather
 * reaches escalation stage 4.
 */
export function generateNuclearEvent(
  godfather: Godfather,
): { type: string; title: string; description: string; effects: GameStateModifier[] } {
  const templateFn = NUCLEAR_EVENTS[godfather.archetype];
  return templateFn(godfather);
}

// ── Appointment Watch ────────────────────────────────────────────────

/**
 * Helper: does this godfather have an interest in the given position?
 */
function godfatherHasInterest(gf: Godfather, positionId: string): boolean {
  if (gf.stable.cabinetCandidates.includes(positionId)) return true;
  if (gf.stable.militaryInterests?.includes(positionId)) return true;
  if (gf.stable.diplomaticInterests?.includes(positionId)) return true;
  if (gf.stable.directorInterests?.includes(positionId)) return true;
  return false;
}

/**
 * Checks if any godfather cares about a position that was just filled.
 * If the appointee's zone matches the godfather's zone → reduce favourDebt by 1.
 * If the zones mismatch and the godfather has active escalation → escalation +1.
 * Returns partial state updates to merge into game state.
 */
export function checkGodfatherAppointment(
  state: GameState,
  positionId: string,
  appointeeZone: string,
): { patronage?: PatronageState } {
  if (!state.patronage?.godfathers?.length) return {};

  let changed = false;
  const updatedGodfathers = state.patronage.godfathers.map(gf => {
    if (gf.neutralized) return gf;
    if (!godfatherHasInterest(gf, positionId)) return gf;

    if (appointeeZone === gf.zone) {
      // Zone match — reduce favour debt
      changed = true;
      return {
        ...gf,
        favourDebt: Math.max(0, gf.favourDebt - 1),
      };
    } else if (gf.escalationStage > 0) {
      // Zone mismatch + active escalation — escalation +1
      changed = true;
      return {
        ...gf,
        escalationStage: Math.min(4, gf.escalationStage + 1) as 0 | 1 | 2 | 3 | 4,
      };
    }

    return gf;
  });

  if (!changed) return {};

  return {
    patronage: {
      ...state.patronage,
      godfathers: updatedGodfathers,
    },
  };
}

// ── Dismissal Reaction ──────────────────────────────────────────────

let godfatherEventCounter = 0;
function nextGodfatherEventId(): string {
  return `evt-gf-pressure-${Date.now()}-${++godfatherEventCounter}`;
}

const DISPOSITION_PRESSURE_THRESHOLD: Godfather["disposition"][] = [
  "hostile",
  "cold",
  "neutral",
];

/**
 * Checks if any godfather reacts to a dismissal.
 * If a godfather has interest in the dismissed position and their
 * disposition is ≤ Neutral (hostile, cold, or neutral), generates a
 * pressure event with Consult/Ignore choices.
 * Deterministic — no RNG.
 */
export function checkGodfatherDismissal(
  state: GameState,
  positionId: string,
): ActiveEvent[] {
  if (!state.patronage?.godfathers?.length) return [];

  const events: ActiveEvent[] = [];

  for (const gf of state.patronage.godfathers) {
    if (gf.neutralized) continue;
    if (!godfatherHasInterest(gf, positionId)) continue;
    if (!DISPOSITION_PRESSURE_THRESHOLD.includes(gf.disposition)) continue;

    const event: ActiveEvent = {
      id: nextGodfatherEventId(),
      title: `${gf.name} Demands Consultation`,
      severity: "warning",
      description: `${gf.name} is displeased with the removal from ${positionId}. He demands consultation on the replacement.`,
      category: "politics",
      source: "godfather-pressure",
      choices: [
        {
          id: `${gf.id}-consult`,
          label: "Consult",
          context: `Consult with ${gf.name} on a replacement. Costs 1 political capital but reduces tension.`,
          consequences: [
            {
              id: `csq-gf-consult-${gf.id}`,
              sourceEvent: `godfather-dismissal-reaction-${gf.id}`,
              description: `Consulted ${gf.name} on replacement`,
              effects: [{ target: "politicalCapital" as any, value: -1 }],
              delayDays: 0,
            },
          ],
        },
        {
          id: `${gf.id}-ignore`,
          label: "Ignore",
          context: `Ignore ${gf.name}'s demands. This will increase his escalation.`,
          consequences: [
            {
              id: `csq-gf-ignore-${gf.id}`,
              sourceEvent: `godfather-dismissal-reaction-${gf.id}`,
              description: `Ignored ${gf.name}'s demand for consultation — escalation increased`,
              effects: [],
              delayDays: 0,
            },
          ],
        },
      ],
      createdDay: state.day,
    };

    events.push(event);
  }

  return events;
}

// ── Ally Amplification (Interim) ────────────────────────────────────
// INTERIM: replaced by affinityRegistry coalition pressure in Chunk 5

/**
 * For each godfather at escalation stage 3+, iterate their traditional
 * ruler and religious leader allies. 40% chance per ally (via rng) to
 * generate a sympathy inbox event.
 */
export function processAllyAmplification(
  state: GameState,
  rng: () => number,
): { events: any[] } {
  if (!state.patronage?.godfathers?.length) return { events: [] };

  const events: any[] = [];

  for (const gf of state.patronage.godfathers) {
    if (gf.neutralized) continue;
    if (gf.escalationStage < 3) continue;

    const allies = [
      ...(gf.stable.traditionalRulerAllies ?? []),
      ...(gf.stable.religiousLeaderAllies ?? []),
    ];

    for (const allyId of allies) {
      // INTERIM: replaced by affinityRegistry coalition pressure in Chunk 5
      if (rng() < 0.4) {
        events.push({
          type: "ally-sympathy",
          godfatherId: gf.id,
          godfatherName: gf.name,
          allyId,
          message: `${allyId} has expressed public support for ${gf.name}'s position, adding political pressure on the presidency.`,
        });
      }
    }
  }

  return { events };
}
