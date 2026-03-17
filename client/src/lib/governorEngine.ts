// client/src/lib/governorEngine.ts
// Governor system turn processing engine — pure functions, no mutations.

import type { GovernorAppointment, GovernorSystemState } from "./governorTypes";
import type { GovernorCandidate } from "./governorPool";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
} from "./gameTypes";
import { getGovernorPool, GOVERNABLE_STATES } from "./governorPool";
import { getZoneForState } from "./zones";

// ── Local types ──

export interface GovernorCooperationResult {
  updatedGovernors: GovernorAppointment[];
  events: ActiveEvent[];
}

export interface ProcessGovernorsResult {
  updatedGovernorSystem: GovernorSystemState;
  newEvents: ActiveEvent[];
  consequences: Consequence[];
}

// ── Helpers ──

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function mkConsequence(
  id: string,
  source: string,
  description: string,
  effects: Effect[],
  delayDays = 0,
): Consequence {
  return { id, sourceEvent: source, description, effects, delayDays };
}

function mkEffect(target: Effect["target"], delta: number, description: string): Effect {
  return { target, delta, description };
}

/** Party strength by zone — used to determine dominant party per zone */
const PARTY_ZONE_STRENGTH: Record<string, Record<string, number>> = {
  NW: { ADU: 40, PFC: 25, NDM: 15, NSF: 10, TLA: 5, HDP: 3, PAP: 1, UPA: 1 },
  NE: { ADU: 35, PFC: 30, NDM: 15, NSF: 10, TLA: 5, HDP: 3, PAP: 1, UPA: 1 },
  NC: { ADU: 30, PFC: 30, NDM: 15, NSF: 10, TLA: 5, HDP: 5, PAP: 3, UPA: 2 },
  SW: { ADU: 25, PFC: 35, NDM: 15, NSF: 8, TLA: 7, HDP: 5, PAP: 3, UPA: 2 },
  SE: { ADU: 15, PFC: 20, NDM: 25, NSF: 15, TLA: 10, HDP: 8, PAP: 5, UPA: 2 },
  SS: { ADU: 20, PFC: 25, NDM: 20, NSF: 15, TLA: 8, HDP: 5, PAP: 5, UPA: 2 },
};

function getDominantParty(zoneAbbrev: string): string {
  const weights = PARTY_ZONE_STRENGTH[zoneAbbrev] ?? PARTY_ZONE_STRENGTH.NC;
  let best = "";
  let bestWeight = -1;
  for (const [party, weight] of Object.entries(weights)) {
    if (weight > bestWeight) {
      bestWeight = weight;
      best = party;
    }
  }
  return best;
}

// ── 1. seedGovernorSystem ──

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

export function seedGovernorSystem(
  seed: number,
): { state: GovernorSystemState; characters: Record<string, CharacterState> } {
  // Simple seeded RNG (avoid import cycle)
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const pool = getGovernorPool();
  const characters: Record<string, CharacterState> = {};
  const governors: GovernorAppointment[] = [];
  const usedNames = new Set<string>();

  for (const stateName of GOVERNABLE_STATES) {
    const zone = getZoneForState(stateName);
    const zoneAbbrev = zone?.abbrev ?? "NC";
    const dominantParty = getDominantParty(zoneAbbrev);

    // Get candidates for this state
    const stateCandidates = pool.filter(c => c.state === stateName && !usedNames.has(c.name));

    if (stateCandidates.length === 0) continue;

    // Prefer dominant party candidate; fall back to highest competence
    let pick = stateCandidates.find(c => c.party === dominantParty);
    if (!pick) {
      pick = [...stateCandidates].sort((a, b) => b.competence - a.competence)[0];
    }

    // Small randomness — occasionally pick a runner-up (simulates election variance)
    if (rng() < 0.2 && stateCandidates.length > 1) {
      const alternatives = stateCandidates.filter(c => c !== pick);
      pick = alternatives[Math.floor(rng() * alternatives.length)];
    }

    usedNames.add(pick.name);

    governors.push({
      state: stateName,
      characterName: pick.name,
      party: pick.party,
      electedDay: 0,
      term: 1,
      cooperation: 50,
    });

    characters[pick.name] = governorCandidateToCharacter(pick);
  }

  return {
    state: {
      governors,
      forumChair: null,
      forumChairElectedDay: null,
      nextElectionDay: 1461,
    },
    characters,
  };
}

// ── 2. processGovernorCooperation ──

export function processGovernorCooperation(
  state: GameState,
  rng: () => number,
): GovernorCooperationResult {
  const rulingParty = state.partyInternals?.rulingPartyId?.toUpperCase() ?? state.presidentParty?.toUpperCase() ?? "";
  const events: ActiveEvent[] = [];

  const updatedGovernors = state.governorSystem.governors.map(gov => {
    let cooperation = gov.cooperation;

    // Same party drift
    if (gov.party.toUpperCase() === rulingParty) {
      cooperation += 1;
    } else {
      cooperation -= 0.5;
    }

    // Approval effects
    if (state.approval > 60) {
      cooperation += 0.3;
    }
    if (state.approval < 35) {
      cooperation -= 0.5;
    }

    // Random noise ±1
    cooperation += (rng() * 2 - 1);

    cooperation = clamp(Math.round(cooperation * 100) / 100, 0, 100);

    // Generate warning events
    if (cooperation < 10) {
      events.push({
        id: `governor-hostile-${gov.state}-${state.day}`,
        title: `Governor of ${gov.state} is openly hostile`,
        severity: "critical",
        description: `${gov.characterName}, Governor of ${gov.state}, has become openly hostile to the federal government. Cooperation has deteriorated to dangerous levels.`,
        category: "politics",
        source: "contextual",
        createdDay: state.day,
        choices: [
          {
            id: `gov-engage-${gov.state}`,
            label: "Send envoy to engage",
            context: "Dispatch a presidential envoy to open dialogue with the governor.",
            consequences: [
              mkConsequence(
                `gov-engage-${gov.state}-${state.day}`,
                `governor-hostile-${gov.state}`,
                "Envoy dispatched to ease tensions",
                [mkEffect("stability", -1, "Federal-state tensions make headlines")],
              ),
            ],
          },
          {
            id: `gov-ignore-${gov.state}`,
            label: "Ignore the governor",
            context: "Let the situation play out without federal intervention.",
            consequences: [
              mkConsequence(
                `gov-ignore-${gov.state}-${state.day}`,
                `governor-hostile-${gov.state}`,
                "Governor continues to undermine federal authority",
                [mkEffect("stability", -2, "Open federal-state conflict erodes stability")],
              ),
            ],
          },
        ],
      });
    } else if (cooperation < 25) {
      events.push({
        id: `governor-uncooperative-${gov.state}-${state.day}`,
        title: `Governor of ${gov.state} is becoming uncooperative`,
        severity: "warning",
        description: `${gov.characterName}, Governor of ${gov.state}, is showing signs of resistance to federal policy. Cooperation is declining.`,
        category: "politics",
        source: "contextual",
        createdDay: state.day,
        choices: [
          {
            id: `gov-dialogue-${gov.state}`,
            label: "Open dialogue",
            context: "Reach out to the governor to address concerns.",
            consequences: [
              mkConsequence(
                `gov-dialogue-${gov.state}-${state.day}`,
                `governor-uncooperative-${gov.state}`,
                "Dialogue opened with uncooperative governor",
                [mkEffect("approval", -1, "Political attention diverted to governor dispute")],
              ),
            ],
          },
        ],
      });
    }

    return { ...gov, cooperation };
  });

  return { updatedGovernors, events };
}

// ── 3. electGovernorsForumChair ──

export function electGovernorsForumChair(
  state: GameState,
  rng: () => number,
): ActiveEvent {
  const governors = state.governorSystem.governors;

  // Score each governor by cooperation + competence (from character state)
  const scored = governors.map(gov => {
    const char = state.characters[gov.characterName];
    const competence = char?.competencies?.professional?.administration ?? 50;
    return {
      gov,
      score: gov.cooperation + competence,
    };
  });

  // Sort by score descending and pick top 3
  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  // Small shuffle among top candidates
  for (let i = top3.length - 1; i > 0; i--) {
    if (rng() < 0.3) {
      const j = Math.floor(rng() * (i + 1));
      [top3[i], top3[j]] = [top3[j], top3[i]];
    }
  }

  const rulingParty = state.partyInternals?.rulingPartyId?.toUpperCase() ?? state.presidentParty?.toUpperCase() ?? "";

  const choices = top3.map(({ gov }) => {
    const isSameParty = gov.party.toUpperCase() === rulingParty;
    const effects: Effect[] = [];
    if (isSameParty) {
      effects.push(mkEffect("approval", 1, "Same-party governor becomes Forum Chair — alignment with presidency"));
    }
    effects.push(mkEffect("stability", 1, "Governors' Forum election concludes peacefully"));

    return {
      id: `endorse-gov-chair-${gov.characterName}`,
      label: `Endorse ${gov.characterName} (${gov.party}, ${gov.state})`,
      context: `${gov.characterName} is a ${isSameParty ? "party ally" : "cross-party figure"} from ${gov.state} with cooperation level ${Math.round(gov.cooperation)}.`,
      consequences: [
        mkConsequence(
          `gov-chair-elected-${gov.characterName}-${state.day}`,
          "governors-forum-chair-election",
          `${gov.characterName} elected Governors' Forum Chair`,
          effects,
        ),
      ],
    };
  });

  return {
    id: `governors-forum-chair-election-${state.day}`,
    title: "Governors' Forum: Chairman Election",
    severity: "info",
    description: "The 36 state governors are convening to elect a new Chairman of the Governors' Forum. Your endorsement could sway the outcome and signal federal-state alignment.",
    category: "politics",
    source: "contextual",
    createdDay: state.day,
    choices,
  };
}

// ── 4. processGovernors ──

export function processGovernors(
  state: GameState,
  rng: () => number,
): ProcessGovernorsResult {
  const newEvents: ActiveEvent[] = [];
  const consequences: Consequence[] = [];

  // 1. Process cooperation drift
  const cooperationResult = processGovernorCooperation(state, rng);
  const updatedGovernors = cooperationResult.updatedGovernors;
  newEvents.push(...cooperationResult.events);

  // 2. Check if day 28 → trigger forum chair election
  if (state.day === 28 && state.governorSystem.forumChair === null) {
    // Use the state with updated governors for the election
    const stateWithUpdatedGovs: GameState = {
      ...state,
      governorSystem: {
        ...state.governorSystem,
        governors: updatedGovernors,
      },
    };
    const chairEvent = electGovernorsForumChair(stateWithUpdatedGovs, rng);
    newEvents.push(chairEvent);
  }

  // 3. Check if day === nextElectionDay → election cycle (placeholder for Chunk 9)
  // TODO: Implement full governor election cycle

  return {
    updatedGovernorSystem: {
      ...state.governorSystem,
      governors: updatedGovernors,
    },
    newEvents,
    consequences,
  };
}
