// client/src/lib/unionEngine.ts
// Union leader turn processing engine — pure functions, no mutations.

import type { UnionPosition, UnionPositionId, UnionLeaderState } from "./unionTypes";
import type { UnionLeaderCandidate } from "./unionLeaderPool";
import type {
  GameState,
  CharacterState,
  ActiveEvent,
  Consequence,
  Effect,
  Relationship,
} from "./gameTypes";
import { UNION_LEADER_CANDIDATES } from "./unionLeaderPool";
import { getZoneForState } from "./zones";

// ── Union Position Definitions ──

export const UNION_POSITIONS: UnionPosition[] = [
  { id: "chairman-teachers-union", title: "Chairman, Teachers Union", influence: ["education"], strikeThreshold: 60 },
  { id: "chairman-labour-union", title: "Chairman, Labour Congress", influence: ["stability", "economy"], strikeThreshold: 55 },
  { id: "chairman-trade-congress", title: "Chairman, Trade Congress", influence: ["economy"], strikeThreshold: 65 },
  { id: "chairman-youth-forum", title: "Chairman, Youth Forum", influence: ["youthEmployment", "stability"], strikeThreshold: 70 },
  { id: "chairman-petroleum-workers", title: "Chairman, Petroleum Workers", influence: ["economy", "treasury"], strikeThreshold: 50 },
  { id: "chairman-medical-association", title: "Chairman, Medical Association", influence: ["healthSector"], strikeThreshold: 60 },
];

// ── Local types ──

export interface UnionPressureResult {
  newEvents: ActiveEvent[];
  consequences: Consequence[];
  grievanceLevels: Record<UnionPositionId, number>;
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

/** Map union position to the GameState sector key for grievance calculation */
const SECTOR_MAP: Record<UnionPositionId, string> = {
  "chairman-teachers-union": "education",
  "chairman-labour-union": "stability",
  "chairman-trade-congress": "economy",
  "chairman-youth-forum": "youthEmployment",
  "chairman-petroleum-workers": "economy",
  "chairman-medical-association": "healthSector",
};

/** Relationship modifiers for grievance calculation */
const RELATIONSHIP_GRIEVANCE: Record<Relationship, number> = {
  Loyal: -10,
  Friendly: -5,
  Neutral: 0,
  Wary: 5,
  Distrustful: 10,
  Hostile: 15,
};

/** Get a sector score from the GameState (sector health value) */
function getSectorScore(state: GameState, sectorKey: string): number {
  // GovernanceSectorState objects have a .health property
  const sector = (state as any)[sectorKey];
  if (sector && typeof sector === "object" && typeof sector.health === "number") {
    return sector.health;
  }
  // Fallback for numeric fields (stability, economy proxy via treasury, etc.)
  if (typeof sector === "number") {
    return sector;
  }
  // For "economy" — use a proxy from macroEconomy (GDP growth mapped to 0-100 scale)
  if (sectorKey === "economy") {
    // Use a composite: lower inflation + higher reserves + oil output = better score
    const macro = state.macroEconomy;
    const inflationPenalty = clamp(macro.inflation - 10, 0, 40);
    return clamp(60 - inflationPenalty + (macro.oilOutput - 1.5) * 10, 0, 100);
  }
  return 50; // Default neutral
}

// ── 1. computeUnionGrievance ──

export function computeUnionGrievance(
  position: UnionPosition,
  leader: CharacterState,
  state: GameState,
): number {
  const sectorKey = SECTOR_MAP[position.id];
  const sectorScore = getSectorScore(state, sectorKey);

  // Base grievance from sector health
  // Scale: sector at 0 → grievance 50, sector at 50 → grievance 0
  let grievance = 0;
  if (sectorScore < 50) {
    grievance += (50 - sectorScore);
  }

  // Find the candidate's strikeReadiness from the pool (stored in traits or we derive)
  // We look up the original candidate by name for strikeReadiness
  const candidate = UNION_LEADER_CANDIDATES.find(c => c.name === leader.name);
  const strikeReadiness = candidate?.strikeReadiness ?? 50;

  // Amplify by strikeReadiness
  grievance *= (1 + strikeReadiness / 200);

  // Relationship modifier
  const relMod = RELATIONSHIP_GRIEVANCE[leader.relationship] ?? 0;
  grievance += relMod;

  return clamp(Math.round(grievance * 100) / 100, 0, 100);
}

// ── 2. processUnionPressure ──

export function processUnionPressure(
  state: GameState,
  rng: () => number,
): UnionPressureResult {
  const newEvents: ActiveEvent[] = [];
  const consequences: Consequence[] = [];
  const grievanceLevels: Record<string, number> = {} as Record<UnionPositionId, number>;

  const positions = state.unionLeaders.positions.length > 0
    ? state.unionLeaders.positions
    : UNION_POSITIONS;

  for (const position of positions) {
    const leaderName = state.unionLeaders.appointments[position.id];
    if (!leaderName) {
      grievanceLevels[position.id] = 0;
      continue;
    }

    const leader = state.characters[leaderName];
    if (!leader) {
      grievanceLevels[position.id] = 0;
      continue;
    }

    const grievance = computeUnionGrievance(position, leader, state);
    grievanceLevels[position.id] = grievance;

    // Strike threat events when grievance exceeds threshold
    if (grievance > position.strikeThreshold) {
      const severity = grievance > 80 ? "critical" : grievance > 60 ? "warning" : "info";

      const strikeEvent: ActiveEvent = {
        id: `union-strike-threat-${position.id}-${state.day}`,
        title: `${position.title}: Strike Threat`,
        severity,
        description: `${leaderName} has issued a strike warning. Grievance level: ${Math.round(grievance)}. The union demands immediate government attention to ${position.influence.join(", ")} sector conditions.`,
        category: "governance",
        source: "contextual",
        createdDay: state.day,
        choices: [
          {
            id: `negotiate-${position.id}`,
            label: "Negotiate",
            context: "Open dialogue with the union leadership to find common ground and avert strike action.",
            consequences: [
              mkConsequence(
                `negotiate-${position.id}-${state.day}`,
                `union-strike-threat-${position.id}`,
                "Negotiations cost political capital but prevent strike",
                [mkEffect("approval", -1, "Public sees president bending to union pressure")],
              ),
            ],
          },
          {
            id: `concede-${position.id}`,
            label: "Concede to demands",
            context: "Accept the union's demands in full to prevent disruption.",
            consequences: [
              mkConsequence(
                `concede-${position.id}-${state.day}`,
                `union-strike-threat-${position.id}`,
                "Government concedes to union demands",
                [
                  mkEffect("approval", -2, "Critics attack government weakness"),
                  mkEffect("treasury", -3, "Union demands strain the treasury"),
                ],
              ),
            ],
          },
          {
            id: `stand-firm-${position.id}`,
            label: "Stand firm",
            context: "Refuse to negotiate under threat of strike action.",
            consequences: [
              mkConsequence(
                `stand-firm-${position.id}-${state.day}`,
                `union-strike-threat-${position.id}`,
                "Government stands firm against union pressure",
                [
                  mkEffect("stability", -2, "Union tensions escalate"),
                ],
              ),
            ],
          },
        ],
      };

      newEvents.push(strikeEvent);

      // High grievance + confrontational trait = chance of immediate strike action
      if (grievance > 85) {
        const hasConfrontational = leader.traits.some(t =>
          ["Confrontational", "Firebrand", "Uncompromising", "Combative", "Fearless"].includes(t)
        );
        if (hasConfrontational && rng() < 0.3) {
          consequences.push(
            mkConsequence(
              `immediate-strike-${position.id}-${state.day}`,
              `union-strike-threat-${position.id}`,
              `${leaderName} calls immediate strike action`,
              [
                mkEffect("stability", -3, `${position.title} strike disrupts the nation`),
                mkEffect("approval", -2, "Public anger at government failure to prevent strike"),
              ],
            ),
          );
        }
      }
    }

    // Low grievance + cooperative leader = occasional positive event
    if (grievance < 30) {
      const hasCooperativeTrait = leader.traits.some(t =>
        ["Moderate", "Pragmatist", "Diplomatic", "Collaborative", "Consensus-Builder", "Patient"].includes(t)
      );
      if (hasCooperativeTrait && rng() < 0.15) {
        const endorsementEvent: ActiveEvent = {
          id: `union-endorsement-${position.id}-${state.day}`,
          title: `${position.title}: Union Endorsement`,
          severity: "info",
          description: `${leaderName} has publicly endorsed the government's approach to ${position.influence.join(", ")} sector reform, boosting public confidence.`,
          category: "governance",
          source: "contextual",
          createdDay: state.day,
          choices: [
            {
              id: `accept-endorsement-${position.id}`,
              label: "Accept endorsement",
              context: "Welcome the union's public support.",
              consequences: [
                mkConsequence(
                  `endorsement-${position.id}-${state.day}`,
                  `union-endorsement-${position.id}`,
                  "Union endorsement boosts approval",
                  [mkEffect("approval", 1, "Union endorsement improves public confidence")],
                ),
              ],
            },
          ],
        };
        newEvents.push(endorsementEvent);
      }
    }
  }

  return {
    newEvents,
    consequences,
    grievanceLevels: grievanceLevels as Record<UnionPositionId, number>,
  };
}

// ── 3. seedUnionLeaders ──

function unionCandidateToCharacter(
  candidate: UnionLeaderCandidate,
  position: UnionPosition,
): CharacterState {
  return {
    name: candidate.name,
    portfolio: position.title,
    competencies: candidate.competencies,
    faction: "Labour",
    relationship: "Neutral",
    avatar: candidate.avatar,
    traits: candidate.traits,
    hooks: [],
    biography: candidate.bio,
    education: candidate.education,
    religion: candidate.religion,
    ethnicity: candidate.ethnicity,
    age: candidate.age,
    state: candidate.state,
    gender: candidate.gender,
    title: position.title,
    careerHistory: [],
    interactionLog: [],
  };
}

export function seedUnionLeaders(
  seed: number,
): { state: UnionLeaderState; characters: Record<string, CharacterState> } {
  // Use a simple seeded RNG inline (avoid import cycle)
  let s = seed;
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  const characters: Record<string, CharacterState> = {};
  const appointments: Record<UnionPositionId, string | null> = {
    "chairman-teachers-union": null,
    "chairman-labour-union": null,
    "chairman-trade-congress": null,
    "chairman-youth-forum": null,
    "chairman-petroleum-workers": null,
    "chairman-medical-association": null,
  };
  const usedCandidates = new Set<string>();
  const zoneUsage: Record<string, number> = {};

  for (const position of UNION_POSITIONS) {
    const qualified = UNION_LEADER_CANDIDATES.filter(
      c => c.qualifiedFor.includes(position.id) && !usedCandidates.has(c.name),
    );

    if (qualified.length === 0) {
      continue;
    }

    // Sort by zone balance (prefer underrepresented zones)
    const sorted = [...qualified].sort((a, b) => {
      const zoneA = getZoneForState(a.state)?.name ?? "";
      const zoneB = getZoneForState(b.state)?.name ?? "";
      return (zoneUsage[zoneA] ?? 0) - (zoneUsage[zoneB] ?? 0);
    });

    // Pick from top candidates with some randomness
    const topN = sorted.slice(0, Math.min(3, sorted.length));
    const pick = topN[Math.floor(rng() * topN.length)];

    usedCandidates.add(pick.name);
    const zone = getZoneForState(pick.state)?.name ?? "unknown";
    zoneUsage[zone] = (zoneUsage[zone] ?? 0) + 1;

    const charState = unionCandidateToCharacter(pick, position);
    characters[pick.name] = charState;
    appointments[position.id] = pick.name;
  }

  return {
    state: {
      positions: UNION_POSITIONS,
      appointments,
    },
    characters,
  };
}
