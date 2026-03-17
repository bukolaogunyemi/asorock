// client/src/lib/electionCycle.ts
// Election cycle engine — governor elections, post-election reset, term transitions.
// Pure functions, no mutations.

import type { GovernorAppointment, GovernorSystemState } from "./governorTypes";
import type { GovernorCandidate } from "./governorPool";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Effect,
  Consequence,
} from "./gameTypes";
import { getGovernorPool, GOVERNABLE_STATES } from "./governorPool";
import { getZoneForState } from "./zones";

// ── Constants ──

/** Presidential term length in days (4 years) */
export const TERM_LENGTH_DAYS = 1461;

// ── Result types ──

export interface GovernorElectionResult {
  newGovernors: GovernorAppointment[];
  characters: Record<string, CharacterState>;
  events: ActiveEvent[];
}

export interface ElectionCycleResult {
  updatedState: GameState;
  events: ActiveEvent[];
  isElectionDay: boolean;
}

// ── Helpers ──

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Party strength by zone — mirrors governorPool.ts data */
const PARTY_ZONE_STRENGTH: Record<string, Record<string, number>> = {
  NW: { ADU: 40, PFC: 25, NDM: 15, NSF: 10, TLA: 5, HDP: 3, PAP: 1, UPA: 1 },
  NE: { ADU: 35, PFC: 30, NDM: 15, NSF: 10, TLA: 5, HDP: 3, PAP: 1, UPA: 1 },
  NC: { ADU: 30, PFC: 30, NDM: 15, NSF: 10, TLA: 5, HDP: 5, PAP: 3, UPA: 2 },
  SW: { ADU: 25, PFC: 35, NDM: 15, NSF: 8, TLA: 7, HDP: 5, PAP: 3, UPA: 2 },
  SE: { ADU: 15, PFC: 20, NDM: 25, NSF: 15, TLA: 10, HDP: 8, PAP: 5, UPA: 2 },
  SS: { ADU: 20, PFC: 25, NDM: 20, NSF: 15, TLA: 8, HDP: 5, PAP: 5, UPA: 2 },
};

function getPartyStrengthInZone(party: string, zoneAbbrev: string): number {
  const weights = PARTY_ZONE_STRENGTH[zoneAbbrev] ?? PARTY_ZONE_STRENGTH.NC;
  return weights[party] ?? 1;
}

function governorCandidateToCharacter(candidate: GovernorCandidate): CharacterState {
  return {
    name: candidate.name,
    portfolio: `Governor of ${candidate.state}`,
    competencies: {
      professional: {
        economics: 50,
        diplomacy: 50,
        security: 50,
        media: 50,
        legal: 50,
        administration: candidate.competence,
        technology: 50,
      },
      personal: {
        loyalty: 50,
        charisma: Math.round((candidate.popularity * 2 + 30) / 3),
        leadership: Math.round((candidate.popularity * 2 + 30) / 3),
        ambition: 60,
        integrity: 50,
        resilience: 50,
        intrigue: 40,
      },
    },
    faction: "",
    relationship: "Neutral",
    avatar: candidate.avatar,
    age: candidate.age,
    state: candidate.state,
    gender: candidate.gender,
    traits: candidate.traits,
    hooks: [],
    careerHistory: [],
    interactionLog: [],
    biography: candidate.bio,
    education: candidate.education,
    religion: candidate.religion,
    ethnicity: candidate.ethnicity,
    party: candidate.party,
  };
}

// ── 1. shouldTriggerElection ──

/**
 * Returns true if the current day has reached the governor system's next election day.
 * Only triggers once — checks that we're exactly on the election day (not past it
 * with the election already processed, indicated by nextElectionDay having been advanced).
 */
export function shouldTriggerElection(state: GameState): boolean {
  return state.day >= state.governorSystem.nextElectionDay;
}

// ── 2. runGovernorElections ──

/**
 * Compute an election score for a candidate in a specific state/zone.
 * Weights: competence 30%, popularity 30%, financial strength 20%, party zone strength 20%.
 * Incumbent advantage: +10 bonus if competence > 50 and cooperation > 40.
 */
function computeCandidateScore(
  candidate: GovernorCandidate,
  zoneAbbrev: string,
  incumbentCooperation: number | null,
  rng: () => number,
): number {
  const competenceScore = candidate.competence * 0.3;
  const popularityScore = candidate.popularity * 0.3;
  const financialScore = candidate.financialStrength * 0.2;
  const partyScore = getPartyStrengthInZone(candidate.party, zoneAbbrev) * 0.2;

  let incumbentBonus = 0;
  if (
    incumbentCooperation !== null &&
    candidate.incumbentAdvantage &&
    candidate.competence > 50 &&
    incumbentCooperation > 40
  ) {
    incumbentBonus = 10;
  }

  // Add random noise ±5 to simulate election uncertainty
  const noise = (rng() * 10 - 5);

  return competenceScore + popularityScore + financialScore + partyScore + incumbentBonus + noise;
}

/**
 * Simulate all 36 gubernatorial elections simultaneously.
 * For each state, candidates compete based on competence, popularity, financial strength,
 * party zone strength, and incumbent advantage.
 */
export function runGovernorElections(
  state: GameState,
  rng: () => number,
): GovernorElectionResult {
  const pool = getGovernorPool();
  const newGovernors: GovernorAppointment[] = [];
  const characters: Record<string, CharacterState> = {};
  const usedNames = new Set<string>();

  // Build a lookup of current governors by state for incumbent advantage
  const currentGovernorsByState: Record<string, GovernorAppointment> = {};
  for (const gov of state.governorSystem.governors) {
    currentGovernorsByState[gov.state] = gov;
  }

  const winners: string[] = [];

  for (const stateName of GOVERNABLE_STATES) {
    const zone = getZoneForState(stateName);
    const zoneAbbrev = zone?.abbrev ?? "NC";

    // Get candidates for this state
    const stateCandidates = pool.filter(
      c => c.state === stateName && !usedNames.has(c.name),
    );

    if (stateCandidates.length === 0) continue;

    // Get current governor's cooperation for incumbent advantage
    const currentGov = currentGovernorsByState[stateName];

    // Score all candidates
    const scored = stateCandidates.map(candidate => {
      const isIncumbent = currentGov && candidate.name === currentGov.characterName;
      const incumbentCooperation = isIncumbent ? currentGov.cooperation : null;

      return {
        candidate,
        score: computeCandidateScore(candidate, zoneAbbrev, incumbentCooperation, rng),
      };
    });

    // Sort by score descending — winner takes the seat
    scored.sort((a, b) => b.score - a.score);
    const winner = scored[0].candidate;

    usedNames.add(winner.name);
    winners.push(`${winner.name} (${winner.party}) wins ${stateName}`);

    newGovernors.push({
      state: stateName,
      characterName: winner.name,
      party: winner.party,
      electedDay: state.day,
      term: currentGov && winner.name === currentGov.characterName
        ? currentGov.term + 1
        : 1,
      cooperation: 50, // Fresh cooperation for new term
    });

    characters[winner.name] = governorCandidateToCharacter(winner);
  }

  // Generate summary event
  const events: ActiveEvent[] = [
    {
      id: `general-election-governorship-${state.day}`,
      title: "General Election Results: Governorship",
      severity: "info",
      description: `All 36 gubernatorial elections have concluded. ${newGovernors.length} governors have been elected or re-elected across the federation.`,
      category: "politics",
      source: "contextual",
      createdDay: state.day,
      choices: [
        {
          id: `acknowledge-gov-elections-${state.day}`,
          label: "Acknowledge Results",
          context: `${newGovernors.length} governors elected across all 36 states. The new governors will need to establish working relationships with the federal government.`,
          consequences: [
            {
              id: `gov-election-aftermath-${state.day}`,
              sourceEvent: `general-election-governorship-${state.day}`,
              description: "Governor elections concluded peacefully",
              effects: [
                { target: "stability" as Effect["target"], delta: 2, description: "Peaceful gubernatorial transition boosts stability" },
              ],
              delayDays: 0,
            },
          ],
        },
      ],
    },
  ];

  return { newGovernors, characters, events };
}

// ── 3. processPostElectionReset ──

/**
 * Reset game state for a new presidential term after elections.
 * - Directors: keep appointments, reset technocratsFired to 0
 * - Governors: replace with election results
 * - Forum chair: reset (re-elected at day 28 post-election)
 * - Legislature: leadership flags reset so elections re-fire
 * - Judiciary, union leaders: carry over unchanged
 */
export function processPostElectionReset(
  state: GameState,
  electionResult: GovernorElectionResult,
  electionDay: number,
): GameState {
  return {
    ...state,
    // Directors: keep appointments, reset technocratsFired
    directors: {
      ...state.directors,
      technocratsFired: 0,
    },
    // Governors: replace with election results
    governorSystem: {
      governors: electionResult.newGovernors,
      forumChair: null,
      forumChairElectedDay: null,
      nextElectionDay: electionDay + TERM_LENGTH_DAYS,
    },
    // Merge new governor characters into existing characters
    characters: {
      ...state.characters,
      ...electionResult.characters,
    },
    // Add election events
    activeEvents: [
      ...state.activeEvents,
      ...electionResult.events,
    ],
  };
}

// ── 4. processElectionCycle ──

/**
 * Main orchestrator for the election cycle.
 * Checks if it's election day, runs governor elections, and processes post-election reset.
 */
export function processElectionCycle(
  state: GameState,
  rng: () => number,
): ElectionCycleResult {
  if (!shouldTriggerElection(state)) {
    return {
      updatedState: state,
      events: [],
      isElectionDay: false,
    };
  }

  // Run governor elections
  const electionResult = runGovernorElections(state, rng);

  // Process post-election reset
  const updatedState = processPostElectionReset(state, electionResult, state.day);

  return {
    updatedState,
    events: electionResult.events,
    isElectionDay: true,
  };
}
