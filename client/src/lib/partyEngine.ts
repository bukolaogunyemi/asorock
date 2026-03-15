// client/src/lib/partyEngine.ts
// Party internals engine: opposition strategy, defection mechanics, convention system

import type {
  OppositionStrategy,
  PartyState,
  AtRiskEntry,
  NWCMember,
  NWCPosition,
  ConventionRace,
  PartyInternalsState,
} from "./partyTypes";
import { PARTY_PROFILES, NWC_CHARACTERS } from "./partyProfiles";

// ── Task 3: Opposition Strategy ─────────────────────────────────────────

export function determineOppositionStrategy(context: {
  approval: number;
  stability: number;
  economicHealth: number;
}): OppositionStrategy {
  if (context.approval < 35) return "attack";
  if (context.economicHealth < 30) return "obstruct";
  if (context.approval >= 60 && context.stability >= 60) return "negotiate";
  return "obstruct";
}

export function reassessStrategy(
  currentDay: number,
  lastReassessmentDay: number,
  majorEvent?: boolean,
): boolean {
  if (majorEvent) return true;
  return currentDay - lastReassessmentDay >= 30;
}

export function applyOppositionEffects(strategy: OppositionStrategy): {
  billDelayChance: number;
  negativeEventChance: number;
  crossPartyBillChance: number;
} {
  switch (strategy) {
    case "obstruct":
      return { billDelayChance: 0.3, negativeEventChance: 0.1, crossPartyBillChance: 0.05 };
    case "attack":
      return { billDelayChance: 0.1, negativeEventChance: 0.25, crossPartyBillChance: 0 };
    case "negotiate":
      return { billDelayChance: 0.05, negativeEventChance: 0.05, crossPartyBillChance: 0.3 };
  }
}

// ── Task 4: Defection Mechanics ─────────────────────────────────────────

export function assessDefectionRisk(
  partyId: string,
  partyLoyalty: number,
  zone: string,
  seatCount: number,
  seatType: "house" | "senate",
): AtRiskEntry {
  const defectionProbability = Math.max(0, (50 - partyLoyalty) / 100);
  return {
    id: `at-risk-${partyId}-${zone}-${seatType}`,
    currentParty: partyId,
    zone,
    seatCount,
    seatType,
    partyLoyalty,
    defectionProbability,
  };
}

export function executeDefection(
  parties: PartyState[],
  defection: {
    fromParty: string;
    toParty: string;
    seatType: "house" | "senate";
    seatCount: number;
  },
): PartyState[] {
  return parties.map((p) => {
    if (p.id === defection.fromParty) {
      return {
        ...p,
        legislativeSeats: {
          ...p.legislativeSeats,
          [defection.seatType]: p.legislativeSeats[defection.seatType] - defection.seatCount,
        },
      };
    }
    if (p.id === defection.toParty) {
      return {
        ...p,
        legislativeSeats: {
          ...p.legislativeSeats,
          [defection.seatType]: p.legislativeSeats[defection.seatType] + defection.seatCount,
        },
      };
    }
    return p;
  });
}

export function initiatePoaching(
  fromParty: string,
  toParty: string,
  zone: string,
  seatType: "house" | "senate",
  seatCount: number,
  currentDay: number,
): { pcCost: number; cooldownUntilDay: number; successProbability: number } {
  const pcCost = seatCount * 3;
  const cooldownUntilDay = currentDay + 60;
  // Higher seat counts are harder to poach
  const successProbability = Math.max(0.1, Math.min(0.9, 1 - seatCount * 0.1));
  return { pcCost, cooldownUntilDay, successProbability };
}

export function checkPoachingCooldown(
  cooldowns: Record<string, number>,
  targetParty: string,
  zone: string,
  currentDay: number,
): boolean {
  const key = `${targetParty}:${zone}`;
  const cooldownEnd = cooldowns[key];
  if (cooldownEnd === undefined) return true;
  return currentDay >= cooldownEnd;
}

// ── Task 5: Convention System ───────────────────────────────────────────

const NWC_POSITIONS: NWCPosition[] = [
  "national-chairman",
  "vice-chairman",
  "national-secretary",
  "national-treasurer",
  "publicity-secretary",
  "organising-secretary",
  "legal-adviser",
  "youth-women-leader",
];

export function checkConventionTrigger(
  currentDay: number,
): "inactive" | "pre-convention" | "voting" | "post-convention" {
  if (currentDay >= 670 && currentDay < 730) return "pre-convention";
  if (currentDay >= 730 && currentDay < 760) return "voting";
  if (currentDay >= 760 && currentDay < 800) return "post-convention";
  return "inactive";
}

export function generateConventionRaces(
  partyId: string,
  nwcMembers: NWCMember[],
): ConventionRace[] {
  return NWC_POSITIONS.map((position) => {
    const incumbent = nwcMembers.find((m) => m.position === position);
    const candidates: { characterId: string; name: string; supportScore: number }[] = [];

    if (incumbent) {
      candidates.push({
        characterId: incumbent.characterId,
        name: incumbent.name,
        supportScore: incumbent.competence + incumbent.loyalty,
      });
    }

    // Generate 1-2 challengers
    const challengerCount = 1 + (incumbent ? Math.floor(incumbent.competence % 2) : 0);
    for (let i = 0; i < challengerCount; i++) {
      candidates.push({
        characterId: `challenger-${partyId}-${position}-${i}`,
        name: `Challenger ${i + 1} for ${position}`,
        supportScore: 40 + Math.floor((i + 1) * 15),
      });
    }

    return { position, candidates };
  });
}

export function resolveConventionVote(
  weights: {
    playerInfluence: number;
    factionSupport: number;
    godfatherBacking: number;
    incumbentAdvantage: number;
    candidateCompetence: number;
  },
  candidates: { characterId: string; name: string; supportScore: number }[],
): { winner: string; margin: number } {
  // Compute composite score for each candidate using weights
  const scored = candidates.map((c, i) => {
    const isIncumbent = i === 0 ? 1 : 0;
    const composite =
      c.supportScore * weights.candidateCompetence +
      isIncumbent * weights.incumbentAdvantage * 10 +
      weights.playerInfluence * 5 +
      weights.factionSupport * 5 +
      weights.godfatherBacking * 5;
    return { characterId: c.characterId, score: composite };
  });

  scored.sort((a, b) => b.score - a.score);
  const margin = scored.length > 1 ? scored[0].score - scored[1].score : scored[0].score;
  return { winner: scored[0].characterId, margin };
}

export function defaultPartyInternalsState(rulingPartyId: string): PartyInternalsState {
  const parties: PartyState[] = PARTY_PROFILES.map((profile) => {
    const nwc = NWC_CHARACTERS
      .filter((c) => c.partyId === profile.id)
      .map(({ partyId, ...member }) => member as NWCMember);

    return {
      id: profile.id,
      name: profile.name,
      abbreviation: profile.abbreviation,
      nwc,
      legislativeSeats: { ...profile.initialSeats },
      isRulingParty: profile.id === rulingPartyId,
      isMainOpposition: false,
    };
  });

  // Identify 2 main opposition parties (largest by total seats, excluding ruling)
  const nonRuling = parties
    .filter((p) => p.id !== rulingPartyId)
    .sort((a, b) => {
      const totalA = a.legislativeSeats.house + a.legislativeSeats.senate;
      const totalB = b.legislativeSeats.house + b.legislativeSeats.senate;
      return totalB - totalA;
    });

  const mainOppositionIds = nonRuling.slice(0, 2).map((p) => p.id);
  for (const p of parties) {
    if (mainOppositionIds.includes(p.id)) {
      p.isMainOpposition = true;
    }
  }

  return {
    parties,
    rulingPartyId,
    mainOppositionIds,
    defections: {
      atRiskLegislators: [],
      recentDefections: [],
      poachingCooldown: {},
    },
    convention: {
      phase: "inactive",
      conventionDay: 730,
      races: [],
      playerPCSpent: 0,
    },
    partyLoyaltyDrift: 0,
  };
}

export function processPartyTurn(
  state: PartyInternalsState,
  gameContext: { day: number; approval: number; stability: number; partyLoyalty: number },
): PartyInternalsState {
  let newState = { ...state, parties: [...state.parties] };

  // Reassess opposition strategy for main opposition parties
  for (const oppId of newState.mainOppositionIds) {
    const partyIdx = newState.parties.findIndex((p) => p.id === oppId);
    if (partyIdx === -1) continue;

    const party = newState.parties[partyIdx];
    const lastDay = party.strategyReassessmentDay ?? 0;

    if (reassessStrategy(gameContext.day, lastDay)) {
      const strategy = determineOppositionStrategy({
        approval: gameContext.approval,
        stability: gameContext.stability,
        economicHealth: gameContext.stability, // use stability as proxy for economic health
      });
      newState.parties[partyIdx] = {
        ...party,
        oppositionStrategy: strategy,
        strategyReassessmentDay: gameContext.day,
      };
    }
  }

  // Check convention trigger
  const conventionPhase = checkConventionTrigger(gameContext.day);
  if (conventionPhase !== state.convention.phase) {
    newState.convention = {
      ...state.convention,
      phase: conventionPhase,
    };

    // Generate races when entering pre-convention
    if (conventionPhase === "pre-convention" && state.convention.races.length === 0) {
      const rulingParty = newState.parties.find((p) => p.id === newState.rulingPartyId);
      if (rulingParty) {
        newState.convention = {
          ...newState.convention,
          races: generateConventionRaces(rulingParty.id, rulingParty.nwc),
        };
      }
    }
  }

  // Drift party loyalty slightly
  const loyaltyDriftDirection = gameContext.approval >= 50 ? 0.1 : -0.1;
  newState.partyLoyaltyDrift = state.partyLoyaltyDrift + loyaltyDriftDirection;

  return newState;
}
