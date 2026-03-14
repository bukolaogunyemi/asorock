// client/src/lib/godfatherEngine.ts
import type { GameState } from "./gameTypes";
import type {
  Godfather,
  GodfatherDeal,
  PatronageState,
} from "./godfatherTypes";
import { generateDealProposal } from "./godfatherDeals";
import { GODFATHER_PROFILES } from "./godfatherProfiles";

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
