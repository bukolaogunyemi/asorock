// client/src/lib/governorPool.ts
// Procedurally generated pool of 144 governor candidates (4 per state × 36 states)

import { generateCharacterPool } from "./characterPoolGenerator";
import { GEOPOLITICAL_ZONES, getZoneForState } from "./zones";
import { seededRandom } from "./seededRandom";

export interface GovernorCandidate {
  name: string;
  state: string;
  zone: string;
  party: string;
  age: number;
  gender: "Male" | "Female";
  religion: string;
  ethnicity: string;
  avatar: string;
  traits: string[];
  bio: string;
  education: string;
  competence: number;        // 40–90, derived from professional competencies
  popularity: number;        // 30–85, derived from charisma + leadership
  financialStrength: number; // 20–80, campaign war chest proxy
  incumbentAdvantage: boolean;
}

// Party strength by zone
const PARTY_ZONE_STRENGTH: Record<string, Record<string, number>> = {
  NW: { ADU: 40, PFC: 25, NDM: 15, NSF: 10, TLA: 5, HDP: 3, PAP: 1, UPA: 1 },
  NE: { ADU: 35, PFC: 30, NDM: 15, NSF: 10, TLA: 5, HDP: 3, PAP: 1, UPA: 1 },
  NC: { ADU: 30, PFC: 30, NDM: 15, NSF: 10, TLA: 5, HDP: 5, PAP: 3, UPA: 2 },
  SW: { ADU: 25, PFC: 35, NDM: 15, NSF: 8, TLA: 7, HDP: 5, PAP: 3, UPA: 2 },
  SE: { ADU: 15, PFC: 20, NDM: 25, NSF: 15, TLA: 10, HDP: 8, PAP: 5, UPA: 2 },
  SS: { ADU: 20, PFC: 25, NDM: 20, NSF: 15, TLA: 8, HDP: 5, PAP: 5, UPA: 2 },
};

const ALL_PARTIES = ["ADU", "PFC", "NDM", "NSF", "TLA", "HDP", "PAP", "UPA"];

const GOVERNOR_TRAITS = [
  "Infrastructure Builder", "Populist", "Technocrat", "Godfather's Pick",
  "Grassroots Politician", "Former Senator", "Business Mogul", "Civil Servant",
  "Reformer", "Security Hardliner", "Ethnic Champion", "Youth Icon",
  "Former Commissioner", "Party Loyalist", "Independent Thinker", "Media Darling",
  "Development Focused", "Patronage Master", "Legal Mind", "Public Health Advocate",
];

/** All 36 governable states — FCT excluded (no elected governor) */
export const GOVERNABLE_STATES: string[] = GEOPOLITICAL_ZONES.flatMap(z =>
  z.states.filter(s => s !== "FCT"),
);

/**
 * Pick 4 distinct parties for a state's candidates, weighted by zone strength.
 * Candidate 0 always gets the top-weight party for the zone.
 */
function pickPartiesForZone(zoneAbbrev: string, rng: () => number): [string, string, string, string] {
  const weights = PARTY_ZONE_STRENGTH[zoneAbbrev] ?? PARTY_ZONE_STRENGTH.NC;
  const sorted = [...ALL_PARTIES].sort((a, b) => (weights[b] ?? 0) - (weights[a] ?? 0));

  const chosen: string[] = [sorted[0]];
  const remaining = sorted.slice(1);

  while (chosen.length < 4 && remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, p) => sum + (weights[p] ?? 1), 0);
    let r = rng() * totalWeight;
    let picked = false;
    for (let i = 0; i < remaining.length; i++) {
      r -= weights[remaining[i]] ?? 1;
      if (r <= 0) {
        chosen.push(remaining[i]);
        remaining.splice(i, 1);
        picked = true;
        break;
      }
    }
    // Floating-point fallback
    if (!picked && remaining.length > 0) {
      chosen.push(remaining[0]);
      remaining.splice(0, 1);
    }
  }

  return chosen.slice(0, 4) as [string, string, string, string];
}

/** Derive competence (40–90) from average professional competencies */
function deriveCompetence(professional: Record<string, number>): number {
  const vals = Object.values(professional);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(Math.max(40, Math.min(90, avg)));
}

/** Derive popularity (30–85) from charisma + leadership average */
function derivePopularity(personal: Record<string, number>): number {
  const charisma = personal.charisma ?? 60;
  const leadership = personal.leadership ?? 60;
  return Math.round(Math.max(30, Math.min(85, (charisma + leadership) / 2)));
}

/** Derive financialStrength (20–80) from ambition and integrity inverse */
function deriveFinancialStrength(personal: Record<string, number>, rng: () => number): number {
  const ambition = personal.ambition ?? 50;
  const integrityInverse = 100 - (personal.integrity ?? 50);
  const raw = ambition * 0.4 + integrityInverse * 0.3 + rng() * 20 + 10;
  return Math.round(Math.max(20, Math.min(80, raw)));
}

export function generateGovernorPool(seed = 9001): GovernorCandidate[] {
  const pool: GovernorCandidate[] = [];

  for (let si = 0; si < GOVERNABLE_STATES.length; si++) {
    const state = GOVERNABLE_STATES[si];
    const zone = getZoneForState(state);
    const zoneAbbrev = zone?.abbrev ?? "NC";

    // Use a unique seed per state to ensure name diversity across states
    const stateSeed = seed + si * 1009 + 7;
    const rng = seededRandom(stateSeed);

    // Pick 4 distinct parties for this state
    const parties = pickPartiesForZone(zoneAbbrev, rng);

    // Generate a batch of characters from this zone.
    // 16 ensures we have enough unique names to pick 4 from.
    const batch = generateCharacterPool({
      count: 16,
      seed: stateSeed,
      zoneDistribution: { [zoneAbbrev]: 16 },
      ageRange: { min: 35, max: 68 },
      genderBalance: { minFemalePercent: 25, minMalePercent: 25 },
      role: "governor",
      traitPool: GOVERNOR_TRAITS,
    });

    // Take the first 4 characters — they will have unique names within the batch
    for (let ci = 0; ci < 4; ci++) {
      const char = batch[ci];
      const party = parties[ci];

      const professional = char.competencies.professional as unknown as Record<string, number>;
      const personal = char.competencies.personal as unknown as Record<string, number>;
      const competence = deriveCompetence(professional);
      const popularity = derivePopularity(personal);
      const financialStrength = deriveFinancialStrength(personal, rng);

      pool.push({
        name: char.name,
        state,
        zone: zoneAbbrev,
        party,
        age: char.age,
        gender: char.gender,
        religion: char.religion,
        ethnicity: char.ethnicity,
        avatar: char.avatar,
        traits: char.traits,
        bio: char.biography,
        education: char.education,
        competence,
        popularity,
        financialStrength,
        incumbentAdvantage: false,
      });
    }
  }

  return pool;
}

export function getGovernorCandidatesForState(state: string): GovernorCandidate[] {
  return getGovernorPool().filter(c => c.state === state);
}

// Pre-generated cached pool
let _cached: GovernorCandidate[] | null = null;
export function getGovernorPool(): GovernorCandidate[] {
  if (!_cached) _cached = generateGovernorPool();
  return _cached;
}
